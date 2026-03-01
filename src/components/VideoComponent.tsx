"use client";

import { useState, useTransition } from "react";
import { IKVideo } from "imagekitio-next";
import CommentDisplay from "./CommentDisplay";
import LikeButton from "./LikeButton";
import { useSession } from "next-auth/react";
import { Post } from "@/models/Posts";

export default function VideoComponent({ video }: { video: Post }) {
  const [showComments, setShowComments] = useState(false);
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
    <div className="bg-white border-4 border-[#1A1A1A] p-6 w-full max-w-2xl shadow-[8px_8px_0px_0px_#1A1A1A] transition-transform hover:-translate-y-1">
      {/* Title */}
      {video.title && (
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#1A1A1A] mb-2">
          {video.title}
        </h2>
      )}
      <div className="flex items-center justify-between mb-4 border-b-2 border-dashed border-[#1A1A1A] pb-2 font-bold uppercase text-xs tracking-widest">
        <span>&gt; USER: {userId || "ANONYMOUS"}</span>
        <span>{new Date(video.createdAt || "").toLocaleDateString()}</span>
      </div>

      {/* Video */}
      <div className="border-4 border-[#1A1A1A] overflow-hidden bg-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
        <IKVideo
          urlEndpoint="https://ik.imagekit.io/hnadywdm3"
          path={video.mediaUrl}
          controls
          className="w-full h-auto object-contain"
          transformation={[{ width: "1080" }]}
        />
      </div>

      {/* Description */}
      <p className="text-[#1A1A1A] font-bold mt-4 text-sm leading-relaxed border-l-4 border-[#FF5722] pl-3">
        {video.description}
      </p>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <LikeButton
          postId={video._id?.toString() || ""}
          initialLiked={false} // Note: video model might need 'liked' status from API
          initialCount={video.likecount || 0}
        />
        <button
          className="border-4 border-[#1A1A1A] bg-[#39FF14] py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_#1A1A1A] transition-all hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none"
          onClick={() => setShowComments((prev) => !prev)}
        >
          COMMENTS
        </button>
        <button
          className={`border-4 border-[#1A1A1A] py-2 font-black uppercase text-xs transition-all ${reported
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-[#FF5722] text-white shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none"
            }`}
          onClick={handleReport}
          disabled={isPending || reported}
        >
          {reported ? "REPORTED" : "REPORT_POST"}
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
