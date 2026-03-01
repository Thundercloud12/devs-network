'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { useSession } from 'next-auth/react';

let socket: Socket;

export default function RoomPage() {
  const { id } = useParams();
  console.log(id);

  const { data: session } = useSession();
  const router = useRouter();

  type Room = {
    _id: string;
    title: string;
    description: string;
    code: string;
    host: {
      _id: string;
      username: string;
    };
    language: string;
    isLive: boolean;
  };

  const [room, setRoom] = useState<Room | null>(null);
  const [code, setCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [chat, setChat] = useState<{ user: string; message: string }[]>([]);
  const [newComment, setNewComment] = useState('');

  const userId = session?.user?.id;

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/rooms/room?id=${id}`);
      const data = await res.json();
      setRoom(data);
      setCode(data.code);
      setIsHost(data.host._id === userId);

      const chatRes = await fetch(`/api/rooms/chat?id=${id}`);
      console.log(chatRes);

      const chatData = await chatRes.json();
      setChat(chatData.chat);

      if (data.host._id !== userId) {
        await fetch(`/api/rooms/join?id=${id}`, {
          method: 'POST',
        });
      }
    }

    fetchData();

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    console.log(BACKEND_URL);

    socket = io(BACKEND_URL);
    socket.connect();
    socket.emit('joinRoom', id);

    socket.on('updateEditor', (content: string) => {
      setCode(content);
    });
    socket.on('newComment', (comment: { user: string; message: string }) => {
      setChat((prev) => [...prev, comment]);
    });
    socket.on('roomDeleted', () => {
      alert('This room has been deleted. You will be redirected.');
      router.push('/dashboard/rooms');
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [id, userId]);

  useEffect(() => {
    if (!room) return;

    const interval = setInterval(() => {
      saveCode();
    }, 60000);
    return () => clearInterval(interval);
  }, [room, code]);

  const handleCodeChange = (value?: string) => {
    if (!isHost) return;
    const newCode = value || '';
    setCode(newCode);
    socket.emit('editorChange', { roomId: id, content: newCode });
  };

  async function saveCode() {
    if (!room) return;

    setIsSaving(true);
    await fetch(`/api/rooms/room?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    setIsSaving(false);
  }

  async function deleteRoom() {
    if (!room) return;

    const confirmed = confirm('Are you sure you want to delete this room?');
    if (!confirmed) return;

    await fetch(`/api/rooms/room/?id=${id}`, {
      method: 'DELETE',
    });
    socket.emit('deleteRoom', id);
    alert('Room deleted!');
    router.push('/dashboard/rooms');
  }

  async function leaveRoom() {
    if (!room) return;

    const confirmed = confirm('Are you sure you want to leave this room?');
    if (!confirmed) return;

    await fetch(`/api/rooms/leave?id=${id}`, {
      method: 'POST',
    });
    alert('Left the room!');
    router.push('/dashboard/rooms');
  }

  async function sendComment() {
    if (!newComment.trim()) return;

    const comment = {
      user: session?.user?.username || 'Anonymous',
      message: newComment.trim(),
    };
    await fetch(`/api/rooms/chat?id=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
    socket.emit('sendComment', { roomId: id, comment });
    setNewComment('');
  }

  if (!room) {
    return <div className="flex justify-center items-center h-screen">Loading room...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F4F0EA] p-6 lg:p-10 flex flex-col gap-8">
      {/* ROOM HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-4 border-[#1A1A1A] bg-white p-6 shadow-[8px_8px_0px_0px_#1A1A1A]">
        <div className="space-y-1">
          <div className="inline-block border-2 border-[#1A1A1A] bg-[#1A1A1A] px-2 py-0.5 text-[10px] font-black uppercase text-[#39FF14] mb-2">
            STATION_ID: {room._id.slice(-6)}
          </div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-[#1A1A1A]">{room.title}</h1>
          <p className="font-bold text-[#FF5722] text-sm uppercase tracking-widest">&gt; {room.description}</p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="border-4 border-[#1A1A1A] bg-[#FFD700] px-4 py-2 font-black uppercase text-xs">
            ENV: {room.language.toUpperCase()}
          </div>
          {isSaving && (
            <div className="flex items-center gap-2 text-[#1A1A1A] font-black text-xs uppercase animate-pulse">
              <div className="h-2 w-2 bg-[#FF5722] rounded-full"></div>
              SYNCING_STATE...
            </div>
          )}
          {isHost ? (
            <button
              onClick={deleteRoom}
              className="border-4 border-[#1A1A1A] bg-[#FF5722] text-white px-6 py-3 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#1A1A1A] transition-all active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              TERMINATE_ROOM
            </button>
          ) : (
            <button
              onClick={leaveRoom}
              className="border-4 border-[#1A1A1A] bg-[#1A1A1A] text-white px-6 py-3 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#1A1A1A] transition-all active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              DISCONNECT
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-8">
        {/* EDITOR SECTION */}
        <div className="flex-[2] flex flex-col border-4 border-[#1A1A1A] bg-white shadow-[12px_12px_0px_0px_#1A1A1A] overflow-hidden">
          <div className="border-b-4 border-[#1A1A1A] bg-[#1A1A1A] px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#39FF14] tracking-widest">SOURCE_CODE_MATRIX</span>
            <div className="flex gap-1.5">
              <div className="h-2 w-2 bg-[#FF5722] border border-white/20"></div>
              <div className="h-2 w-2 bg-[#39FF14] border border-white/20"></div>
            </div>
          </div>
          <div className="flex-1 min-h-[500px]">
            <Editor
              value={code}
              onChange={handleCodeChange}
              language={room.language}
              theme="vs-dark"
              options={{
                readOnly: !isHost,
                fontSize: 16,
                fontFamily: "var(--font-mono)",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20, bottom: 20 },
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
              }}
            />
          </div>
          {!isHost && (
            <div className="bg-[#FF5722] text-white p-2 text-center text-[10px] font-black uppercase tracking-widest">
              CAUTION: ACCESS_MODE_READ_ONLY
            </div>
          )}
        </div>

        {/* CHAT/LOG SECTION */}
        <div className="flex-1 flex flex-col border-4 border-[#1A1A1A] bg-white shadow-[12px_12px_0px_0px_#1A1A1A] overflow-hidden">
          <div className="border-b-4 border-[#1A1A1A] bg-[#39FF14] px-4 py-2 flex items-center justify-between font-black uppercase text-xs tracking-widest">
            COMM_LINK.LOG
            <div className="h-2 w-2 bg-[#1A1A1A] animate-ping"></div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-[#F4F0EA]">
            {chat.map((c, idx) => (
              <div key={idx} className="border-2 border-[#1A1A1A] bg-white p-3 shadow-[4px_4px_0px_0px_#1A1A1A]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase bg-[#1A1A1A] text-[#39FF14] px-1">
                    {c.user}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#1A1A1A] break-words leading-tight">{c.message}</p>
              </div>
            ))}
            {chat.length === 0 && (
              <div className="h-full flex items-center justify-center opacity-30">
                <p className="text-xs font-black uppercase tracking-[0.2em]">WAITING_FOR_DATA...</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t-4 border-[#1A1A1A] bg-white space-y-2">
            <div className="flex gap-2">
              <input
                className="flex-1 border-4 border-[#1A1A1A] bg-[#F4F0EA] px-3 py-2 text-xs font-bold focus:bg-[#39FF14]/10 focus:outline-none placeholder:text-[#1A1A1A]/30"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="INPUT_MESSAGE..."
                onKeyDown={(e) => e.key === 'Enter' && sendComment()}
              />
              <button
                className="border-4 border-[#1A1A1A] bg-[#39FF14] px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all hover:-translate-y-0.5"
                onClick={sendComment}
              >
                PIPE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
