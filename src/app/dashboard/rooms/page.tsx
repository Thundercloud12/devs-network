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
    <div className="bg-[#F4F0EA] min-h-screen">
      <Sidebar />
      <main className="ml-72 p-10 pt-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-5xl font-black uppercase tracking-tighter text-[#1A1A1A]">
                Live<br /><span className="bg-[#1A1A1A] text-[#39FF14] px-2">ROOMS_</span>
              </h2>
              <p className="mt-4 font-bold text-[#FF5722]">&gt; COLLABORATE_IN_REALTIME</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-3 border-4 border-[#1A1A1A] bg-[#39FF14] px-8 py-4 font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_#1A1A1A] transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[12px_12px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              <FaPlus />
              CREATE_ROOM
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="group relative border-4 border-[#1A1A1A] bg-white p-6 shadow-[8px_8px_0px_0px_#1A1A1A] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#1A1A1A]"
              >
                <div className="absolute -top-4 -right-2 bg-[#FFD700] border-4 border-[#1A1A1A] px-2 py-1 text-[10px] font-black uppercase">
                  LIVE_{room.language.toUpperCase()}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-[#1A1A1A] mb-2">{room.title}</h3>
                <p className="text-sm font-bold text-[#1A1A1A]/70 mb-6 leading-relaxed line-clamp-2">{room.description}</p>
                <Link
                  href={`room/${room._id}`}
                  className="inline-block border-4 border-[#1A1A1A] bg-[#1A1A1A] px-6 py-2 text-sm font-black uppercase tracking-widest text-[#39FF14] transition-colors hover:bg-[#39FF14] hover:text-[#1A1A1A]"
                >
                  JOIN_SESSION()
                </Link>
              </div>
            ))}

            {rooms.length === 0 && (
              <div className="col-span-full border-4 border-dashed border-[#1A1A1A] p-20 text-center">
                <p className="text-xl font-black uppercase tracking-widest text-[#1A1A1A]/30">NO_ACTIVE_ROOMS_FOUND</p>
              </div>
            )}
          </div>
        </div>

        {/* MODAL OVERLAY */}
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1A]/40 backdrop-blur-sm p-6">
            <div className="relative w-full max-w-lg border-4 border-[#1A1A1A] bg-white shadow-[16px_16px_0px_0px_#1A1A1A]">
              {/* MODAL HEADER */}
              <div className="border-b-4 border-[#1A1A1A] bg-[#FFD700] px-6 py-4 flex items-center justify-between">
                <span className="font-black uppercase tracking-widest text-[#1A1A1A]">
                  ROOM_INITIALIZER.EXE
                </span>
                <button
                  onClick={resetModal}
                  className="border-2 border-[#1A1A1A] bg-white p-1 hover:bg-[#FF5722] hover:text-white transition-colors"
                >
                  <RiCloseLine size={24} />
                </button>
              </div>

              <div className="p-8">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreate();
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="block font-black uppercase tracking-widest text-xs">&gt; Room_Title</label>
                    <input
                      type="text"
                      className="w-full border-4 border-[#1A1A1A] bg-[#F4F0EA] px-4 py-3 font-bold focus:bg-[#39FF14]/10 focus:outline-none"
                      placeholder="IDENTIFIER"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-black uppercase tracking-widest text-xs">&gt; Purpose_Desc</label>
                    <input
                      type="text"
                      className="w-full border-4 border-[#1A1A1A] bg-[#F4F0EA] px-4 py-3 font-bold focus:bg-[#39FF14]/10 focus:outline-none"
                      placeholder="MISSION_LOG"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-black uppercase tracking-widest text-xs">&gt; Env_Stack</label>
                    <select
                      className="w-full border-4 border-[#1A1A1A] bg-[#F4F0EA] px-4 py-3 font-black uppercase tracking-widest focus:outline-none appearance-none"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="javascript">JAVASCRIPT</option>
                      <option value="python">PYTHON</option>
                      <option value="c++">C++</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-black uppercase tracking-widest text-xs">&gt; Initial_Buffer</label>
                    <textarea
                      className="w-full border-4 border-[#1A1A1A] bg-[#F4F0EA] px-4 py-3 font-mono text-sm h-32 focus:bg-[#39FF14]/10 focus:outline-none"
                      placeholder="// STARTUPS_CODE_HERE..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>

                  <button
                    className="w-full border-4 border-[#1A1A1A] bg-[#39FF14] py-4 text-xl font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_#1A1A1A] transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[10px_10px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none"
                    type="submit"
                  >
                    DEPLOY_ROOM
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
