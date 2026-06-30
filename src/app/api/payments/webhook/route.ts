import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const hash = crypto
      .createHmac('sha512', secret)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // Handle charge.success event
    if (event.event === 'charge.success') {
      const { reference } = event.data;

      // Find the payment by reference
      const payment = await prisma.payment.findUnique({
        where: { reference },
      });

      if (payment && payment.status === 'PENDING') {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { reference },
            data: { status: 'SUCCESS' },
          });

          await tx.contestant.update({
            where: { id: payment.contestantId },
            data: {
              totalVotes: {
                increment: payment.votesAdded,
              },
            },
          });
        });
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Paystack from retrying
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
