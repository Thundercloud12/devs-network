// /app/api/posts/report/route.ts
import { connectDb } from "@/lib/dbConect";
import Posts from "@/models/Posts";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";
import mime from "mime-types";


const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const IMAGEKIT_PRIVATE_API_KEY = process.env.IMAGEKIT_PRIVATE_KEY!;
const IMAGEKIT_PUBLIC_API_KEY = process.env.IMAGEKIT_PUBLIC_KEY!;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGE_KIT_URL!;

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_API_KEY,
  privateKey: IMAGEKIT_PRIVATE_API_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

export async function POST(req: NextRequest) {
  const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ error: "Post ID missing" }, { status: 400 });

    await connectDb();
    const post = await Posts.findByIdAndUpdate(postId, { flagged: true });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const mediaUrl = post.thumbnailUrl;
    if (!mediaUrl) return NextResponse.json({ error: "No media to analyze" }, { status: 400 });

    // Fetch image and convert to base64
    const imageRes = await fetch(mediaUrl);
    if (!imageRes.ok) return NextResponse.json({ error: "Failed to fetch image" }, { status: 400 });
    const buffer = await imageRes.arrayBuffer();
    const mimeType = mime.lookup(mediaUrl) || "image/jpeg";
    const base64Image = Buffer.from(buffer).toString("base64");

    const prompt = `You are a strict content moderator.
    Analyze the image and tell me if it contains any of the following:
    - Nudity or sexually explicit content
    - Gore or graphic violence
    - Hate symbols or offensive language
    Return only one of the following: SAFE or OBJECTIONABLE.`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64Image, mimeType } },
            { text: prompt }
          ],
        },
      ],
    });

    const text = result.response.text();
    console.log("Gemini response:", text);

    const isObjectionable = /OBJECTIONABLE/i.test(text);

    if (isObjectionable) {
      if (post.imagekitFileId) {
        try {
          await imagekit.deleteFile(post.imagekitFileId);
          console.log("Image deleted from ImageKit");
        } catch (err) {
          console.error("Failed to delete from ImageKit:", err);
        }
      }

      await Posts.findByIdAndDelete(postId);
      return NextResponse.json({ action: "deleted", reason: text });
    }

    return NextResponse.json({ action: "flagged", reason: text });
  } catch (err) {
    console.error("Moderation error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
