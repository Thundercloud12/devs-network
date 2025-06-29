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
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={fileType === "video" ? "video/*" : "image/*"}
        className="file-input file-input-bordered w-full"
      />

      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading}
        className="btn btn-primary w-full"
      >
        {uploading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </div>
        ) : (
          "Upload"
        )}
      </button>

      {error && <div className="text-error text-sm">{error}</div>}
    </div>
  );
}
