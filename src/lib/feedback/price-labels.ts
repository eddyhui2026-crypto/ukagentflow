/** Vendor-facing labels (reports, UI). DB enums: too_high, fair, good_value, great_value, slightly_high. */
export function formatPriceOpinionVendor(opinion: string): string {
  if (opinion === "too_high") return "Too expensive";
  if (opinion === "good_value") return "Good value";
  if (opinion === "great_value") return "Great value";
  if (opinion === "slightly_high") return "Slightly high";
  return "Fair price";
}
