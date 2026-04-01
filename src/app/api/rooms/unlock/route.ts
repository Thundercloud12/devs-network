import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { releaseLock, getBlockLock } from '@/lib/redis';

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

  try {
    // Verify the user holds this lock
    const currentLock = await getBlockLock(roomId, blockType, blockId);

    if (!currentLock) {
      return NextResponse.json(
        { error: 'Lock not found' },
        { status: 404 }
      );
    }

    if (currentLock.userId !== userId) {
      return NextResponse.json(
        { error: 'Only lock holder can release this lock' },
        { status: 403 }
      );
    }

    // Release the lock
    const releaseResult = await releaseLock(roomId, blockType, blockId);

    return NextResponse.json({
      success: true,
      message: releaseResult.message,
      blockId,
    });
  } catch (error) {
    console.error('Lock release error:', error);
    return NextResponse.json(
      { error: 'Failed to release lock' },
      { status: 500 }
    );
  }
}
