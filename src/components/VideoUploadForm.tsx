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
      await apiClient.createPost({ ...data, type: mediaType, flagged: false });
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
    <div className="bg-[#F4F0EA] min-h-screen">
      <Sidebar />
      <main className="ml-72 p-10 pt-24">
        <div className="max-w-2xl mx-auto">
          {/* MEDIA TYPE TOGGLE */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex border-4 border-[#1A1A1A] bg-white p-2 shadow-[8px_8px_0px_0px_#1A1A1A]">
              <button
                type="button"
                onClick={() => mediaType !== "image" && handleMediaTypeChange()}
                className={`px-6 py-2 font-black uppercase tracking-widest transition-colors ${mediaType === "image" ? "bg-[#FF5722] text-white" : "hover:bg-[#F4F0EA]"
                  }`}
              >
                IMAGE
              </button>
              <button
                type="button"
                onClick={() => mediaType !== "video" && handleMediaTypeChange()}
                className={`px-6 py-2 font-black uppercase tracking-widest transition-colors ${mediaType === "video" ? "bg-[#39FF14] text-[#1A1A1A]" : "hover:bg-[#F4F0EA]"
                  }`}
              >
                VIDEO
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="border-4 border-[#1A1A1A] bg-white shadow-[12px_12px_0px_0px_#1A1A1A] overflow-hidden"
          >
            {/* FORM HEADER */}
            <div className="border-b-4 border-[#1A1A1A] bg-[#FFD700] px-6 py-4 flex items-center justify-between">
              <span className="font-black uppercase tracking-widest text-[#1A1A1A]">
                POST_INITIALIZER.EXE
              </span>
              <div className="flex gap-2">
                <div className="h-3 w-3 border-2 border-[#1A1A1A] bg-white"></div>
                <div className="h-3 w-3 border-2 border-[#1A1A1A] bg-[#1A1A1A]"></div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter">
                  Share Your<br />{mediaType === "video" ? "Project_Video" : "Dev_Update"}
                </h2>
                <p className="font-bold text-[#FF5722]">&gt; BROADCAST_TO_NETWORK</p>
              </div>

              {/* TITLE FIELD */}
              <div className="space-y-2">
                <label className="block font-black uppercase tracking-widest text-sm text-[#1A1A1A]">
                  &gt; Project_Title
                </label>
                <input
                  type="text"
                  placeholder="IDENTIFIER"
                  className={`w-full border-4 border-[#1A1A1A] bg-[#F4F0EA] px-4 py-3 font-bold placeholder:text-gray-400 focus:bg-[#FFD700]/10 focus:outline-none ${errors.title ? "border-[#FF5722]" : ""
                    }`}
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && <span className="text-[#FF5722] text-xs font-black uppercase tracking-widest">[ERR] {errors.title.message}</span>}
              </div>

              {/* DESCRIPTION FIELD */}
              <div className="space-y-2">
                <label className="block font-black uppercase tracking-widest text-sm text-[#1A1A1A]">
                  &gt; Project_Logs
                </label>
                <textarea
                  placeholder="DESCRIBE_WORKFLOW..."
                  className={`w-full border-4 border-[#1A1A1A] bg-[#F4F0EA] px-4 py-3 font-bold h-32 placeholder:text-gray-400 focus:bg-[#FFD700]/10 focus:outline-none ${errors.description ? "border-[#FF5722]" : ""
                    }`}
                  {...register("description", { required: "Description is required" })}
                />
                {errors.description && (
                  <span className="text-[#FF5722] text-xs font-black uppercase tracking-widest">[ERR] {errors.description.message}</span>
                )}
              </div>

              {/* FILE UPLOAD COMPONENT */}
              <div className="space-y-4">
                <label className="block font-black uppercase tracking-widest text-sm text-[#1A1A1A]">
                  &gt; Raw_Assets
                </label>
                <FileUpload
                  fileType={mediaType}
                  onSuccess={handleUploadSuccess}
                  onProgress={handleUploadProgress}
                />

                {uploadProgress > 0 && (
                  <div className="relative h-6 border-4 border-[#1A1A1A] bg-white">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#39FF14] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center font-black text-xs uppercase mix-blend-difference text-white">
                      TRANSFER_PROGRESS: {uploadProgress}%
                    </div>
                  </div>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="w-full border-4 border-[#1A1A1A] bg-[#1A1A1A] py-5 text-xl font-black uppercase tracking-widest text-[#39FF14] shadow-[8px_8px_0px_0px_#1A1A1A] transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[12px_12px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
                disabled={loading || !uploadProgress}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    BROADCASTING...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <UploadCloud className="w-6 h-6" />
                    INITIALIZE_PUBLISH
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
