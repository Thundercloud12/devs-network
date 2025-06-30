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
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const messages = await redis.lrange<string>(`room:${params.id}:chat`, 0, -1);
  const parsedMessages = messages.map((m) => JSON.parse(m));
  return NextResponse.json({ chat: parsedMessages });
}
