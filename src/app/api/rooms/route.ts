import { NextRequest, NextResponse } from "next/server";
import CodingRoom from "@/models/CodingRoom"; // Adjust path as needed
import { connectDb } from "@/lib/dbConect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Connect to your MongoDB


// GET /api/rooms
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDb()
    const rooms = await CodingRoom.find({ isLive: true }).sort({ createdAt: -1 });
    return NextResponse.json({ rooms });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 }); 
  }
  
}

// POST /api/rooms
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDb()
    const data = await req.json();
    const room = await CodingRoom.create({
      title: data.title,
      description: data.description,
      language: data.language,
      code: data.code,
      host: session.user.id,
      isLive: true,
    });
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 }); 
  }

}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDb();
    const result = await CodingRoom.deleteMany({ host: session.user.id, isLive: false });
    return NextResponse.json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
