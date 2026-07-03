import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  if (!reference) {
    return NextResponse.redirect(new URL('/?error=missing_reference', request.url));
  }

  try {
    // Verify transaction with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    // Find the payment record by reference
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { contestant: true },
    });

    if (!payment) {
      return NextResponse.redirect(new URL('/?error=payment_not_found', request.url));
    }

    const contestantId = payment.contestantId;
    const contestantSlug = payment.contestant.slug;

    if (paystackData.data?.status === 'success') {
      // Only process if still PENDING (avoid double-processing from webhook)
      if (payment.status === 'PENDING') {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { reference },
            data: { status: 'SUCCESS' },
          });

          await tx.contestant.update({
            where: { id: contestantId },
            data: {
              totalVotes: {
                increment: payment.votesAdded,
              },
            },
          });
        });
      }

      return NextResponse.redirect(
        new URL(`/contestants/${contestantSlug}?voted=true`, request.url)
      );
    } else {
      await prisma.payment.update({
        where: { reference },
        data: { status: 'FAILED' },
      });

      return NextResponse.redirect(
        new URL(`/contestants/${contestantSlug}?voted=false`, request.url)
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.redirect(new URL('/?error=verification_failed', request.url));
  }
}
