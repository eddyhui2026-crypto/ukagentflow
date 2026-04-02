"use server";

import { auth } from "@/auth";
import { parseHttpsImageUrl } from "@/lib/branding/safe-image-url";
import { getSql } from "@/lib/db/neon";
import { getPropertyForCompany } from "@/lib/properties/queries";
import { newPropertyShareToken } from "@/lib/properties/share-tokens";
import { isValidPropertyStatus } from "@/lib/properties/status";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const LISTING_TYPES = new Set(["sale", "letting"]);

export type PropertyFormState = { error?: string } | undefined;
export type PropertyStatusFormState = { error?: string } | undefined;

export async function createPropertyAction(
  _prev: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { error: "Not signed in." };
  }

  const address = String(formData.get("address") ?? "").trim();
  const postcode = String(formData.get("postcode") ?? "").trim();
  const vendorName = String(formData.get("vendor_name") ?? "").trim();
  const status = String(formData.get("status") ?? "active").toLowerCase();
  const listingTypeRaw = String(formData.get("listing_type") ?? "sale").toLowerCase();
  const listingType = listingTypeRaw === "letting" ? "letting" : "sale";

  if (!address || !postcode || !vendorName) {
    return { error: "Address, postcode, and vendor name are required." };
  }
  if (!isValidPropertyStatus(listingType, status)) {
    return { error: "Invalid status for this listing type." };
  }
  if (!LISTING_TYPES.has(listingType)) {
    return { error: "Invalid listing type." };
  }

  const heroRaw = String(formData.get("hero_image_url") ?? "").trim();
  const heroImageUrl = parseHttpsImageUrl(heroRaw || null);
  if (heroRaw && !heroImageUrl) {
    return {
      error: "Listing photo must be a valid https image URL, or clear it and save without a photo.",
    };
  }

  const vendorPortalToken = newPropertyShareToken();
  const buyerQrToken = newPropertyShareToken();
  const prequalShareToken = newPropertyShareToken();
  const salePrequalShareToken = newPropertyShareToken();

  const sql = getSql();
  await sql`
    INSERT INTO properties (
      company_id,
      address,
      postcode,
      vendor_name,
      status,
      vendor_portal_token,
      buyer_qr_token,
      prequal_share_token,
      sale_prequal_share_token,
      hero_image_url,
      listing_type
    )
    VALUES (
      ${session.user.companyId},
      ${address},
      ${postcode},
      ${vendorName},
      ${status},
      ${vendorPortalToken},
      ${buyerQrToken},
      ${prequalShareToken},
      ${salePrequalShareToken},
      ${heroImageUrl},
      ${listingType}::listing_type
    )
  `;

  revalidatePath("/properties");
  revalidatePath("/dashboard");
  redirect(`/properties?listing=${listingType}`);
}

export async function updatePropertyStatusAction(
  _prev: PropertyStatusFormState,
  formData: FormData,
): Promise<PropertyStatusFormState> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { error: "Not signed in." };
  }

  const propertyId = String(formData.get("property_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim().toLowerCase();

  if (!propertyId) {
    return { error: "Missing property." };
  }

  const property = await getPropertyForCompany(propertyId, session.user.companyId);
  if (!property) {
    return { error: "Property not found." };
  }

  if (!isValidPropertyStatus(property.listing_type, status)) {
    return { error: "Invalid status for this listing type." };
  }

  const sql = getSql();
  await sql`
    UPDATE properties
    SET status = ${status}
    WHERE id = ${propertyId} AND company_id = ${session.user.companyId}
  `;

  revalidatePath("/properties");
  revalidatePath("/dashboard");
  revalidatePath(`/properties/${propertyId}`);

  return undefined;
}

export async function deletePropertyAction(
  propertyId: string,
): Promise<
  | { ok: true; listingType: "sale" | "letting" }
  | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { ok: false, error: "Not signed in." };
  }
  const id = propertyId.trim();
  if (!id) {
    return { ok: false, error: "Missing property." };
  }

  const property = await getPropertyForCompany(id, session.user.companyId);
  if (!property) {
    return { ok: false, error: "Property not found." };
  }

  const sql = getSql();
  const rows = await sql`
    DELETE FROM properties
    WHERE id = ${id} AND company_id = ${session.user.companyId}
    RETURNING id
  `;
  if (rows.length === 0) {
    return { ok: false, error: "Could not delete this property." };
  }

  const listingType = property.listing_type === "letting" ? "letting" : "sale";
  revalidatePath("/properties");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath(`/properties/${id}`);

  return { ok: true, listingType };
}
