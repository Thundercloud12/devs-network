"use client";

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface FileUploadProps {
  onSuccess: (res: any) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
}

export default function FileUpload({
  onSuccess,
  onProgress,
  fileType = "image",
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortController = new AbortController();

  const validateFile = (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Please upload a valid video file");
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError("Video size must be less than 100MB");
        return false;
      }
    } else {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, or WebP)");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return false;
      }
    }
    return true;
  };

  const getAuthParams = async () => {
    const response = await fetch("/api/upload-auth");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Auth failed: ${errorText}`);
    }
    return await response.json(); // { signature, token, expire, publicKey }
  };

  const handleUpload = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setError("Please select a file to upload");
      return;
    }

    const file = fileInput.files[0];
    if (!validateFile(file)) return;

    setUploading(true);
    setError(null);

    try {
      const { signature, expire, token, publicKey } = await getAuthParams();

      const uploadResponse = await upload({
        file,
        fileName: file.name,
        publicKey,
        signature,
        expire,
        token,
        folder: fileType === "video" ? "/videos" : "/images",
        useUniqueFileName: true,
        onProgress: (evt) => {
          if (evt.lengthComputable && onProgress) {
            const percent = (evt.loaded / evt.total) * 100;
            onProgress(Math.round(percent));
          }
        },
        abortSignal: abortController.signal,
      });

      console.log(uploadResponse)

      onSuccess(uploadResponse);
    } catch (error) {
      if (error instanceof ImageKitAbortError) {
        setError("Upload aborted.");
      } else if (error instanceof ImageKitInvalidRequestError) {
        setError("Invalid upload request.");
      } else if (error instanceof ImageKitUploadNetworkError) {
        setError("Network error during upload.");
      } else if (error instanceof ImageKitServerError) {
        setError("Server error during upload.");
      } else {
        setError("Unexpected error: " + (error as Error).message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept={fileType === "video" ? "video/*" : "image/*"}
          className="hidden"
          onChange={() => setError(null)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-4 border-[#1A1A1A] bg-white p-4 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#1A1A1A] hover:bg-[#FFD700] transition-colors"
        >
          {fileInputRef.current?.files?.[0]?.name || `SELECT_${fileType.toUpperCase()}_FILE`}
        </button>
      </div>

      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading}
        className="w-full border-4 border-[#1A1A1A] bg-[#39FF14] py-4 font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_#1A1A1A] transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[10px_10px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            UPLOADING...
          </div>
        ) : (
          "EXECUTE_UPLOAD"
        )}
      </button>

      {error && (
        <div className="border-4 border-[#1A1A1A] bg-[#FF5722] p-3 text-white font-black uppercase text-xs">
          [ERR] {error}
        </div>
      )}
    </div>
  );
}
