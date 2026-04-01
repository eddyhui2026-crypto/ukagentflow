const MAX_LEN = 2048;

/** Accepts only https image URLs for storage and email <img src>. Empty → null. */
export function parseHttpsImageUrl(raw: string | null | undefined): string | null {
  const s = raw?.trim();
  if (!s) return null;
  if (s.length > MAX_LEN) return null;

  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }

  if (u.protocol !== "https:") return null;
  if (u.username || u.password) return null;

  return u.href;
}
