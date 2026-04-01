const URL_ENV_KEYS = ["AUTH_URL", "NEXTAUTH_URL", "NEXT_PUBLIC_APP_URL"] as const;

/**
 * Hosting panels often store a bare host (e.g. `ukagentflow.harbix.app`). NextAuth's
 * middleware uses `new URL(AUTH_URL)` — without `https://` that throws ERR_INVALID_URL
 * and breaks every RSC render that touches auth.
 */
export function ensurePublicUrlEnvAbsolute(): void {
  for (const key of URL_ENV_KEYS) {
    const raw = process.env[key]?.trim();
    if (!raw) continue;
    if (/^https?:\/\//i.test(raw)) continue;
    const candidate = `https://${raw.replace(/^\/+/, "")}`;
    try {
      new URL(candidate);
      process.env[key] = candidate;
    } catch {
      /* leave unchanged */
    }
  }
}
