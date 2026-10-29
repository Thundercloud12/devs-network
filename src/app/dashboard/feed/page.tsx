"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import VideoFeed from "@/components/VideoFeed";
import { apiClient } from "@/lib/api-client";
import { Post } from "@/models/Posts";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient.getPosts()
      .then(setPosts)
      .catch((error) => setError(error instanceof Error ? error.message : "Could not load posts."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex bg-[#F4F0EA] min-h-screen">
      <Sidebar />
      <main className="ml-72 p-10 flex-1 pt-24">
        {loading ? (
          <p className="text-center font-black uppercase">LOADING_FEED...</p>
        ) : error ? (
          <p role="alert" className="text-center font-black uppercase text-[#FF5722]">{error}</p>
        ) : (
          <VideoFeed posts={posts} />
        )}
      </main>
    </div>
  );
}
