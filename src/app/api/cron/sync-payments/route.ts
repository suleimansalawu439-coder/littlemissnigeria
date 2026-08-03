import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Called every 5 minutes by Namecheap cron job.
// Finds PENDING payments, re-verifies with Paystack, and updates
// status + votes if they succeeded. Fully idempotent — once a
// payment is marked SUCCESS it is never processed again.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get('secret');

  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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

    for (const payment of pendingPayments) {
      try {
        const paystackRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(payment.reference)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
            signal: AbortSignal.timeout(8000),
          }
        );

        if (!paystackRes.ok) {
          if (paystackRes.status === 400) {
            // 400 = reference not found on Paystack — never initiated
            await prisma.payment.update({
              where: { reference: payment.reference },
              data: { status: 'FAILED' },
            });
            failed++;
          } else {
            // Other HTTP errors — skip, retry next run
            skipped++;
          }
          continue;
        }

        const paystackData = await paystackRes.json();
        const paystackStatus = paystackData?.data?.status ?? 'unknown';

        if (paystackStatus === 'success') {
          // Atomically mark SUCCESS and increment votes (runs once per payment only)
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { reference: payment.reference },
              data: { status: 'SUCCESS' },
            });
            await tx.contestant.update({
              where: { id: payment.contestantId },
              data: { totalVotes: { increment: payment.votesAdded } },
            });
          });
          synced++;
        } else if (paystackStatus === 'failed' || paystackStatus === 'abandoned') {
          await prisma.payment.update({
            where: { reference: payment.reference },
            data: { status: 'FAILED' },
          });
          failed++;
        } else {
          // Still genuinely pending on Paystack — leave it, check next run
          skipped++;
        }
      } catch (innerError) {
        console.error(`Error syncing payment ${payment.reference}:`, innerError);
        skipped++;
      }
    }

    return NextResponse.json({
      message: `Sync complete. ${synced} succeeded, ${failed} failed, ${skipped} still pending/skipped.`,
      synced,
      failed,
      skipped,
      total: pendingPayments.length,
    });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error during sync.' },
      { status: 500 }
    );
  }
}
