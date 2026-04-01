import { headers } from "next/headers";

/**
 * Best-effort client IP for rate limiting behind proxies (Vercel, etc.).
 */
export async function getRequestClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first.slice(0, 128);
    }
  }
  const realIp = h.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp.slice(0, 128);
  }
  return "unknown";
}
