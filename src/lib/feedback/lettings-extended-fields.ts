/** Stored as semicolon-separated keys (order preserved, empty = none). */

export const LETTINGS_HIGHLIGHT_KEYS = [
  "location_transport",
  "condition_decor",
  "kitchen_appliances",
  "furniture_included",
] as const;

export type LettingsHighlightKey = (typeof LETTINGS_HIGHLIGHT_KEYS)[number];

export const LETTINGS_NEGATIVE_KEYS = [
  "room_sizes",
  "lack_storage",
  "no_parking",
  "epc_energy",
  "noise_street",
] as const;

export type LettingsNegativeKey = (typeof LETTINGS_NEGATIVE_KEYS)[number];

export const LETTINGS_HIGHLIGHT_LABELS: Record<LettingsHighlightKey, string> = {
  location_transport: "Location / transport",
  condition_decor: "Condition / decor",
  kitchen_appliances: "Kitchen / appliances",
  furniture_included: "Furniture included (if applicable)",
};

export const LETTINGS_NEGATIVE_LABELS: Record<LettingsNegativeKey, string> = {
  room_sizes: "Room sizes",
  lack_storage: "Lack of storage",
  no_parking: "No parking",
  epc_energy: "EPC / energy costs",
  noise_street: "Noise / street",
};

const HL = new Set<string>(LETTINGS_HIGHLIGHT_KEYS);
const NG = new Set<string>(LETTINGS_NEGATIVE_KEYS);

export function parseLettingsSemicolonKeys(raw: string | null | undefined, allow: Set<string>): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(";")
    .map((s) => s.trim())
    .filter((k) => allow.has(k));
}

export function storeLettingsHighlights(keys: string[]): string {
  return [...new Set(keys.filter((k) => HL.has(k)))].join(";");
}

export function storeLettingsNegatives(keys: string[]): string {
  return [...new Set(keys.filter((k) => NG.has(k)))].join(";");
}

export function lettingsHighlightsToDisplayString(stored: string): string {
  const keys = parseLettingsSemicolonKeys(stored, HL) as LettingsHighlightKey[];
  return keys.map((k) => LETTINGS_HIGHLIGHT_LABELS[k]).join("; ") || "—";
}

export function lettingsNegativesToDisplayString(stored: string): string {
  const keys = parseLettingsSemicolonKeys(stored, NG) as LettingsNegativeKey[];
  return keys.map((k) => LETTINGS_NEGATIVE_LABELS[k]).join("; ") || "—";
}

export function parseLettingsHighlightsFromFormData(formData: FormData): string[] {
  const all = formData.getAll("lettings_property_highlights");
  const out: string[] = [];
  for (const v of all) {
    const k = String(v ?? "").trim();
    if (HL.has(k)) out.push(k);
  }
  return [...new Set(out)];
}

export function parseLettingsNegativesFromFormData(formData: FormData): string[] {
  const all = formData.getAll("lettings_negative_tags");
  const out: string[] = [];
  for (const v of all) {
    const k = String(v ?? "").trim();
    if (NG.has(k)) out.push(k);
  }
  return [...new Set(out)];
}

export function formatOccupantCount(raw: string | null | undefined): string {
  if (!raw) return "—";
  switch (raw) {
    case "1":
      return "1";
    case "2":
      return "2";
    case "3":
      return "3";
    case "4_plus":
      return "4+";
    default:
      return raw;
  }
}

export function formatIncomeBand(raw: string | null | undefined): string {
  if (!raw || raw === "unspecified") return "—";
  switch (raw) {
    case "25k_plus":
      return "£25k+";
    case "35k_plus":
      return "£35k+";
    case "50k_plus":
      return "£50k+";
    default:
      return raw;
  }
}
