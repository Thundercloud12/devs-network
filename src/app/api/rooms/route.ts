import { NextRequest, NextResponse } from "next/server";
import CodingRoom from "@/models/CodingRoom"; // Adjust path as needed
import { connectDb } from "@/lib/dbConect";

// Connect to your MongoDB


// GET /api/rooms
export async function GET() {
  await connectDb()
  const rooms = await CodingRoom.find({}).sort({ createdAt: -1 });
  return NextResponse.json({ rooms });
}

// POST /api/rooms
export async function POST(req: NextRequest) {
  await connectDb()
  const data = await req.json();
  const room = await CodingRoom.create(data);
  return NextResponse.json(room, { status: 201 });
}
