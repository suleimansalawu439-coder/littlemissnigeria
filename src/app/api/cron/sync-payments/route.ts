import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// This endpoint is called every minute by an external cron job (e.g. Namecheap cPanel cron).
// It finds all PENDING payments, re-verifies them against Paystack,
// and updates the database + contestant vote counts if they have succeeded.
export async function GET(request: NextRequest) {
  // --- Security: validate cron secret ---
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get('secret');

  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find all payments still sitting as PENDING
    const pendingPayments = await prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: { contestant: true },
    });

    if (pendingPayments.length === 0) {
      return NextResponse.json({
        message: 'No pending payments to sync.',
        synced: 0,
        failed: 0,
        skipped: 0,
      });
    }

    let synced = 0;
    let failed = 0;
    let skipped = 0;
    const details: { reference: string; paystackStatus: string | null; action: string }[] = [];

    // Process each pending payment
    for (const payment of pendingPayments) {
      try {
        const paystackRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(payment.reference)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
            // Short timeout — we don't want one slow call to block the whole batch
            signal: AbortSignal.timeout(8000),
          }
        );

        if (!paystackRes.ok) {
          skipped++;
          details.push({ reference: payment.reference, paystackStatus: `HTTP_ERROR_${paystackRes.status}`, action: 'skipped' });
          continue;
        }

        const paystackData = await paystackRes.json();
        const paystackStatus = paystackData?.data?.status ?? 'unknown';

        if (paystackStatus === 'success') {
          // Atomically mark SUCCESS and increment votes
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { reference: payment.reference },
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
          synced++;
          details.push({ reference: payment.reference, paystackStatus, action: 'synced_success' });
        } else if (
          paystackStatus === 'failed' ||
          paystackStatus === 'abandoned'
        ) {
          await prisma.payment.update({
            where: { reference: payment.reference },
            data: { status: 'FAILED' },
          });
          failed++;
          details.push({ reference: payment.reference, paystackStatus, action: 'marked_failed' });
        } else {
          // Still pending on Paystack side — leave as is
          skipped++;
          details.push({ reference: payment.reference, paystackStatus, action: 'skipped_still_pending' });
        }
      } catch (innerError) {
        // Don't let one bad payment crash the whole batch
        console.error(`Error syncing payment ${payment.reference}:`, innerError);
        skipped++;
        details.push({ reference: payment.reference, paystackStatus: 'exception', action: 'skipped_error' });
      }
    }

    return NextResponse.json({
      message: `Sync complete. ${synced} succeeded, ${failed} failed, ${skipped} still pending/skipped.`,
      synced,
      failed,
      skipped,
      total: pendingPayments.length,
      details,
    });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error during sync.' },
      { status: 500 }
    );
  }
}
