import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;
  const { user, message } = await request.json();

  const comment = {
    user,
    message,
    timestamp: Date.now(),
  };

  // Push the comment to Redis list
  await redis.rpush(`room:${id}:chat`, JSON.stringify(comment));

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;

  const messages = await redis.lrange<string>(`room:${id}:chat`, 0, -1);
  const parsedMessages = messages.map((m) => JSON.parse(m));
  console.log(messages);
  
  return NextResponse.json({ chat: parsedMessages });
}
