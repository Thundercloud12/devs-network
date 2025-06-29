import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConect";
import User from "@/models/User";
import Posts from "@/models/Posts";
import ImageKit from "imagekit";
import Comment from "@/models/Comment";

export async function DELETE(request: NextRequest) {

    const imagekit = new ImageKit({
        publicKey : process.env.IMAGEKIT_PUBLIC_KEY!,
        privateKey : process.env.IMAGEKIT_PRIVATE_KEY!,
        urlEndpoint : process.env.IMAGE_KIT_URL!
    });

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    await connectDb();
    const user = await  User.findById(userId)
    if(!user) {
        return NextResponse.json({ error: "No user found" }, { status: 400 });
    }

    try {
        const userPosts = await Posts.find({userPosted: userId});
        const imagekitFileIdsToDelete = userPosts.map(post => post.imagekitFileId).filter(Boolean); 
        console.log(userPosts);
        console.log(imagekitFileIdsToDelete);
        
        await Posts.deleteMany({ userPosted: userId });
        await Comment.deleteMany({userPosted: userId})
        await User.findByIdAndDelete(userId);

        if (imagekitFileIdsToDelete.length > 0) {
           
            const BATCH_SIZE = 100;
            for (let i = 0; i < imagekitFileIdsToDelete.length; i += BATCH_SIZE) {
                const batch = imagekitFileIdsToDelete.slice(i, i + BATCH_SIZE);
                try {
                    const result = await imagekit.bulkDeleteFiles(batch);
                    console.log('ImageKit bulk delete result:', result);
                } catch (imageKitError) {
                    console.error('Error deleting files from ImageKit:', imageKitError)
                }
            }
        }


        return NextResponse.json({ message: "User deletion successful" }, { status: 200 });
    } catch (error) {
        console.log(error);
        
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
                                    

}