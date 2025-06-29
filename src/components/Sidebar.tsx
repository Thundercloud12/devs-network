"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCodepen, FaHome, FaUpload } from "react-icons/fa";

const Sidebar = () => {
  const pathname = usePathname();
  const navClass = (path: string) =>
    `group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      pathname === path
        ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 font-semibold shadow-inner"
        : "text-gray-600 hover:bg-blue-50 hover:text-blue-800"
    }`;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r shadow-lg p-6 flex flex-col">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">Dev’s Club</h1>
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard/feed" className={navClass("/dashboard/feed")}>
          <FaHome  />
          Feed
        </Link>
        <Link href="/dashboard/upload" className={navClass("/dashboard/upload")}>
          <FaUpload />
          Upload
        </Link>
        <Link href="/dashboard/rooms" className={navClass("/dashboard/rooms")}>
          <FaCodepen />
          Live Coding Rooms
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
