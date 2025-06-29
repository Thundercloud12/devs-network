'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { useSession } from 'next-auth/react';

let socket: any;

export default function RoomPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  const [room, setRoom] = useState<any>(null);
  const [code, setCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [chat, setChat] = useState<{ user: string; message: string }[]>([]);
  const [newComment, setNewComment] = useState('');

  const userId = session?.user?.id;

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/rooms/${id}`);
      const data = await res.json();
      setRoom(data);
      setCode(data.code);
      setIsHost(data.host._id === userId);

      const chatRes = await fetch(`/api/rooms/${id}/chat`);
      const chatData = await chatRes.json();
      setChat(chatData.chat);

      if (data.host._id !== userId) {
        await fetch(`/api/rooms/${id}/join`, {
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
    await fetch(`/api/rooms/${id}`, {
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

    await fetch(`/api/rooms/${id}`, {
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

    await fetch(`/api/rooms/${id}/leave`, {
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
    await fetch(`/api/rooms/${id}/chat`, {
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
    <div className="min-h-screen flex p-4 space-x-4 bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Main Section */}
      <div className="flex flex-col flex-1 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{room.title}</h1>
            <div className="flex space-x-3">
              {isHost && (
                <button
                  onClick={deleteRoom}
                  className="bg-red-600 text-white rounded-full px-4 py-2 font-semibold hover:bg-red-700"
                >
                  Delete Room
                </button>
              )}
              {!isHost && (
                <button
                  onClick={leaveRoom}
                  className="bg-gray-600 text-white rounded-full px-4 py-2 font-semibold hover:bg-gray-700"
                >
                  Leave Room
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-600 mt-1">{room.description}</p>
        </div>

        <div className="bg-white rounded-xl flex flex-col flex-1 p-4 shadow">
          <h2 className="font-bold text-lg">Code Editor ({room.language})</h2>
          <div className="flex-1 mt-2 border rounded overflow-hidden">
            <Editor
              value={code}
              onChange={handleCodeChange}
              language={room.language}
              theme="vs-dark"
              options={{
                readOnly: !isHost,
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
              }}
            />
          </div>
          {isSaving && <span className="text-gray-500 mt-2">Saving...</span>}
        </div>
      </div>

      {/* Comment Stream */}
      <div className="w-1/3 flex flex-col space-y-2 bg-white rounded-xl p-4 shadow">
        <h2 className="font-bold text-lg">Comments</h2>
        <div className="flex-1 overflow-y-auto space-y-2 p-2 rounded border border-gray-300">
          {chat.map((c, idx) => (
            <div key={idx} className="bg-gray-100 rounded p-2">
              <strong>{c.user}</strong>: {c.message}
            </div>
          ))}
        </div>
        <div className="flex space-x-2 mt-2">
          <input
            className="flex-1 p-2 rounded border"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendComment();
              }
            }}
          />
          <button
            className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700"
            onClick={sendComment}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
