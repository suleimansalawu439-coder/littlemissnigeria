import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// One-time endpoint to set contestant vote counts to the
// admin-verified correct values. Protected by CRON_SECRET.
// Safe to run multiple times (idempotent).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get('secret');

  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Admin-verified correct vote counts as of 2026-08-03
  const correctVotes: Record<string, number> = {
    'Chimamanda Ibeh':                                 422,
    'Janelle Imoudu':                                  747,
    'Oroh Orevaoghene':                                780,
    'Akinmuyiwa Geraldine':                            1072,
    'Immaculate Anokam':                               1438,
    'Amb. Virtuosa Ihechiziterem Ikemezuo-chintuo':    1607,
    'Angel Sabastine Ezema':                           2091,
    'Queen Aishat Salau Audu Oyinoyi':                 2450,
    'Joy Obanovwe Sakito':                             262,
  };

  try {
    const contestants = await prisma.contestant.findMany({
      select: { id: true, name: true, totalVotes: true },
    });

    const results = [];

    for (const contestant of contestants) {
      const correct = correctVotes[contestant.name];

      if (correct === undefined) {
        results.push({
          name: contestant.name,
          before: contestant.totalVotes,
          after: contestant.totalVotes,
          action: 'SKIPPED — not in verified list',
        });
        continue;
      }

      await prisma.contestant.update({
        where: { id: contestant.id },
        data: { totalVotes: correct },
      });

      results.push({
        name: contestant.name,
        before: contestant.totalVotes,
        after: correct,
        action: contestant.totalVotes === correct ? 'ALREADY CORRECT' : 'FIXED',
      });
    }

    const totalAfter = Object.values(correctVotes).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      message: 'Vote counts set to admin-verified correct values.',
      totalVotesAfter: totalAfter,
      contestants: results,
    });
  } catch (error) {
    console.error('Set votes error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
