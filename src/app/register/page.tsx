"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/Notification";
import Link from "next/link";
import { useDebounceValue, useDebounceCallback } from "usehooks-ts";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameAvailability, setUsernameAvailability] = useState<
    "checking" | "available" | "unavailable" | null
  >(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { showNotification } = useNotification();

  // Debounce the username input value
  const [debouncedUsername] = useDebounceValue(username, 500);

  const checkUsernameUniqueness = useDebounceCallback(async (usernameToCheck: string) => {
    if (!usernameToCheck) {
      setUsernameAvailability(null);
      return;
    }

    try {
      const res = await fetch(`/api/check-username-unqiue?username=${usernameToCheck}`);
      const data = await res.json();

      if (data.success == true) {
        setUsernameAvailability("available");
      } else {
        setUsernameAvailability("unavailable");
      }
    } catch (error) {
      console.error("Error checking username uniqueness:", error);
      showNotification("SYS.ERR: Username validation failed.", "error");
      setUsernameAvailability(null);
    }
  }, 1000); // Reduced from 7000ms to 1000ms for better responsiveness.

  useEffect(() => {
    if (username.length >= 3) {
      setUsernameAvailability("checking");
    } else {
      setUsernameAvailability(null);
    }
  }, [username]);

  useEffect(() => {
    if (debouncedUsername.length < 3) {
      setUsernameAvailability(null);
      return;
    }
    if (debouncedUsername) {
      checkUsernameUniqueness(debouncedUsername);
    } else {
      setUsernameAvailability(null);
    }
  }, [debouncedUsername, checkUsernameUniqueness]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      showNotification("SYS.ERR: Password mismatch.", "error");
      setLoading(false);
      return;
    }

    if (usernameAvailability === "checking") {
      showNotification("SYS.WARN: Awaiting DB response...", "info");
      setLoading(false);
      return;
    }
    if (usernameAvailability === "unavailable") {
      showNotification("SYS.ERR: Identity already registered.", "error");
      setLoading(false);
      return;
    }
    if (usernameAvailability === null && username.length > 0) {
      showNotification("SYS.WARN: Awaiting validation.", "info");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      setLoading(false);
      showNotification("SYS.MSG: User initialized. Proceed to login.", "success");
      router.push("/login");
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Registration failed",
        "error"
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F0EA] p-6 font-mono text-[#1A1A1A] selection:bg-[#FF5722] selection:text-[#F4F0EA]">

      {/* THICK OUTER FRAME */}
      <div className="pointer-events-none fixed inset-0 z-0 border-[12px] border-[#1A1A1A]"></div>

      <div className="relative z-10 w-full max-w-2xl border-4 border-[#1A1A1A] bg-white shadow-[12px_12px_0px_0px_#1A1A1A]">

        {/* TERMINAL HEADER */}
        <div className="flex items-center justify-between border-b-4 border-[#1A1A1A] bg-[#FFD700] px-4 py-3">
          <div className="flex gap-2">
            <div className="h-4 w-4 border-2 border-[#1A1A1A] bg-[#FF5722]"></div>
            <div className="h-4 w-4 border-2 border-[#1A1A1A] bg-white"></div>
            <div className="h-4 w-4 border-2 border-[#1A1A1A] bg-[#39FF14]"></div>
          </div>
          <span className="font-bold uppercase tracking-widest">USER_INIT.EXE</span>
        </div>

        <div className="p-8">
          <h1 className="mb-2 text-3xl font-black uppercase tracking-tighter">
            Initialize<br />Account_
          </h1>
          <p className="mb-8 font-bold text-[#FF5722]">
            &gt; Enter credentials to proceed
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* EMAIL FIELD */}
            <div>
              <label htmlFor="email" className="mb-2 block font-bold uppercase tracking-wider">
                &gt; Email_Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="USER@DOMAIN.COM"
                className="w-full border-4 border-[#1A1A1A] bg-[#F4F0EA] px-4 py-3 font-bold placeholder:text-gray-400 focus:bg-[#39FF14]/10 focus:outline-none"
              />
            </div>

            {/* USERNAME FIELD */}
            <div>
              <label htmlFor="username" className="mb-2 block font-bold uppercase tracking-wider">
                &gt; Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
                placeholder="UNIQUE_ID"
                className="w-full border-4 border-[#1A1A1A] bg-[#F4F0EA] px-4 py-3 font-bold placeholder:text-gray-400 focus:bg-[#39FF14]/10 focus:outline-none"
              />

              {/* TERMINAL-STYLE STATUS MESSAGES */}
              <div className="mt-2 min-h-[24px]">
                {usernameAvailability === "checking" && (
                  <p className="animate-pulse text-sm font-bold text-[#FF5722] uppercase">
                    [WAIT] QUERYING_DATABASE...
                  </p>
                )}
                {usernameAvailability === "available" && (
                  <p className="text-sm font-bold text-[#39FF14] uppercase">
                    [OK] IDENTITY_AVAILABLE
                  </p>
                )}
                {usernameAvailability === "unavailable" && (
                  <p className="text-sm font-bold text-[#FF5722] uppercase bg-[#1A1A1A] inline-block px-1">
                    [ERR] ALREADY_IN_USE
                  </p>
                )}
                {username.length > 0 && username.length < 3 && usernameAvailability !== "checking" && (
                  <p className="text-sm font-bold text-[#FF5722] uppercase">
                    [ERR] MIN_LENGTH: 3 CHARS
                  </p>
                )}
              </div>
            </div>

            {/* PASSWORD FIELDS ROW */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* PASSWORD FIELD */}
              <div>
                <label htmlFor="password" className="mb-2 block font-bold uppercase tracking-wider">
                  &gt; Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-4 border-[#1A1A1A] bg-[#F4F0EA] px-4 py-3 font-bold focus:bg-[#39FF14]/10 focus:outline-none"
                />
              </div>

              {/* CONFIRM PASSWORD FIELD */}
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block font-bold uppercase tracking-wider">
                  &gt; Confirm_Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-4 border-[#1A1A1A] bg-[#F4F0EA] px-4 py-3 font-bold focus:bg-[#39FF14]/10 focus:outline-none"
                />
              </div>
            </div>

            {/* REGISTER BUTTON */}
            <button
              type="submit"
              disabled={
                usernameAvailability === "checking" ||
                usernameAvailability === "unavailable" ||
                username.length < 3 ||
                loading
              }
              className="mt-4 w-full border-4 border-[#1A1A1A] bg-[#39FF14] py-4 text-xl font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_#1A1A1A] transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[10px_10px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              {loading ? "PROCESSING..." : "EXECUTE_REGISTRATION"}
            </button>
          </form>

          <div className="mt-8 border-t-4 border-dashed border-[#1A1A1A] pt-6 text-center">
            <span className="font-bold uppercase">System already active?</span>{" "}
            <Link
              href="/login"
              className="inline-block bg-[#1A1A1A] px-2 font-bold text-[#39FF14] hover:bg-[#FF5722] hover:text-white"
            >
              SYS.LOGIN()
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}