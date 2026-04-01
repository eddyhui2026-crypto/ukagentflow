/**
 * Listing-style photo for Settings → invite preview only.
 * Real buyer emails use `properties.hero_image_url` when set (never this URL).
 */
export const INVITE_EMAIL_PREVIEW_SAMPLE_PROPERTY_IMAGE_URL =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=640&q=80&auto=format&fit=crop";

/** Preview sample line shaped like DB `address` + `postcode` joined with a comma. */
export function splitSamplePropertyLineForInvitePreview(line: string): {
  address: string;
  postcode: string;
} {
  const i = line.lastIndexOf(",");
  if (i === -1) {
    return { address: line.trim(), postcode: "" };
  }
  return {
    address: line.slice(0, i).trim(),
    postcode: line.slice(i + 1).trim(),
  };
}
