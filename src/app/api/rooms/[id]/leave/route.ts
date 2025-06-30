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


  // remove user to participants
  room.participants = room.participants.filter(
    (p: { userId: string }) => p.userId.toString() !== userId
  );
  await room.save();
  console.log("Work done");
  
  return NextResponse.json({ message: 'Remobved from room successfully', room }, { status: 200 });
}
