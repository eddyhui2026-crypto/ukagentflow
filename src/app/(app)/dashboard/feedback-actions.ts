"use server";

import { auth } from "@/auth";
import { getSql } from "@/lib/db/neon";
import { parseAgentFollowUp } from "@/lib/feedback/agent-follow-up";
import { revalidatePath } from "next/cache";

export async function updateFeedbackAgentFollowUp(
  feedbackId: string,
  statusRaw: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { ok: false, error: "Unauthorized." };
  }
  const status = parseAgentFollowUp(statusRaw);
  if (!status) {
    return { ok: false, error: "Invalid status." };
  }

  const sql = getSql();
  const rows = await sql`
    UPDATE feedback AS f
    SET agent_follow_up = ${status}::agent_follow_up
    FROM viewings v
    INNER JOIN properties p ON p.id = v.property_id
    WHERE f.id = ${feedbackId}
      AND f.viewing_id = v.id
      AND p.company_id = ${session.user.companyId}
    RETURNING p.id AS property_id
  `;
  const propertyId = (rows[0] as { property_id: string } | undefined)?.property_id;
  if (!propertyId) {
    return { ok: false, error: "Feedback not found." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/properties/${propertyId}`);
  return { ok: true };
}

export async function deleteFeedbackAction(
  feedbackId: string,
): Promise<{ ok: true; propertyId: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { ok: false, error: "Not signed in." };
  }
  const id = feedbackId.trim();
  if (!id) {
    return { ok: false, error: "Missing feedback." };
  }

  const sql = getSql();
  const rows = await sql`
    DELETE FROM feedback AS f
    USING viewings v
    INNER JOIN properties p ON p.id = v.property_id
    WHERE f.id = ${id}
      AND f.viewing_id = v.id
      AND p.company_id = ${session.user.companyId}
    RETURNING p.id AS property_id
  `;
  const propertyId = (rows[0] as { property_id: string } | undefined)?.property_id;
  if (!propertyId) {
    return { ok: false, error: "Feedback not found." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/reports");

  return { ok: true, propertyId };
}
