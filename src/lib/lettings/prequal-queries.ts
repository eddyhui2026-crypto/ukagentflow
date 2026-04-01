import { getSql } from "@/lib/db/neon";

export type PrequalPropertyContext = {
  property_id: string;
  company_id: string;
  address: string;
  postcode: string;
  listing_type: string;
};

export async function getLettingPropertyForPrequalToken(
  token: string,
): Promise<PrequalPropertyContext | null> {
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
    WHERE prequal_share_token = ${t}
    LIMIT 1
  `;
  const row = rows[0] as PrequalPropertyContext | undefined;
  return row ?? null;
}

export type LettingPrequalRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  occupation: string | null;
  annual_income_band: string;
  has_pets: boolean | null;
  pets_detail: string | null;
  target_move_in_date: string | null;
  visa_immigration_status: string | null;
  submitted_at: Date | string;
};

export async function listLettingPrequalForProperty(
  propertyId: string,
  companyId: string,
): Promise<LettingPrequalRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      s.id,
      s.name,
      s.email,
      s.phone,
      s.occupation,
      s.annual_income_band,
      s.has_pets,
      s.pets_detail,
      s.target_move_in_date::text AS target_move_in_date,
      s.visa_immigration_status,
      s.submitted_at
    FROM letting_prequal_submissions s
    INNER JOIN properties p ON p.id = s.property_id
    WHERE s.property_id = ${propertyId}
      AND p.company_id = ${companyId}
    ORDER BY s.submitted_at DESC
  `;
  return rows as LettingPrequalRow[];
}
