import { authOptions } from "@/lib/auth";
import { connectDb } from "@/lib/dbConect";
import Comment from "@/models/Comment";
import Posts, { Post,  } from "@/models/Posts";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    

    try {
        await connectDb();
        const { searchParams } = new URL(req.url);
        const postId = searchParams.get("postId");
        const comments = await Posts.findById(postId)
                                .populate({
                                    path: 'comments', // Populate the 'comments' array in the Post model
                                    model: Comment,    // Specify the model for population
                                    populate: {        // Nested populate for the userPosted field within each comment
                                        path: 'userPosted',
                                        model: 'User' // Assuming your user model is named 'User'
                                    }
                                })
                                .lean();
        
        console.log(comments);
        
        if(!comments || comments.length === 0) {
            return NextResponse.json([], {status: 200})
        }
        return NextResponse.json(comments)
    } catch (error) {

        return NextResponse.json(
            {error: "Failed to fetch posts"}, {status: 200}
        )
        
    }
}

export async function POST(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      await connectDb();
  
      const { content, postId } = await request.json();
  
      if (!content || !postId) {
        return NextResponse.json({ error: "Missing content or postId" }, { status: 400 });
      }
  
      // Create comment
      const newComment = await Comment.create({
        content,
        likecount: 0,
        userPosted: session.user.id,
      });
  
  
      await Posts.findByIdAndUpdate(postId, {
        $push: { comments: newComment._id },
      });
  
      return NextResponse.json(newComment, { status: 201 });
  
    } catch (error) {
      console.error("Comment POST error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
  