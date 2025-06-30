// File: app/api/upload-auth/route.ts
import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Runtime environment check
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      return NextResponse.json(
        { error: "Missing ImageKit credentials" },
        { status: 500 }
      );
    }

    const { token, expire, signature } = getUploadAuthParams({
      privateKey,
      publicKey,
    });

    return NextResponse.json({
      token,
      expire,
      signature,
      publicKey,
    });
  } catch (error) {
    console.error("ImageKit upload auth error:", error);
    return NextResponse.json(
      { error: "ImageKit Auth failed" },
      { status: 500 }
    );
  }
}
