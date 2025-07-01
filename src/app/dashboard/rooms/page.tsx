'use client';
import Sidebar from '@/components/Sidebar';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { FaPlus } from 'react-icons/fa';
import { RiCloseLine } from 'react-icons/ri';

export default function RoomsList() {
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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.rooms);
      });
  }, []);

  async function handleCreate() {
    if (!session?.user?.id) {
      alert('Please log in first!');
      return;
    }
    const payload = {
      title,
      description,
      language,
      code,
      host: session.user.id!,
      isLive: true,
    };
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const room = await res.json();
    alert(`Room Created: ${room.title}`);
    setRooms((prev) => [room, ...prev]);
    resetModal();
  }

  function resetModal() {
    setTitle('');
    setDescription('');
    setLanguage('javascript');
    setCode('');
    setModalOpen(false);
  }

  return (
    <div>
      <Sidebar />
    <div className="min-h-screen  py-10 px-80">

      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800">Live Coding Rooms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-gray-800">{room.title}</h3>
              <p className="text-gray-600 mt-1">{room.description}</p>
              <Link
                href={`/rooms?id=${room._id}`}
                className="text-blue-600 hover:underline mt-3 block font-medium"
              >
                Join Room →
              </Link>
            </div>
          ))}

          <div
            className="bg-white rounded-xl flex items-center justify-center border-2 border-dashed border-gray-400 cursor-pointer p-6 hover:bg-gray-100 transition"
            onClick={() => setModalOpen(true)}
          >
            <FaPlus size={32} className="text-gray-400" />
          </div>
        </div>
      </div>

      {modalOpen && (
        <dialog ref={dialogRef} className="modal modal-open">
          <div className="bg-white rounded-lg p-6 shadow-lg relative">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={resetModal}
            >
              <RiCloseLine size={20} />
            </button>
            <h3 className="text-lg font-bold text-center">
              Create New Room
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="space-y-4 mt-4"
            >
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select
                className="input input-bordered w-full"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option>javascript</option>
                <option>python</option>
                <option>c++</option>
              </select>
              <textarea
                className="input input-bordered w-full font-mono text-sm"
                placeholder="Initial Code (optional)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className="btn btn-primary w-full" type="submit">
                Create
              </button>
            </form>
          </div>
        </dialog>
      )}
    </div>
    </div>
  );
}
