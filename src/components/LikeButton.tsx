"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const { data: session } = useSession();

  // 🟢 Make sure to sync props on mount
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);

  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialCount);
  }, [initialLiked, initialCount]); // ✅ Sync props when they change

  const toggleLike = async () => {
    if (!session) {
      alert("Please log in to like posts.");
      return;
    }

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        body: JSON.stringify({ postId }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (data.liked !== undefined) {
        setLiked(data.liked);
        setLikeCount((prev) => prev + (data.liked ? 1 : -1));
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  return (
    <button onClick={toggleLike} className="flex items-center gap-2">
      {liked ? "❤️" : "🤍"} <span>{likeCount}</span>
    </button>
  );
}
