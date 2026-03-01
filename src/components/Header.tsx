"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useNotification } from "@/components/Notification";
import { apiClient } from "@/lib/api-client";
import SessionWrapper from "@/components/SessionWrapper";
import Link from "next/link";

export default function HeaderWithResizableNav() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification("SYSTEM: Logged out successfully.", "success");
    } catch {
      showNotification("ERROR: Terminate session failed.", "error");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiClient.deleteAcc();
      await signOut();
      showNotification("SYSTEM: Account purged from database.", "success");
    } catch (error) {
      console.error(error);
      showNotification("ERROR: Deletion sequence failed.", "error");
    }
  };

  return (
    <SessionWrapper>
      {/* THICK TERMINAL HEADER BAR */}
      <header className="sticky top-0 z-50 w-full border-b-[6px] border-[#1A1A1A] bg-[#F4F0EA] font-mono text-[#1A1A1A] selection:bg-[#FF5722] selection:text-[#F4F0EA]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          
          {/* LOGO */}
          <Link
            href="/"
            className="group flex items-center gap-2 text-2xl font-black uppercase tracking-tighter transition-transform hover:-translate-y-1"
          >
            <div className="border-4 border-[#1A1A1A] bg-[#1A1A1A] px-2 py-1 text-[#39FF14]">
              &gt;_
            </div>
            <span>
              DEVS<span className="text-[#FF5722]">_NET</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-6 md:flex">
            {session ? (
              <>
                <div className="border-b-4 border-dashed border-[#1A1A1A] pb-1 text-sm font-bold uppercase tracking-widest">
                  USER: [{session.user.username}]
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSignOut}
                    className="border-4 border-[#1A1A1A] bg-[#FFD700] px-4 py-2 font-bold uppercase shadow-[4px_4px_0px_0px_#1A1A1A] transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none"
                  >
                    LOGOUT
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="border-4 border-[#1A1A1A] bg-[#FF5722] px-4 py-2 font-bold uppercase text-white shadow-[4px_4px_0px_0px_#1A1A1A] transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none"
                  >
                    PURGE_SYS
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="border-4 border-[#1A1A1A] bg-[#39FF14] px-6 py-2 font-bold uppercase shadow-[4px_4px_0px_0px_#1A1A1A] transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none"
              >
                SYS.LOGIN()
              </Link>
            )}
          </div>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="border-4 border-[#1A1A1A] bg-white p-2 shadow-[4px_4px_0px_0px_#1A1A1A] active:translate-x-1 active:translate-y-1 active:shadow-none md:hidden"
          >
            <span className="block h-1 w-6 bg-[#1A1A1A] mb-1"></span>
            <span className="block h-1 w-6 bg-[#1A1A1A] mb-1"></span>
            <span className="block h-1 w-6 bg-[#1A1A1A]"></span>
          </button>
        </div>

        {/* MOBILE NAVIGATION DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="absolute left-0 top-full w-full border-b-[6px] border-[#1A1A1A] bg-[#F4F0EA] p-6 shadow-[0px_12px_0px_0px_rgba(26,26,26,0.2)] md:hidden">
            <div className="flex flex-col gap-4">
              {session ? (
                <>
                  <div className="bg-[#1A1A1A] p-3 text-center text-sm font-bold uppercase tracking-widest text-[#39FF14]">
                    STATUS: LOGGED IN // USER: {session.user.username}
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full border-4 border-[#1A1A1A] bg-[#FFD700] px-4 py-3 font-bold uppercase text-center shadow-[4px_4px_0px_0px_#1A1A1A] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    LOGOUT
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleDeleteAccount();
                    }}
                    className="w-full border-4 border-[#1A1A1A] bg-[#FF5722] px-4 py-3 font-bold uppercase text-white text-center shadow-[4px_4px_0px_0px_#1A1A1A] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    PURGE ACCOUNT
                  </button>
                </>
              ) : (
                <Link
                  onClick={() => setIsMobileMenuOpen(false)}
                  href="/login"
                  className="w-full border-4 border-[#1A1A1A] bg-[#39FF14] px-4 py-3 font-bold uppercase text-center shadow-[4px_4px_0px_0px_#1A1A1A] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  INITIALIZE_LOGIN
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </SessionWrapper>
  );
}