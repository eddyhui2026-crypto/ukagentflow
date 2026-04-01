"use server";

import { auth } from "@/auth";
import { getSql } from "@/lib/db/neon";
import { getPropertyForCompany } from "@/lib/properties/queries";
import { feedbackInviteScheduledAtForViewingDate } from "@/lib/viewings/feedback-invite-schedule";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ViewingFormState = { error?: string } | undefined;

export type BuyerInput = {
  name: string;
  email: string;
  phone: string | null;
};

function parseBuyersFromFormData(formData: FormData): BuyerInput[] {
  const names = formData.getAll("buyer_name");
  const emails = formData.getAll("buyer_email");
  const phones = formData.getAll("buyer_phone");
  const len = Math.max(names.length, emails.length, phones.length);
  const out: BuyerInput[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < len; i++) {
    const name = String(names[i] ?? "").trim();
    const email = String(emails[i] ?? "").toLowerCase().trim();
    const phoneRaw = String(phones[i] ?? "").trim();
    if (!name && !email && !phoneRaw) {
      continue;
    }
    if (!name || !email) {
      continue;
    }
    if (seen.has(email)) {
      continue;
    }
    seen.add(email);
    out.push({
      name,
      email,
      phone: phoneRaw ? phoneRaw : null,
    });
  }
  return out;
}

export async function createViewingAction(
  _prev: ViewingFormState,
  formData: FormData,
): Promise<ViewingFormState> {
  const session = await auth();
  if (!session?.user?.companyId || !session.user.id) {
    return { error: "Not signed in." };
  }

  const propertyId = String(formData.get("property_id") ?? "").trim();
  const viewingDate = String(formData.get("viewing_date") ?? "").trim();
  const inviteEmailsViaApp =
    String(formData.get("invite_emails_via_app") ?? "1").trim() !== "0";

  if (!propertyId || !viewingDate) {
    return { error: "Property and viewing date are required." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(viewingDate)) {
    return { error: "Invalid date." };
  }

  const property = await getPropertyForCompany(
    propertyId,
    session.user.companyId,
  );
  if (!property) {
    return { error: "Property not found." };
  }

  const buyers = parseBuyersFromFormData(formData);
  if (buyers.length === 0) {
    return { error: "Add at least one buyer with name and email." };
  }
  if (buyers.length > 25) {
    return { error: "Too many buyers (max 25)." };
  }

  const sql = getSql();
  let viewingId: string | null = null;

  let scheduledAt: Date | null = null;
  if (inviteEmailsViaApp) {
    scheduledAt = await feedbackInviteScheduledAtForViewingDate(viewingDate);
    if (!scheduledAt) {
      return { error: "Could not schedule invite emails. Try again." };
    }
  }

  try {
    const viewingRows = await sql`
      INSERT INTO viewings (property_id, viewing_date, agent_id, invite_emails_via_app)
      VALUES (${propertyId}, ${viewingDate}, ${session.user.id}, ${inviteEmailsViaApp})
      RETURNING id
    `;
    const v = viewingRows[0] as { id: string } | undefined;
    viewingId = v?.id ?? null;
    if (!viewingId) {
      return { error: "Could not create viewing." };
    }

    for (const b of buyers) {
      const buyerRows = await sql`
        INSERT INTO buyers (id, company_id, name, email, phone)
        VALUES (gen_random_uuid(), ${session.user.companyId}, ${b.name}, ${b.email}, ${b.phone})
        ON CONFLICT (company_id, email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = COALESCE(EXCLUDED.phone, buyers.phone)
        RETURNING id
      `;
      const buyerRow = buyerRows[0] as { id: string } | undefined;
      const buyerId = buyerRow?.id;
      if (!buyerId) {
        throw new Error("buyer_upsert_failed");
      }

      const token = randomBytes(32).toString("base64url");
      await sql`
        INSERT INTO viewing_buyers (viewing_id, buyer_id, feedback_token, feedback_invite_scheduled_at)
        VALUES (${viewingId}, ${buyerId}, ${token}, ${inviteEmailsViaApp ? scheduledAt : null})
      `;
    }
  } catch {
    if (viewingId) {
      await sql`DELETE FROM viewings WHERE id = ${viewingId}`;
    }
    return {
      error: "Could not save viewing. Check buyer emails are unique for this viewing.",
    };
  }

  revalidatePath(`/properties/${propertyId}`);
  redirect(`/properties/${propertyId}`);
}
