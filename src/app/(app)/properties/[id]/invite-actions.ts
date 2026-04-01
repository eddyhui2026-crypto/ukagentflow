"use server";

import { auth } from "@/auth";
import { resendAppFeedbackInviteForViewingBuyer } from "@/lib/viewings/resend-feedback-invite";
import { revalidatePath } from "next/cache";

export type ResendInviteState = { error?: string; success?: string } | undefined;

export async function resendFeedbackInviteAction(
  _prev: ResendInviteState,
  formData: FormData,
): Promise<ResendInviteState> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { error: "You must be signed in." };
  }
  const viewingBuyerId = String(formData.get("viewing_buyer_id") ?? "").trim();
  const propertyId = String(formData.get("property_id") ?? "").trim();
  if (!viewingBuyerId || !propertyId) {
    return { error: "Missing data." };
  }

  const result = await resendAppFeedbackInviteForViewingBuyer({
    viewingBuyerId,
    propertyId,
    companyId: session.user.companyId,
  });

  if (!result.ok) {
    return { error: result.message };
  }

  revalidatePath(`/properties/${propertyId}`);
  return { success: "Invite emailed." };
}
