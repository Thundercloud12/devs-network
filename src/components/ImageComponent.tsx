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
    <div className="bg-white border-4 border-[#1A1A1A] p-6 w-full max-w-2xl shadow-[8px_8px_0px_0px_#1A1A1A] transition-transform hover:-translate-y-1">
      {/* Title */}
      {post.title && (
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#1A1A1A] mb-2">
          {post.title}
        </h2>
      )}
      <div className="flex items-center justify-between mb-4 border-b-2 border-dashed border-[#1A1A1A] pb-2 font-bold uppercase text-xs tracking-widest">
        <span>&gt; USER: {(post.userPosted as any)?.username || "ANONYMOUS"}</span>
        <span>{new Date(post.createdAt || "").toLocaleDateString()}</span>
      </div>

      {/* Image */}
      <div className="border-4 border-[#1A1A1A] overflow-hidden bg-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] aspect-video">
        <Link href={`/posts/${post._id}`} className="relative group block w-full h-full">
          <IKImage
            urlEndpoint="https://ik.imagekit.io/hnadywdm3"
            path={post.mediaUrl}
            transformation={[{ width: "1080" }]}
            alt="post image"
            className="w-full h-full object-contain"
          />
        </Link>
      </div>

      {/* Description */}
      <p className="text-[#1A1A1A] font-bold mt-4 text-sm leading-relaxed border-l-4 border-[#FF5722] pl-3">
        {post.description}
      </p>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {liked !== null && likeCount !== null ? (
          <LikeButton
            postId={post._id!.toString()}
            initialLiked={liked}
            initialCount={likeCount}
          />
        ) : (
          <div className="border-4 border-[#1A1A1A] bg-gray-100 py-2 text-center font-black uppercase text-[10px]">
            WAIT...
          </div>
        )}
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
          {reported ? "REPORTED" : "REPORT"}
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
