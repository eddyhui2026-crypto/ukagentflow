import { ensurePublicUrlEnvAbsolute } from "@/lib/env/ensure-public-url-env-absolute";

ensurePublicUrlEnvAbsolute();

/** Absolute base URL for server-side links (emails, etc.). No trailing slash. */
export function getAppBaseUrl(): string {
  const fromAuth = process.env.AUTH_URL?.trim();
  if (fromAuth) {
    return fromAuth.replace(/\/$/, "");
  }
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (publicUrl) {
    return publicUrl.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

/** Origin for Next.js `metadata.metadataBase` (open-graph and canonical URLs). */
export function getMetadataBaseUrl(): URL | undefined {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    (process.env.VERCEL_URL?.trim()
      ? `https://${process.env.VERCEL_URL.trim().replace(/\/$/, "")}`
      : "");
  if (!raw) return undefined;
  try {
    return new URL(raw.replace(/\/$/, ""));
  } catch {
    return undefined;
  }
}
