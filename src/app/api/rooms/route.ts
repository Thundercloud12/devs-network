import { NextRequest, NextResponse } from "next/server";
import CodingRoom from "@/models/CodingRoom"; // Adjust path as needed
import { connectDb } from "@/lib/dbConect";

// Connect to your MongoDB


// GET /api/rooms
export async function GET() {

  try {
    await connectDb()
    const rooms = await CodingRoom.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ rooms });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 }); 
  }
  
}

// POST /api/rooms
export async function POST(req: NextRequest) {

  try {
    await connectDb()
    const data = await req.json();
    const room = await CodingRoom.create(data);
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 }); 
  }

}
