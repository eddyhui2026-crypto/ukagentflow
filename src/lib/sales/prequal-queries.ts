import { getSql } from "@/lib/db/neon";

export type SalePrequalPropertyContext = {
  property_id: string;
  company_id: string;
  address: string;
  postcode: string;
  listing_type: string;
};

export async function getSalePropertyForPrequalToken(
  token: string,
): Promise<SalePrequalPropertyContext | null> {
  const t = token?.trim();
  if (!t) return null;
  const sql = getSql();
  const rows = await sql`
    SELECT
      id AS property_id,
      company_id,
      address,
      postcode,
      listing_type::text AS listing_type
    FROM properties
    WHERE sale_prequal_share_token = ${t}
    LIMIT 1
  `;
  const row = rows[0] as SalePrequalPropertyContext | undefined;
  return row ?? null;
}

export type SalePrequalRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  buying_position: string;
  funding_type: string;
  mortgage_dip_status: string;
  solicitor_status: string;
  target_purchase_band: string;
  additional_notes: string | null;
  submitted_at: Date | string;
};

export async function listSalePrequalForProperty(
  propertyId: string,
  companyId: string,
): Promise<SalePrequalRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      s.id,
      s.name,
      s.email,
      s.phone,
      s.buying_position,
      s.funding_type,
      s.mortgage_dip_status,
      s.solicitor_status,
      s.target_purchase_band,
      s.additional_notes,
      s.submitted_at
    FROM sale_prequal_submissions s
    INNER JOIN properties p ON p.id = s.property_id
    WHERE s.property_id = ${propertyId}
      AND p.company_id = ${companyId}
    ORDER BY s.submitted_at DESC
  `;
  return rows as SalePrequalRow[];
}
