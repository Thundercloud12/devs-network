"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCodepen, FaHome, FaUpload } from "react-icons/fa";

const Sidebar = () => {
  const pathname = usePathname();
  const navClass = (path: string) =>
    `group flex items-center gap-3 px-6 py-4 border-4 border-[#1A1A1A] font-black uppercase tracking-widest transition-all ${pathname === path
      ? "bg-[#FFD700] shadow-[4px_4px_0px_0px_#1A1A1A] -translate-y-1 translate-x-1"
      : "bg-white hover:bg-[#39FF14] hover:shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-y-1 hover:translate-x-1 active:translate-x-0 active:translate-y-0 active:shadow-none"
    }`;

  return (
    <aside className="fixed left-0 top-[78px] h-[calc(100vh-78px)] w-72 bg-[#F4F0EA] border-r-4 border-[#1A1A1A] p-8 flex flex-col z-40 overflow-y-auto">
      <div className="mb-10">
        <div className="inline-block border-4 border-[#1A1A1A] bg-[#1A1A1A] px-3 py-1 text-[#39FF14] font-black text-xs uppercase mb-2">
          NAVIGATION_CORE
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-[#1A1A1A]">
          DEVS<span className="text-[#FF5722]">_CLUB</span>
        </h2>
      </div>

      <nav className="flex flex-col gap-6">
        <Link href="/dashboard/feed" className={navClass("/dashboard/feed")}>
          <FaHome className="text-xl" />
          <span>Feed</span>
        </Link>
        <Link href="/dashboard/upload" className={navClass("/dashboard/upload")}>
          <FaUpload className="text-xl" />
          <span>Upload</span>
        </Link>
        <Link href="/dashboard/rooms" className={navClass("/dashboard/rooms")}>
          <FaCodepen className="text-xl" />
          <span>Live Rooms</span>
        </Link>
      </nav>

      <div className="mt-auto border-4 border-[#1A1A1A] bg-white p-4 shadow-[4px_4px_0px_0px_#1A1A1A]">
        <p className="text-xs font-bold uppercase text-[#1A1A1A]/60 mb-1">SYSTEM_STATUS</p>
        <p className="text-sm font-black uppercase text-[#39FF14] bg-[#1A1A1A] px-2 py-1 inline-block">ONLINE</p>
      </div>
    </aside>
  );
};

export default Sidebar;
