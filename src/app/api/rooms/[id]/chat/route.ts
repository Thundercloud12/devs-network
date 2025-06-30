import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// POST route handler


export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
  }

  const { user, message } = await request.json();

  const comment = {
    user,
    message,
    timestamp: Date.now(),
  };

  await redis.rpush(`room:${id}:chat`, JSON.stringify(comment));

  return NextResponse.json({ success: true });
}

// GET route handler

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
  }


  const messages = await redis.lrange<string>(`room:${id}:chat`, 0, -1);
  const parsedMessages = messages.map((m) => JSON.parse(m));

  return NextResponse.json({ chat: parsedMessages });
}

