"use client";

import { useEffect, useState, useTransition } from "react";
import { IKImage } from "imagekitio-next";
import Link from "next/link";
import { Post } from "@/models/Posts";
import CommentDisplay from "./CommentDisplay";
import LikeButton from "./LikeButton";
import { useSession } from "next-auth/react";

export default function ImageComponent({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [reported, setReported] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { data: session } = useSession();

  const fetchLikeInfo = async () => {
    try {
      const res = await fetch(`/api/like/status?postId=${post._id}`);
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
    } catch (err) {
      console.error("Error fetching like info:", err);
    }
  };
  
  useEffect(() => {
    if (session?.user) {
      console.log(post);
      
      fetchLikeInfo();
    }
  }, [session?.user, post._id]);

  const handleReport = async () => {
    if (reported) return;

    startTransition(async () => {
      try {
        await fetch("/api/report-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: post._id }),
        });
        setReported(true);
      } catch (err) {
        console.error("Failed to report post:", err);
      }
    });
  };
  
  return (
    <div className="bg-white dark:bg-base-100 rounded-xl shadow border border-base-300 p-4 max-w-2xl w-full">
      {/* Title */}
      {post.title && (
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {post.title}
        </h2>
      )}
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {post.userPosted.username || "Unknown User"}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(post.createdAt || "").toLocaleDateString()}
        </span>
      </div>

      {/* Image */}
      <div className="rounded-xl overflow-hidden mt-3 w-full aspect-video">
        <Link href={`/posts/${post._id}`} className="relative group block w-full h-full">
        <IKImage
            urlEndpoint="https://ik.imagekit.io/hnadywdm3"
            path={post.mediaUrl}
            transformation={[{  width: "1080" }]}
            alt="post image"
            className="w-full h-full object-contain"
          />
        </Link>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">
        {post.description}
      </p>

      {/* Actions */}
      <div className="flex justify-around items-center mt-3 pt-3 border-t border-base-200">
        {liked !== null && likeCount !== null ? (
          <LikeButton
            postId={post._id!.toString()}
            initialLiked={liked}
            initialCount={likeCount}
          />
        ) : (
          <span className="text-sm text-gray-400">Loading Likes...</span>
        )}
        <button
          className="btn btn-sm btn-outline"
          onClick={() => setShowComments((prev) => !prev)}
        >
          💬 Comments
        </button>
        <button
          className={`btn btn-sm ${reported ? "btn-disabled" : "btn-outline text-red-500"}`}
          onClick={handleReport}
          disabled={isPending || reported}
        >
          🚩 {reported ? "Reported" : "Report"}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4">
          <CommentDisplay postId={post._id?.toString() || ""} />
        </div>
      )}
    </div>
  );
}
