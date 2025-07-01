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
    console.log(result,"in signIn")

    if (result?.error) {
      showNotification(result.error, "error");
    } else {
      showNotification("Login successful!", "success");
      router.push("/dashboard/feed");
    }
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Accertinity-style background overlay */}
      <BackgroundBeams />

      <div className="relative z-10 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-600">Welcome Back</h1>
        <p className="text-gray-600 text-center mt-2">Log in to your account and continue your journey</p>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your username"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              type="password"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition"
            disabled={loading} // <-- Disable while loading
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
