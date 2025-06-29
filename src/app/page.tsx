"use client";


import { BackgroundBeams } from "@/components/background-beams";
import FeaturesSection from "@/components/FeaturesSection";
import { TypewriterEffectDemo } from "@/components/typewriter";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const {  status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard/feed");
  }, [status, router]);

  if (status === "loading") return <p>Loading...</p>;

  return (
  <div className="w-screen h-screen">
    <div className="w-full h-full">
    <BackgroundBeams />
    <TypewriterEffectDemo />
    <FeaturesSection />
    
    </div>
  </div>
  );
}
