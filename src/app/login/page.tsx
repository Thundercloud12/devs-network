"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/Notification";
import Link from "next/link";
import { BackgroundBeams } from "@/components/background-beams";

export default function Login() {
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    console.log(result, "in signIn")

    if (result?.error) {
      showNotification(result.error, "error");
    } else {
      showNotification("Login successful!", "success");
      router.push("/dashboard/feed");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-[#F4F0EA]">
      <div className="relative z-10 w-full max-w-md border-4 border-[#1A1A1A] bg-white shadow-[12px_12px_0px_0px_#1A1A1A]">

        {/* TERMINAL HEADER */}
        <div className="flex items-center justify-between border-b-4 border-[#1A1A1A] bg-[#39FF14] px-4 py-3">
          <div className="flex gap-2">
            <div className="h-4 w-4 border-2 border-[#1A1A1A] bg-[#FF5722]"></div>
            <div className="h-4 w-4 border-2 border-[#1A1A1A] bg-white"></div>
            <div className="h-4 w-4 border-2 border-[#1A1A1A] bg-[#FFD700]"></div>
          </div>
          <span className="font-bold uppercase tracking-widest text-sm">AUTH_SEQUENCE.LOG</span>
        </div>

        <div className="p-8">
          <h1 className="mb-2 text-3xl font-black uppercase tracking-tighter">
            Access<br />Granted_
          </h1>
          <p className="mb-8 font-bold text-[#FF5722]">
            &gt; Enter credentials to gain access
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* USERNAME FIELD */}
            <div>
              <label htmlFor="username" className="mb-2 block font-bold uppercase tracking-wider">
                &gt; Username_ID
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="IDENTITY"
                className="w-full border-4 border-[#1A1A1A] bg-[#F4F0EA] px-4 py-3 font-bold placeholder:text-gray-400 focus:bg-[#39FF14]/10 focus:outline-none"
              />
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <label htmlFor="password" className="mb-2 block font-bold uppercase tracking-wider">
                &gt; Security_Key
              </label>
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                type="password"
                className="w-full border-4 border-[#1A1A1A] bg-[#F4F0EA] px-4 py-3 font-bold focus:bg-[#39FF14]/10 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full border-4 border-[#1A1A1A] bg-[#FF5722] py-4 text-xl font-black uppercase tracking-widest text-white shadow-[6px_6px_0px_0px_#1A1A1A] transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[10px_10px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              {loading ? "AUTHENTICATING..." : "EXECUTE_LOGIN"}
            </button>
          </form>

          <div className="mt-8 border-t-4 border-dashed border-[#1A1A1A] pt-6 text-center">
            <span className="font-bold uppercase text-sm">New to network?</span>{" "}
            <Link
              href="/register"
              className="inline-block bg-[#1A1A1A] px-2 font-bold text-[#39FF14] hover:bg-[#FFD700] hover:text-[#1A1A1A]"
            >
              REG_INIT()
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
