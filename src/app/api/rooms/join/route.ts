import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/dbConect';
import CodingRoom from '@/models/CodingRoom';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
     const searchParams = req.nextUrl.searchParams;
     const id = searchParams.get('id');

  await connectDb();

  // Get Session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Find room
  const room = await CodingRoom.findById(id);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  // Don't add host as participant
  if (room.host.toString() === userId) {
    return NextResponse.json({ error: 'Host is already in room' }, { status: 400 });
  }

  // Check if user is already a participant
  if (room.participants.includes(userId)) {
    return NextResponse.json({ message: 'Already joined' }, { status: 200 });
  }

  // Add user to participants
  room.participants.push(userId);
  await room.save();

  return NextResponse.json({ message: 'Joined room successfully', room }, { status: 200 });
}
