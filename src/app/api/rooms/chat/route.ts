import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    const { user, message } = await request.json();
    if (!user || !message) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const comment = {
      user,
      message,
      timestamp: Date.now(),
    };

    await redis.rpush(`room:${id}:chat`, JSON.stringify(comment));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('POST /api/rooms/chat error:', err);
    return NextResponse.json(
      { error: 'Failed to post comment', details: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    const messages = await redis.lrange<string | object>(`room:${id}:chat`, 0, -1);
    console.log('Raw Redis messages:', messages);

    const parsedMessages = messages.map((msg) => {
      if (typeof msg === 'string') {
        try {
          return JSON.parse(msg);
        } catch (e) {
          console.error('Failed to parse JSON string:', msg, e);
          return null;
        }
      }
      // If it's already an object, use as-is:
      return msg as { user: string; message: string; timestamp: number } | null;
    }).filter(Boolean); // Remove any null entries

    return NextResponse.json({ chat: parsedMessages });
  } catch (err) {
    console.error('GET /api/rooms/chat error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch chat'},
      { status: 500 }
    );
  }
}

