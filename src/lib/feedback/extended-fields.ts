/** Stored as semicolon-separated keys (order preserved, empty = none). */
export const HIGHLIGHT_KEYS = [
  "kitchen",
  "garden",
  "location",
  "transport",
  "size_layout",
] as const;

export type HighlightKey = (typeof HIGHLIGHT_KEYS)[number];

export const NEGATIVE_KEYS = [
  "room_size",
  "decoration",
  "parking",
  "noise_location",
  "other",
] as const;

export type NegativeKey = (typeof NEGATIVE_KEYS)[number];

export const HIGHLIGHT_LABELS: Record<HighlightKey, string> = {
  kitchen: "Kitchen",
  garden: "Garden / outdoor space",
  location: "Location",
  transport: "Transport / commute",
  size_layout: "Size / layout",
};

export const NEGATIVE_LABELS: Record<NegativeKey, string> = {
  room_size: "Room size",
  decoration: "Decoration / condition",
  parking: "Parking",
  noise_location: "Noise / neighbours / location niggles",
  other: "Other",
};

const HIGHLIGHT_SET = new Set<string>(HIGHLIGHT_KEYS);
const NEGATIVE_SET = new Set<string>(NEGATIVE_KEYS);

export function parseSemicolonKeys(
  raw: string | null | undefined,
  allow: Set<string>,
): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(";")
    .map((s) => s.trim())
    .filter((k) => allow.has(k));
}

export function storeHighlights(keys: string[]): string {
  return [...new Set(keys.filter((k) => HIGHLIGHT_SET.has(k)))].join(";");
}

export function storeNegatives(keys: string[]): string {
  return [...new Set(keys.filter((k) => NEGATIVE_SET.has(k)))].join(";");
}

export function highlightsToDisplayString(stored: string): string {
  const keys = parseSemicolonKeys(stored, HIGHLIGHT_SET) as HighlightKey[];
  return keys.map((k) => HIGHLIGHT_LABELS[k]).join("; ") || "—";
}

export function negativesToDisplayString(stored: string): string {
  const keys = parseSemicolonKeys(stored, NEGATIVE_SET) as NegativeKey[];
  return keys.map((k) => NEGATIVE_LABELS[k]).join("; ") || "—";
}

export function parseHighlightsFromFormData(formData: FormData): string[] {
  const all = formData.getAll("property_highlights");
  const out: string[] = [];
  for (const v of all) {
    const k = String(v ?? "").trim();
    if (HIGHLIGHT_SET.has(k)) out.push(k);
  }
  return [...new Set(out)];
}

export function parseNegativesFromFormData(formData: FormData): string[] {
  const all = formData.getAll("negative_feedback_tags");
  const out: string[] = [];
  for (const v of all) {
    const k = String(v ?? "").trim();
    if (NEGATIVE_SET.has(k)) out.push(k);
  }
  return [...new Set(out)];
}

export function formatBuyerPosition(raw: string | null | undefined): string {
  if (!raw) return "—";
  switch (raw) {
    case "first_time_buyer":
      return "First-time buyer";
    case "chain_free":
      return "Chain-free";
    case "cash_buyer":
      return "Cash buyer";
    case "other":
      return "Other";
    default:
      return raw;
  }
}

export function formatHasAip(v: boolean | null | undefined): string {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "—";
}
