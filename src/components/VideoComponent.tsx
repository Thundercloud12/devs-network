"use client";

import { useState, useTransition } from "react";
import { IKVideo } from "imagekitio-next";
import CommentDisplay from "./CommentDisplay";
import { useSession } from "next-auth/react";
import { Post } from "@/models/Posts";

export default function VideoComponent({ video }: { video: Post }) {
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [reported, setReported] = useState(false);
  const session = useSession();
  const userId = session.data?.user.email;

  const handleReport = async () => {
    if (reported) return;

    startTransition(async () => {
      try {
        await fetch("/api/report-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: video._id }),
        });
        setReported(true);
      } catch (err) {
        console.error("Failed to report post:", err);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-base-100 rounded-xl shadow border border-base-300 p-4 w-full max-w-2xl">
      {/* Title */}
      {video.title && (
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {video.title}
        </h2>
      )}
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm text-gray-500">{userId || "Unknown User"}</span>
        <span className="text-xs text-gray-500">
          {new Date(video.createdAt || "").toLocaleDateString()}
        </span>
      </div>

      {/* Video */}
      <div className="rounded-xl overflow-hidden mt-3 w-full">
        <IKVideo
          urlEndpoint="https://ik.imagekit.io/hnadywdm3"
          path={video.mediaUrl}
          controls
          className="w-full h-auto object-contain"
          transformation={[{  width: "1080" }]}
        />
      </div>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 mt-3 text-sm">
        {video.description}
      </p>

      {/* Actions */}
      <div className="flex justify-around items-center mt-3 border-t pt-3 border-base-200">
        <button
          className="btn btn-sm btn-outline"
          onClick={() => setLikeCount((prev) => prev + 1)}
        >
          ❤️ Like ({likeCount})
        </button>
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
          <CommentDisplay postId={video._id?.toString() || ""} />
        </div>
      )}
    </div>
  );
}
