export const SALE_STATUSES = ["active", "stc", "sold", "withdrawn"] as const;
export type SaleStatus = (typeof SALE_STATUSES)[number];

export const LETTING_STATUSES = ["active", "let_agreed", "let", "withdrawn"] as const;
export type LettingStatus = (typeof LETTING_STATUSES)[number];

/** Feedback rows for these instructions are hidden on the company dashboard (archived). */
export const PROPERTY_STATUSES_ARCHIVED_ON_DASHBOARD = new Set<string>([
  "sold",
  "let",
  "withdrawn",
]);

const SALE_LABELS: Record<string, string> = {
  active: "Active",
  stc: "Under offer (STC)",
  sold: "Sold",
  withdrawn: "Withdrawn",
};

const LETTING_LABELS: Record<string, string> = {
  active: "Available",
  let_agreed: "Let agreed",
  let: "Let",
  withdrawn: "Withdrawn",
};

export function isValidPropertyStatus(
  listingType: "sale" | "letting",
  status: string,
): boolean {
  const s = status.toLowerCase();
  if (listingType === "sale") {
    return (SALE_STATUSES as readonly string[]).includes(s);
  }
  return (LETTING_STATUSES as readonly string[]).includes(s);
}

export function propertyStatusLabel(
  listingType: "sale" | "letting",
  status: string,
): string {
  const s = status.toLowerCase();
  if (listingType === "sale") {
    return SALE_LABELS[s] ?? status;
  }
  return LETTING_LABELS[s] ?? status;
}

export function propertyStatusOptions(
  listingType: "sale" | "letting",
): { value: string; label: string }[] {
  if (listingType === "sale") {
    return SALE_STATUSES.map((v) => ({ value: v, label: SALE_LABELS[v] ?? v }));
  }
  return LETTING_STATUSES.map((v) => ({ value: v, label: LETTING_LABELS[v] ?? v }));
}
