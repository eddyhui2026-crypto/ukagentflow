import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const api_key = process.env.CLOUDINARY_API_KEY?.trim();
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  configured = true;
}

export async function uploadImageToCloudinary(options: {
  buffer: Buffer;
  mimeType: string;
  folder: string;
  publicId: string;
}): Promise<string> {
  ensureConfigured();

  const dataUri = `data:${options.mimeType};base64,${options.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: options.folder,
    public_id: options.publicId,
    resource_type: "image",
    overwrite: true,
    invalidate: true,
  });

  const url = result.secure_url;
  if (typeof url !== "string" || !url.startsWith("https://")) {
    throw new Error("CLOUDINARY_UPLOAD_FAILED");
  }
  return url;
}
