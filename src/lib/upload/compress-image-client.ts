"use client";

import imageCompression from "browser-image-compression";

/** Resize/compress in the browser before uploading (email-safe file sizes). */
export async function compressImageForUpload(file: File): Promise<File> {
  if (file.type === "image/png") {
    return imageCompression(file, {
      maxSizeMB: 0.75,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      initialQuality: 0.9,
      fileType: "image/png",
    });
  }

  if (file.type === "image/webp") {
    return imageCompression(file, {
      maxSizeMB: 0.55,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.85,
      fileType: "image/webp",
    });
  }

  return imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.85,
    fileType: "image/jpeg",
  });
}
