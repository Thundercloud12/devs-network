import { NextRequest, NextResponse } from "next/server";
import CodingRoom from "@/models/CodingRoom"; 
import { connectDb } from "@/lib/dbConect";




// GET /api/rooms/[id]
export async function GET(req: NextRequest) {

  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');

  await connectDb()
  const room = await CodingRoom.findById(id).populate("host participants");
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  return NextResponse.json(room);
}

// app/api/rooms/[id]/route.ts
export async function PUT(req: NextRequest) {
  await connectDb()
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');
  const data = await req.json();
  const room = await CodingRoom.findByIdAndUpdate(id, { code: data.code }, { new: true });
  return NextResponse.json(room);
}

export async function DELETE(req: NextRequest) {

  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');
  await CodingRoom.findByIdAndDelete(id);

  return NextResponse.json({ message: 'Deleted' });
}
