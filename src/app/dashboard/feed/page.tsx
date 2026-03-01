"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import VideoFeed from "@/components/VideoFeed";
import { apiClient } from "@/lib/api-client";
import { Post } from "@/models/Posts";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    apiClient.getPosts().then(setPosts).catch(console.error);
  }, []);

  return (
    <div className="flex bg-[#F4F0EA] min-h-screen">
      <Sidebar />
      <main className="ml-72 p-10 flex-1 pt-24">
        <VideoFeed posts={posts} />
      </main>
    </div>
  );
}
