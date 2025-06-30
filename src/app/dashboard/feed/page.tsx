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
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 flex-1">
        <VideoFeed posts={posts} />
      </main>
    </div>
  );
}
