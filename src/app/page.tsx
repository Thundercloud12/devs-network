"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard/feed");
  }, [status, router]);

  // BRUTALIST LOADING STATE
  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F4F0EA] font-mono">
        <div className="animate-pulse border-4 border-[#1A1A1A] bg-[#39FF14] px-8 py-4 text-2xl font-black uppercase tracking-widest text-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A]">
          INITIALIZING_SYSTEM...
        </div>
      </div>
    );
  }

  // MAIN PAGE OVERHAUL
  return (
    <div className="min-h-screen w-full bg-[#F4F0EA] font-mono text-[#1A1A1A] selection:bg-[#FF5722] selection:text-[#F4F0EA]">
      {/* THICK OUTER FRAME */}
      <div className="pointer-events-none fixed inset-0 z-50 border-[12px] border-[#1A1A1A]"></div>

      {/* NAVIGATION
      <nav className="flex w-full items-center justify-between border-b-4 border-[#1A1A1A] bg-white px-6 py-4 lg:px-12">
        <div className="text-2xl font-black uppercase tracking-tighter">
          DEVS_NETWORK<span className="text-[#FF5722]">.EXE</span>
        </div>
        <Link
          href="/api/auth/signin"
          className="border-4 border-[#1A1A1A] bg-[#39FF14] px-6 py-2 font-bold uppercase transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none"
        >
          SYS.LOGIN()
        </Link>
      </nav> */}

      {/* HERO SECTION */}
      <main className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="mb-20 flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl">
              Code Together. <br />
              <span className="bg-[#1A1A1A] text-[#F4F0EA] px-2">Ship Faster.</span>
            </h1>
            <p className="max-w-xl text-lg font-medium leading-relaxed border-l-4 border-[#FF5722] pl-4">
              A dedicated network for developers. Host live coding rooms, share knowledge, and build without the noise. Moderated by AI, driven by the community.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <Link
              href="/api/auth/signin"
              className="w-full text-center border-4 border-[#1A1A1A] bg-[#FF5722] px-8 py-4 text-xl font-black uppercase text-white shadow-[8px_8px_0px_0px_#1A1A1A] transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[12px_12px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              INITIALIZE_ACCOUNT
            </Link>
            <div className="text-sm font-bold uppercase tracking-widest text-center">
              V 1.0.0 // STATUS: ONLINE
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* FEATURE 1 */}
          <div className="group border-4 border-[#1A1A1A] bg-white p-8 shadow-[8px_8px_0px_0px_#1A1A1A] transition-transform hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#1A1A1A]">
            <div className="mb-6 inline-block border-4 border-[#1A1A1A] bg-[#39FF14] p-3 text-2xl font-black">
              &lt;/&gt;
            </div>
            <h3 className="mb-4 text-2xl font-black uppercase">Live Rooms</h3>
            <p className="font-medium leading-relaxed">
              Real-time collaboration with Monaco Editor and Redis-backed live chat. Write syntax-highlighted code with zero latency.
            </p>
          </div>

          {/* FEATURE 2 */}
          <div className="group border-4 border-[#1A1A1A] bg-white p-8 shadow-[8px_8px_0px_0px_#1A1A1A] transition-transform hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#1A1A1A]">
             <div className="mb-6 inline-block border-4 border-[#1A1A1A] bg-[#FFD700] p-3 text-2xl font-black">
              [AI]
            </div>
            <h3 className="mb-4 text-2xl font-black uppercase">AI Moderation</h3>
            <p className="font-medium leading-relaxed">
              Powered by Gemini AI. Automated content review ensures your feed stays clean, relevant, and free of spam or toxicity.
            </p>
          </div>

          {/* FEATURE 3 */}
          <div className="group border-4 border-[#1A1A1A] bg-white p-8 shadow-[8px_8px_0px_0px_#1A1A1A] transition-transform hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#1A1A1A]">
             <div className="mb-6 inline-block border-4 border-[#1A1A1A] bg-[#FF5722] p-3 text-2xl font-black text-white">
              {'{ }'}
            </div>
            <h3 className="mb-4 text-2xl font-black uppercase">Dev Community</h3>
            <p className="font-medium leading-relaxed">
              Share posts, upload screenshots via ImageKit, and engage with a network of builders pushing code every day.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}