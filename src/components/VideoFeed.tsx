"use client";
import { Post } from "@/models/Posts";
import VideoComponent from "./VideoComponent";
import ImageComponent from "./ImageComponent";

interface VideoFeedProps {
  posts: Post[];
}

export default function VideoFeed({ posts }: VideoFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No posts found. Start by creating one!
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {posts.map((post) =>
        post.type === "video" ? (
          <VideoComponent key={post._id!.toString() } video={post} />
        ) : (
          <ImageComponent key={post._id!.toString()}  post={post} />
        )
      )}
    </div>
  );
}
