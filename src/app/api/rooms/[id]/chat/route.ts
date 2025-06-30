import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// POST route handler
export async function POST(
  request: NextRequest,
  {params}: {params: Promise<{ id: string }>}
) {
  const { id } = use(params);
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
export async function GET(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const { id } = params;

  const messages = await redis.lrange<string>(`room:${id}:chat`, 0, -1);
  const parsedMessages = messages.map((m) => JSON.parse(m));

  return NextResponse.json({ chat: parsedMessages });
}
