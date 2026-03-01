"use client";

import { apiClient } from "@/lib/api-client";
import { Comment } from "@/models/Comment";
import { Post } from "@/models/Posts";
import { User } from "@/models/User";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface CommentDisplayProps {
  postId: string;
}




export default function CommentDisplay({ postId }: CommentDisplayProps) {
  const { data: session } = useSession();
  const [newCommentContent, setNewCommentContent] = useState<string>("");
  const [allComments, setAllComments] = useState<Comment[]>([]);

  useEffect(() => {
    // Load existing comments on mount
    const fetchComments = async () => {
      try {
        const response = (await apiClient.getComments(postId)) as Post;
        const comments = (response!.comments) as Comment[];
        setAllComments(comments);
      } catch (error) {
        console.error("Failed to load comments:", error);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    const trimmed = newCommentContent.trim();
    if (trimmed.length === 0 || !session?.user) return;

    try {
      const newComment = await apiClient.createComment(trimmed, postId);
      console.log(newComment);

      setAllComments((prev) => [...prev, newComment]);
      setNewCommentContent("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2 border-t-2 border-dashed border-[#1A1A1A] pt-4">
        {allComments.length === 0 ? (
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/40 mb-4">NO_LOGS_AVAILABLE</p>
        ) : (
          allComments.map((comment, index) => (
            <div key={index} className="border-4 border-[#1A1A1A] bg-[#F4F0EA] p-3 shadow-[4px_4px_0px_0px_#1A1A1A]">
              <div className="flex justify-between items-center mb-1 border-b border-[#1A1A1A] pb-1">
                <span className="text-[10px] font-black uppercase tracking-tighter bg-[#1A1A1A] text-[#39FF14] px-1">
                  &gt; {(comment.userPosted as any)?.username || "ANON_ID"}
                </span>
                <span className="text-[10px] font-bold text-[#1A1A1A]/50 uppercase">
                  HEART_{comment.likecount}
                </span>
              </div>
              <p className="text-xs font-bold text-[#1A1A1A] leading-tight mt-1">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <input
          type="text"
          placeholder="INITIALIZE_COMMENT..."
          className="flex-1 border-4 border-[#1A1A1A] bg-white px-3 py-2 text-xs font-bold placeholder:text-gray-400 focus:bg-[#FFD700]/10 focus:outline-none"
          value={newCommentContent}
          onChange={(e) => setNewCommentContent(e.target.value)}
        />
        <button
          className="border-4 border-[#1A1A1A] bg-[#39FF14] px-4 py-2 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#1A1A1A] transition-all hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50"
          onClick={handleSubmit}
          disabled={!session?.user}
        >
          SEND
        </button>
      </div>
    </div>
  );
}
