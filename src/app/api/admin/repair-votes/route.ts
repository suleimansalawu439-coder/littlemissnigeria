import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ONE-TIME repair endpoint.
// Recalculates every contestant's totalVotes by summing votesAdded
// from their SUCCESS payments only — the payments table is the source of truth.
// Protected by CRON_SECRET. Hit it once, then it's safe to call again anytime
// since it is fully idempotent (recalculates from scratch each time).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get('secret');

  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all contestants
    const contestants = await prisma.contestant.findMany({
      select: { id: true, name: true, totalVotes: true },
    });

    const results = [];

    for (const contestant of contestants) {
      // Sum votesAdded from SUCCESS payments only — this is the ground truth
      const agg = await prisma.payment.aggregate({
        where: {
          contestantId: contestant.id,
          status: 'SUCCESS',
        },
        _sum: { votesAdded: true },
      });

      const correctVotes = agg._sum.votesAdded ?? 0;

      // Update contestant's totalVotes to the correct value
      await prisma.contestant.update({
        where: { id: contestant.id },
        data: { totalVotes: correctVotes },
      });

      results.push({
        name: contestant.name,
        before: contestant.totalVotes,
        after: correctVotes,
        corrected: contestant.totalVotes !== correctVotes,
      });
    }

    const totalBefore = results.reduce((s, r) => s + r.before, 0);
    const totalAfter  = results.reduce((s, r) => s + r.after,  0);

    return NextResponse.json({
      message: 'Vote counts repaired successfully from SUCCESS payments.',
      totalVotesBefore: totalBefore,
      totalVotesAfter: totalAfter,
      contestants: results,
    });
  } catch (error) {
    console.error('Repair error:', error);
    return NextResponse.json(
      { error: 'Internal server error during repair.' },
      { status: 500 }
    );
  }
}
