// src/app/api/rooms/[id]/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { user, message } = await req.json();

  const comment = {
    user,
    message,
    timestamp: Date.now(),
  };

  await redis.rpush(`room:${params.id}:chat`, JSON.stringify(comment));
  return NextResponse.json({ success: true });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Example: Use query param ?limit=5
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");

  const messages = await redis.lrange<string>(`room:${id}:chat`, -limit, -1); // last `limit` messages
  const parsedMessages = messages.map((m) => JSON.parse(m));

  return NextResponse.json({ chat: parsedMessages });
}
