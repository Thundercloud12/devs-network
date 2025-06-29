import { connectDb } from "@/lib/dbConect";
import Like from "../../../models/Likes";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Posts from "@/models/Posts";

export async function POST(req: NextRequest) {


  try{
    await connectDb();
    const session = await getServerSession(authOptions);
  
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
    const { postId } = await req.json();
    const userId = session.user.id;
  
    // Check if already liked
    const existing = await Like.findOne({ postId, userId });
  
    if (existing) {
      // Unlike
      await Like.deleteOne({ _id: existing._id });
      await Posts.findByIdAndUpdate(postId, { $inc: { likecount: -1 } });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      const newLike = await Like.create({ postId, userId });
      
      await Posts.findByIdAndUpdate(postId, { $inc: { likecount: 1 } });
      return NextResponse.json({ liked: true, likeId: newLike._id });
    }
  }catch(error) {
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });    
  }
}
