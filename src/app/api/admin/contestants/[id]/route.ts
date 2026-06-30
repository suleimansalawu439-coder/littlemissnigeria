import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
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
    const { name, bio, imageUrl } = body;

    const existing = await prisma.contestant.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contestant not found' },
        { status: 404 }
      );
    }

    const contestant = await prisma.contestant.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return NextResponse.json({ contestant });
  } catch (error) {
    console.error('Error updating contestant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const existing = await prisma.contestant.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contestant not found' },
        { status: 404 }
      );
    }

    // Delete related payments first
    await prisma.payment.deleteMany({
      where: { contestantId: id },
    });

    await prisma.contestant.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Contestant deleted successfully' });
  } catch (error) {
    console.error('Error deleting contestant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
