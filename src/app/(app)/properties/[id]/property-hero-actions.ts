"use server";

import { auth } from "@/auth";
import { parseHttpsImageUrl } from "@/lib/branding/safe-image-url";
import { getSql } from "@/lib/db/neon";
import { revalidatePath } from "next/cache";

export type PropertyHeroState =
  | { error: string }
  | { success: true; message?: string }
  | undefined;

export async function updatePropertyHeroImageAction(
  _prev: PropertyHeroState,
  formData: FormData,
): Promise<PropertyHeroState> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { error: "Not signed in." };
  }

  const propertyId = String(formData.get("propertyId") ?? "").trim();
  if (!propertyId) {
    return { error: "Missing property." };
  }

  const raw = String(formData.get("hero_image_url") ?? "").trim();
  const url = parseHttpsImageUrl(raw || null);
  if (raw && !url) {
    return {
      error: "Use a full https image link, or leave blank to clear.",
    };
  }

  const sql = getSql();
  const updated = await sql`
    UPDATE properties
    SET hero_image_url = ${url}
    WHERE id = ${propertyId} AND company_id = ${session.user.companyId}
    RETURNING id
  `;
  if ((updated as { id: string }[]).length === 0) {
    return { error: "Could not update this property." };
  }

  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/properties");
  return { success: true, message: url ? "Saved listing image." : "Cleared listing image." };
}
