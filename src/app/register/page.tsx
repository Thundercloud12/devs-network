"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/Notification"; // Assuming this path is correct
import Link from "next/link";
import { useDebounceValue, useDebounceCallback } from "usehooks-ts";
import { BackgroundBeams } from "@/components/background-beams";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameAvailability, setUsernameAvailability] = useState<
    "checking" | "available" | "unavailable" | null
  >(null); // State to track username availability

  const router = useRouter();
  const { showNotification } = useNotification();

  // Debounce the username input value
  const [debouncedUsername, setDebouncedUsername] = useDebounceValue(username, 500); // Debounce for 500ms


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
      
      showNotification("Failed to check username availability.", "error"); 
      setUsernameAvailability(null); 
    }
  }, 7000); 

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

    if (password !== confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }

    // Prevent registration if username is still being checked or is unavailable
    if (usernameAvailability === "checking") {
      showNotification("Please wait, checking username availability...", "info");
      return;
    }
    if (usernameAvailability === "unavailable") {
      showNotification("This username is already taken. Please choose a different one.", "error");
      return;
    }
    // Optional: Add a check if usernameAvailability is null (meaning not checked yet for some reason)
    if (usernameAvailability === null && username.length > 0) {
        showNotification("Please wait for username availability check to complete.", "info");
        return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Include username in the registration payload
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      showNotification("Registration successful! Please log in.", "success");
      router.push("/login");
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Registration failed",
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <BackgroundBeams />
      

      <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-600">Create Your Account</h1>
        <p className="text-gray-600 text-center mt-2">Enter your details to get started</p>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
              placeholder="choose a unique username"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {usernameAvailability === "checking" && (
              <p className="text-sm text-gray-500 mt-1">Checking username availability...</p>
            )}
            {usernameAvailability === "available" && (
              <p className="text-sm text-green-600 mt-1">✅ Username is available!</p>
            )}
            {usernameAvailability === "unavailable" && (
              <p className="text-sm text-red-600 mt-1">❌ Username is already taken.</p>
            )}
            {username.length > 0 && username.length < 3 && usernameAvailability !== "checking" && (
              <p className="text-sm text-red-600 mt-1">Username must be at least 3 characters long.</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={
              usernameAvailability === "checking" ||
              usernameAvailability === "unavailable" ||
              username.length < 3
            }
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}