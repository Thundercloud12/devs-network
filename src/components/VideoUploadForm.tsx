"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { Loader2, UploadCloud } from "lucide-react";
import { useNotification } from "./Notification";
import { apiClient } from "@/lib/api-client";
import FileUpload from "./FileUpload";
import Sidebar from "./Sidebar";
import { Comment } from "@/models/Comment";

interface MediaFormData {
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string;
  imagekitFileId: string; // ✅ NEW
  likecount: number;
  comments: Comment[];
}

export default function MediaUploadForm() {
  const [mediaType, setMediaType] = useState<"video" | "image">("video");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MediaFormData>({
    defaultValues: {
      title: "",
      description: "",
      mediaUrl: "",
      thumbnailUrl: "",
      imagekitFileId: "", // ✅ NEW
      likecount: 0,
      comments: [],
    }
    
  });

  const handleUploadSuccess = (response: IKUploadResponse) => {
    setValue("mediaUrl", response.filePath); // filePath can be used if needed
    setValue("thumbnailUrl", response.thumbnailUrl || response.filePath);
    setValue("imagekitFileId", response.fileId); 
    console.log(response.fileId);
    
    showNotification(
      `${mediaType === "video" ? "Video" : "Image"} uploaded successfully!`,
      "success"
    );
  };
  

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  const onSubmit = async (data: MediaFormData) => {
    if (!data.mediaUrl) {
      showNotification(`Please upload a ${mediaType} first`, "error");
      return;
    }

    setLoading(true);
    try {
      await apiClient.createPost({ ...data, type: mediaType, flagged: false});
      showNotification(
        `${mediaType === "video" ? "Video" : "Image"} published successfully!`,
        "success"
      );

      setValue("title", "");
      setValue("description", "");
      setValue("mediaUrl", "");
      setValue("thumbnailUrl", "");
      setValue("imagekitFileId", ""); 
      setUploadProgress(0);
    } catch (error) {
      console.error(error);
      showNotification(
        error instanceof Error ? error.message : `Failed to publish ${mediaType}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMediaTypeChange = () => {
    const newMediaType = mediaType === "video" ? "image" : "video";
    setMediaType(newMediaType);
 
    setValue("mediaUrl", "");
    setValue("thumbnailUrl", "");
    setValue("imagekitFileId", ""); 
  
    setUploadProgress(0); 
  };

  return (
    <div>
      <Sidebar />
      <label className="flex items-center gap-2 justify-center mb-4">
        <span className="label-text font-medium">Image</span>
        <input
          type="checkbox"
          className="toggle theme-controller"
          checked={mediaType === "video"}
          onChange={handleMediaTypeChange}
        />
        <span className="label-text font-medium">Video</span>
      </label>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-base-200 rounded-xl p-6 shadow-md space-y-6 w-full max-w-2xl mx-auto"
      >
        <h2 className="text-xl font-semibold text-center">
          Share your {mediaType === "video" ? "Video Project" : "Image Post"}
        </h2>

        <div className="form-control">
          <input
            type="text"
            placeholder="Title"
            className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`}
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && <span className="text-error text-sm">{errors.title.message}</span>}
        </div>

        <div className="form-control">
          <textarea
            placeholder="Write a short description..."
            className={`textarea textarea-bordered h-28 w-full ${
              errors.description ? "textarea-error" : ""
            }`}
            {...register("description", { required: "Description is required" })}
          />
          {errors.description && (
            <span className="text-error text-sm">{errors.description.message}</span>
          )}
        </div>

        <div className="form-control">
          <FileUpload
            fileType={mediaType}
            onSuccess={handleUploadSuccess}
            onProgress={handleUploadProgress}
          />
          {uploadProgress > 0 && (
            <div className="w-full bg-base-300 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full flex items-center justify-center gap-2"
          disabled={loading || !uploadProgress}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              Publish {mediaType === "video" ? "Video" : "Image"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
