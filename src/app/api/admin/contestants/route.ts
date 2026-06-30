import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the active event
    const activeEvent = await prisma.event.findFirst({
      where: { isActive: true },
    });

    if (!activeEvent) {
      return NextResponse.json(
        { error: 'No active event found' },
        { status: 404 }
      );
    }

    // Get all contestants for the active event
    const contestants = await prisma.contestant.findMany({
      where: { eventId: activeEvent.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ contestants });
  } catch (error) {
    console.error('Error fetching contestants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, bio, imageUrl } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Find the active event
    const activeEvent = await prisma.event.findFirst({
      where: { isActive: true },
    });

    if (!activeEvent) {
      return NextResponse.json(
        { error: 'No active event found. Create an event first.' },
        { status: 404 }
      );
    }

    // Create the contestant and auto-assign to the active event
    const contestant = await prisma.contestant.create({
      data: {
        name,
        bio: bio || '',
        imageUrl: imageUrl || '',
        eventId: activeEvent.id,
      },
    });

    return NextResponse.json({ contestant }, { status: 201 });
  } catch (error) {
    console.error('Error creating contestant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
