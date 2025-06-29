"use client";

import { apiClient } from "@/lib/api-client";
import { Comment } from "@/models/Comment";
import { Post } from "@/models/Posts";
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
    <div className="mt-4 space-y-2">
      <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
        {allComments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          allComments.map((comment, index) => (
            <div key={index} className="text-sm bg-base-200 p-2 rounded">
              <p className="font-semibold">{(comment.userPosted as any)?.username  || "Anonymous"}</p>
              <p>{comment.content}</p>
              <p className="text-xs text-right text-gray-500">❤️ {comment.likecount} likes</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          placeholder="Write a comment..."
          className="input input-sm input-bordered flex-1"
          value={newCommentContent}
          onChange={(e) => setNewCommentContent(e.target.value)}
        />
        <button
          className="btn btn-sm btn-primary"
          onClick={handleSubmit}
          disabled={!session?.user}
        >
          Post
        </button>
      </div>
    </div>
  );
}
