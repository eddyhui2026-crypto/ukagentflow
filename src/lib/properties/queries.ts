import { getSql } from "@/lib/db/neon";

export type PropertyListRow = {
  id: string;
  address: string;
  postcode: string;
  vendor_name: string;
  status: string;
  created_at: Date | string;
  viewing_count: number;
  feedback_count: number;
  hero_image_url: string | null;
};

export type PropertyListFilters = {
  /** Case-insensitive match on address or postcode */
  q?: string;
};

export async function listPropertiesForCompany(
  companyId: string,
  listing?: "sale" | "letting",
  filters?: PropertyListFilters,
): Promise<PropertyListRow[]> {
  const sql = getSql();
  const listingFilter =
    listing === "sale"
      ? sql`AND p.listing_type = 'sale'::listing_type`
      : listing === "letting"
        ? sql`AND p.listing_type = 'letting'::listing_type`
        : sql``;
  const qRaw = filters?.q?.trim();
  const qFilter = qRaw
    ? sql`AND (
      p.address ILIKE ${"%" + qRaw + "%"}
      OR p.postcode ILIKE ${"%" + qRaw + "%"}
    )`
    : sql``;
  const rows = await sql`
    SELECT
      p.id,
      p.address,
      p.postcode,
      p.vendor_name,
      p.status,
      p.created_at,
      p.hero_image_url,
      COALESCE(
        (SELECT COUNT(*)::int FROM viewings v WHERE v.property_id = p.id),
        0
      ) AS viewing_count,
      COALESCE(
        (
          SELECT COUNT(*)::int
          FROM feedback f
          INNER JOIN viewings v ON v.id = f.viewing_id
          WHERE v.property_id = p.id
        ),
        0
      ) AS feedback_count
    FROM properties p
    WHERE p.company_id = ${companyId}
    ${listingFilter}
    ${qFilter}
    ORDER BY p.created_at DESC
  `;
  return rows as PropertyListRow[];
}

export type PropertyDetail = {
  id: string;
  company_id: string;
  address: string;
  postcode: string;
  vendor_name: string;
  status: string;
  created_at: Date | string;
  vendor_portal_token: string;
  buyer_qr_token: string;
  prequal_share_token: string;
  sale_prequal_share_token: string;
  hero_image_url: string | null;
  listing_type: "sale" | "letting";
};

export async function getPropertyForCompany(
  propertyId: string,
  companyId: string,
): Promise<PropertyDetail | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id,
      company_id,
      address,
      postcode,
      vendor_name,
      status,
      created_at,
      vendor_portal_token,
      buyer_qr_token,
      prequal_share_token,
      sale_prequal_share_token,
      hero_image_url,
      listing_type::text AS listing_type
    FROM properties
    WHERE id = ${propertyId} AND company_id = ${companyId}
    LIMIT 1
  `;
  const row = rows[0] as PropertyDetail | undefined;
  return row ?? null;
}
