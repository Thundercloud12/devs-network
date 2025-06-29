import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import CodingRoom from "@/models/CodingRoom"; 
import { connectDb } from "@/lib/dbConect";




// GET /api/rooms/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

  await connectDb()
  const room = await CodingRoom.findById(params.id).populate("host participants");
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  return NextResponse.json(room);
}

// app/api/rooms/[id]/route.ts
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  await connectDb()
  const { id } = await context.params;
  const data = await req.json();
  const room = await CodingRoom.findByIdAndUpdate(id, { code: data.code }, { new: true });
  return NextResponse.json(room);
}

export async function DELETE(req: NextRequest,{ params }: { params: { id: string } }) {
  await CodingRoom.findByIdAndDelete(params.id);

  return NextResponse.json({ message: 'Deleted' });
}
