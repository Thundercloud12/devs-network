import { NextRequest, NextResponse } from "next/server";
import CodingRoom from "@/models/CodingRoom"; 
import { connectDb } from "@/lib/dbConect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";




// GET /api/rooms/[id]
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: "Room id is required" }, { status: 400 });

  try {
    await connectDb()
    const room = await CodingRoom.findById(id).populate("host participants");
    if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
  return NextResponse.json(room);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 }); 
  }

  
}

// app/api/rooms/[id]/route.ts
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: "Room id is required" }, { status: 400 });

  try {
    await connectDb()
    const data = await req.json();
    const room = await CodingRoom.findById(id);
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (!room.isLive) return NextResponse.json({ error: "Room is closed" }, { status: 410 });
    const canEdit = room.host.toString() === session.user.id ||
      room.editorsAccess.some((editorId) => editorId.toString() === session.user.id);
    if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    room.code = data.code;
    await room.save();
    return NextResponse.json(room);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 }); 
  }
  
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: "Room id is required" }, { status: 400 });

  try {
    await connectDb();
    const room = await CodingRoom.findById(id);
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (room.host.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    room.isLive = false;
    await room.save();
    return NextResponse.json({ message: 'Room closed' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 }); 
  }
  
}
