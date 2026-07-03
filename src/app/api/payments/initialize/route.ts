import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VOTE_PRICE_KOBO = 10000; // ₦100 per vote in kobo

function generateReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `LMN-${timestamp}-${random}`.toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contestantId, voterName, email, phoneNumber, votes } = body;

    // Validate required fields
    if (!contestantId || !voterName || !email || !phoneNumber || !votes) {
      return NextResponse.json(
        { error: 'Missing required fields: contestantId, voterName, email, phoneNumber, votes' },
        { status: 400 }
      );
    }

    // Validate vote count
    if (!votes || isNaN(votes) || votes < 1) {
      return NextResponse.json(
        { error: 'Invalid vote count. Must be at least 1.' },
        { status: 400 }
      );
    }

    const amount = votes * VOTE_PRICE_KOBO;

    // Get voter IP address
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Verify contestant exists
    const contestant = await prisma.contestant.findUnique({
      where: { id: contestantId },
    });

    if (!contestant) {
      return NextResponse.json(
        { error: 'Contestant not found' },
        { status: 404 }
      );
    }

    // Generate a unique reference
    const reference = generateReference();

    // Create a pending payment record
    const payment = await prisma.payment.create({
      data: {
        reference,
        contestantId,
        voterName,
        email,
        phoneNumber,
        votesAdded: votes,
        amount,
        ipAddress,
        status: 'PENDING',
      },
    });

    // Initialize Paystack transaction
    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount,
          reference: payment.reference,
          callback_url: `${process.env.NEXTAUTH_URL}/api/payments/verify`,
          metadata: {
            contestantId,
            voterName,
            phoneNumber,
            votes,
            paymentId: payment.id,
          },
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      // Update payment to failed if Paystack initialization fails
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      return NextResponse.json(
        { error: 'Failed to initialize payment', details: paystackData.message },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackData.data.authorization_url,
      reference: payment.reference,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
