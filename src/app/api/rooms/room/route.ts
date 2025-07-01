import { NextRequest, NextResponse } from "next/server";
import CodingRoom from "@/models/CodingRoom"; 
import { connectDb } from "@/lib/dbConect";




// GET /api/rooms/[id]
export async function GET(req: NextRequest) {

  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');

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

  try {
    await connectDb()
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const data = await req.json();
    const room = await CodingRoom.findByIdAndUpdate(id, { code: data.code }, { new: true });
    return NextResponse.json(room);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 }); 
  }
  
}

export async function DELETE(req: NextRequest) {

  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');

  try {
    await CodingRoom.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 }); 
  }
  
}
