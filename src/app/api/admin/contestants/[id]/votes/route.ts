import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, amount } = body;

    if (!action || !amount || typeof amount !== 'number' || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid request. Provide action (add/deduct) and amount (positive integer).' },
        { status: 400 }
      );
    }

    if (action !== 'add' && action !== 'deduct') {
      return NextResponse.json(
        { error: 'Action must be "add" or "deduct".' },
        { status: 400 }
      );
    }

    const contestant = await prisma.contestant.findUnique({
      where: { id },
    });

    if (!contestant) {
      return NextResponse.json(
        { error: 'Contestant not found' },
        { status: 404 }
      );
    }

    if (action === 'deduct' && contestant.totalVotes < amount) {
      return NextResponse.json(
        { error: `Cannot deduct ${amount} votes. Contestant only has ${contestant.totalVotes} votes.` },
        { status: 400 }
      );
    }

    const updated = await prisma.contestant.update({
      where: { id },
      data: {
        totalVotes: action === 'add'
          ? { increment: amount }
          : { decrement: amount },
      },
    });

    return NextResponse.json({
      contestant: updated,
      message: `Successfully ${action === 'add' ? 'added' : 'deducted'} ${amount} vote(s).`,
    });
  } catch (error) {
    console.error('Error adjusting votes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
