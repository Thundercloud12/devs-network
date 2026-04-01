import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getRoomLocks } from '@/lib/redis';
import CodingRoom from '@/models/CodingRoom';
import { connectDb } from '@/lib/dbConect';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const roomId = searchParams.get('roomId');

  // Validate params
  if (!roomId) {
    return NextResponse.json(
      { error: 'Missing required parameter: roomId' },
      { status: 400 }
    );
  }

  // Get session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    await connectDb();

    // Verify room exists and user is in it
    const room = await CodingRoom.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const isHost = room.host.toString() === userId;
    const isParticipant = room.participants.some(
      (p: any) => p.toString() === userId
    );

    if (!isHost && !isParticipant) {
      return NextResponse.json(
        { error: 'User is not in this room' },
        { status: 403 }
      );
    }

    // Get all locks in room
    const locks = await getRoomLocks(roomId);

    return NextResponse.json({
      success: true,
      locks,
      count: locks.length,
    });
  } catch (error) {
    console.error('Get locks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locks' },
      { status: 500 }
    );
  }
}
