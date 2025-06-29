import Sidebar from "@/components/Sidebar";
import VideoFeed from "@/components/VideoFeed";
import { apiClient } from "@/lib/api-client";

 // Fetch posts

export default async function FeedPage() {

  

 
  
  const posts = await apiClient.getPosts();



  

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 flex-1">
        

        <VideoFeed posts={posts} />
      </main>
    </div>
  );
}
