"use server";

import { findQuickFeedbackTokenForEmail } from "@/lib/properties/quick-feedback-lookup";
import { redirect } from "next/navigation";

export type QuickClaimState = { error?: string } | undefined;

function errorMessage(
  reason: "not_found" | "no_match" | "already_submitted" | "revoked" | "expired",
): string {
  switch (reason) {
    case "no_match":
      return "We couldn't find that email for a viewing at this property. Check spelling or contact your agent.";
    case "already_submitted":
      return "We already have your feedback — thank you. If something's wrong, contact your agent.";
    case "revoked":
      return "This feedback link is no longer active. Contact your agent for a new link.";
    case "expired":
      return "The feedback period for your viewing has ended. Please contact your agent.";
    default:
      return "Something went wrong. Try again or contact your agent.";
  }
}

export async function claimQuickFeedbackAction(
  _prev: QuickClaimState,
  formData: FormData,
): Promise<QuickClaimState> {
  const qrToken = String(formData.get("qr_token") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!qrToken || !email) {
    return { error: "Enter the email address your agent has for you." };
  }

  const r = await findQuickFeedbackTokenForEmail(qrToken, email);
  if (!r.ok) {
    return { error: errorMessage(r.reason) };
  }

  redirect(`/feedback/${encodeURIComponent(r.feedback_token)}`);
}
