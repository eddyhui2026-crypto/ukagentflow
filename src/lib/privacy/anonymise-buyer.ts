/**
 * Vendor-facing export: no full name, no email. "Buyer J." style from last word initial.
 */
export function anonymiseBuyerNameForVendor(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Buyer";
  const last = parts[parts.length - 1]!;
  const initial = last.charAt(0).toUpperCase();
  if (!/[A-Z]/.test(initial)) return "Buyer";
  return `Buyer ${initial}.`;
}
