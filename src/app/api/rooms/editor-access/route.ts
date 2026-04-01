import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/dbConect';
import CodingRoom from '@/models/CodingRoom';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const roomId = searchParams.get('roomId');
  const userId = searchParams.get('userId');
  const action = searchParams.get('action'); // 'grant' or 'revoke'

  await connectDb();

  // Get Session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const hostId = session.user.id;

  // Find room and verify host
  const room = await CodingRoom.findById(roomId).populate('host participants editorsAccess');
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  // Only host can manage editor access
  if (room.host._id.toString() !== hostId) {
    return NextResponse.json({ error: 'Only host can manage editor access' }, { status: 403 });
  }

  // Validate user is a participant
  const isParticipant = room.participants.some((p: any) => p._id.toString() === userId);
  if (!isParticipant) {
    return NextResponse.json({ error: 'User is not a participant' }, { status: 400 });
  }

  try {
    if (action === 'grant') {
      // Add user to editorsAccess if not already there
      if (!room.editorsAccess.some((e: any) => e.toString() === userId)) {
        room.editorsAccess.push(userId);
        await room.save();
      }
      return NextResponse.json({ message: 'Editor access granted', room }, { status: 200 });
    } else if (action === 'revoke') {
      // Remove user from editorsAccess
      room.editorsAccess = room.editorsAccess.filter((e: any) => e.toString() !== userId);
      await room.save();
      return NextResponse.json({ message: 'Editor access revoked', room }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing editor access:', error);
    return NextResponse.json({ error: 'Failed to manage editor access' }, { status: 500 });
  }
}
