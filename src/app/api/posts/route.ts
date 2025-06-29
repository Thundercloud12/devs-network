import { authOptions } from "@/lib/auth";
import { connectDb } from "@/lib/dbConect";
import Posts, { Post,  } from "@/models/Posts";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    

    try {
        await connectDb();
        const posts = await Posts.find({}).sort({createdAt: -1}).populate("userPosted").lean()
        if(!posts || posts.length === 0) {
            return NextResponse.json([], {status: 200})
        }
      
        return new NextResponse(JSON.stringify(posts), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.log(error);
        
        return NextResponse.json(
            {error: "Failed to fetch posts"}, {status: 404}
        )
        
    }
}

export async function POST(request :NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        
        if(!session) {
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }

        await connectDb()
        const body: Post = await request.json()

        if(
            !body.title ||
            !body.description ||
            !body.mediaUrl || 
            !body.thumbnailUrl ||
            !body.imagekitFileId  
        ) {
            return NextResponse.json(
                {error: "Missing Fields"},
                {status: 400}
            )
        }
        const userId = session.user.id
   
        
        
        if(body.type === 'video') {
            const videoData = {
                ...body,
                controls: body.controls ?? true,
                transformation: {
                    height: 1920,
                    width: 1080,
                    quality: body.transformationVideo?.quality ?? 100,
                },
                userPosted: userId
            }

           
            const video = await Posts.create(videoData);
           
            return NextResponse.json(video)
        } else{
            
            const ImageData = {
                ...body,
                controls: body.controls ?? true,
                transformation: {
                    height: 1920,
                    width: 1080,
                    quality: body.transformationVideo?.quality ?? 100,
                },
                userPosted: userId,
                flagged: false
            }
          
            

            const Image = await Posts.create(ImageData)
          
            
            return NextResponse.json(Image)
        }

        

    } catch (error) {
        console.log(error);
        
        return NextResponse.json(
            {error: "Some Error Ocurred"},
            {status: 500}
        )
    }
}