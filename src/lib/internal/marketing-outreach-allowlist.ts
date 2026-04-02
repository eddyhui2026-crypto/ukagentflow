/**
 * Comma-separated emails in INTERNAL_MARKETING_OUTREACH_EMAILS (case-insensitive).
 * If unset or empty, no one may access internal marketing outreach.
 */
export function parseInternalMarketingOutreachAllowlist(): string[] {
  const raw = process.env.INTERNAL_MARKETING_OUTREACH_EMAILS?.trim();
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isInternalMarketingOutreachAllowed(email: string | null | undefined): boolean {
  if (!email?.trim()) {
    return false;
  }
  const normalized = email.trim().toLowerCase();
  const allowed = parseInternalMarketingOutreachAllowlist();
  return allowed.length > 0 && allowed.includes(normalized);
}
