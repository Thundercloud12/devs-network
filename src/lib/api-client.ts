import { Comment } from "@/models/Comment";
import { Post} from "@/models/Posts";

export type VideoFormData = Omit<Post, "_id">;

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
};

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
    const response = await fetch(`http://localhost:3000/api${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    // Log status and headers

    
    const text = await response.text(); // read as raw text first
  
    
    try {
      // Try parsing JSON from raw text
      return JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse JSON:", err);
      throw new Error(`Invalid JSON response: ${text}`);
    }
    


  }

  async getPosts(): Promise<Post[]> {
    return this.fetch<Post[]>("/posts"); // ✅ Uses the internal fetch method that returns parsed JSON
  }

  async getVideo(id: string) {
    return this.fetch<Post>(`/videos/${id}`);
  }

  async createPost(videoData: VideoFormData) {
    return this.fetch<Post>("/posts", {
      method: "POST",
      body: videoData,
    });
  }
  async createComment(comment: string, postId: string) {
    return this.fetch<Comment>("/comment", {
      method: "POST",
      body: { content: comment, postId },
    });
  }
  
  async getComments(postId: string) {
    return this.fetch(`/comment?postId=${postId}`, {
      method: "GET",
    });
  }

  async deleteAcc(){
    return this.fetch("/auth/delete-user", {
      method: "DELETE"
    })
  }
  
}
  

export const apiClient = new ApiClient();