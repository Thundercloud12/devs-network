import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { acquireLock } from '@/lib/redis';
import { validateBlockId } from '@/lib/codeBlockParser';
import CodingRoom from '@/models/CodingRoom';
import { connectDb } from '@/lib/dbConect';

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const roomId = searchParams.get('roomId');
  const blockType = searchParams.get('blockType');
  const blockId = searchParams.get('blockId');

  // Validate params
  if (!roomId || !blockType || !blockId) {
    return NextResponse.json(
      { error: 'Missing required parameters: roomId, blockType, blockId' },
      { status: 400 }
    );
  }

  // Get session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const username = session.user.username || 'Unknown';

  try {
    await connectDb();

    // Verify room exists
    const room = await CodingRoom.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Verify user is in room (host or participant)
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

    // Validate block exists in room code
    const blockValid = validateBlockId(room.code || '', blockId, room.language);
    if (!blockValid) {
      return NextResponse.json(
        { error: `Block '${blockId}' not found in code` },
        { status: 400 }
      );
    }

    // Attempt to acquire lock
    const lockResult = await acquireLock(
      roomId,
      blockType,
      blockId,
      userId,
      username
    );

    if (!lockResult.success) {
      return NextResponse.json(
        {
          error: lockResult.message,
          lockedBy: lockResult.lockedBy,
        },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json({
      success: true,
      message: lockResult.message,
      lock: {
        blockId,
        blockType,
        lockedBy: userId,
        username,
      },
    });
  } catch (error) {
    console.error('Lock acquisition error:', error);
    return NextResponse.json(
      { error: 'Failed to acquire lock' },
      { status: 500 }
    );
  }
}
