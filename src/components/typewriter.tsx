"use client";
import Link from "next/link";
import { TypewriterEffect } from "./ui/typewriter-effect";

export function TypewriterEffectDemo() {
  const words = [
    {
      text: "Build",
    },
    {
      text: "awesome",
    },
    {
      text: "&",
    },
    {
      text: "Share",
    },
    {
      text: "With",
      className: "text-blue-500 dark:text-blue-500",
    },
    {
      text: "Us",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-[40rem] ">
      <p className="text-neutral-600 dark:text-neutral-200 text-base  mb-10">
        The road to freedom starts from here
      </p>
      <TypewriterEffect words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-10">
        <Link href="/register">
        <button className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
          Sign-Up
        </button>
        </Link>
        <Link href="/login">
        <button className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm">
          Login
        </button>
        </Link>
      </div>
    </div>
  );
}
