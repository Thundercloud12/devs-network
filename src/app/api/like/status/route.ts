import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Like from "../../../../models/Likes";
import { connectDb } from "@/lib/dbConect";

export async function GET(req: NextRequest) {
  await connectDb()
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const postId = req.nextUrl.searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  try {
    const liked = userId
      ? await Like.exists({ userId, postId })
      : false;

    const count = await Like.countDocuments({ postId });

    console.log(count);
    

    return NextResponse.json({ liked: !!liked, count });
  } catch (err) {
    console.log(err);
    
    return NextResponse.json({ error: "Failed to fetch like info" }, { status: 500 });
  }
}
