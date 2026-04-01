import { Resend } from "resend";
import { getAppBaseUrl } from "@/lib/env/app-url";

export type SendPasswordResetEmailParams = {
  to: string;
  /** Opaque token; only used in the link, never logged. */
  resetToken: string;
};

export type PasswordResetSendResult =
  | { sent: true }
  | { sent: false; reason: string };

export async function sendPasswordResetEmail(
  params: SendPasswordResetEmailParams,
): Promise<PasswordResetSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();

  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY not set" };
  }
  if (!from) {
    return { sent: false, reason: "RESEND_FROM not set" };
  }

  const base = getAppBaseUrl().replace(/\/$/, "");
  const resetLink = `${base}/reset-password?token=${encodeURIComponent(params.resetToken)}`;
  const subject = "Reset your UKAgentFlow password";
  const text = `You asked to reset your UKAgentFlow password.

Open this link (valid for one hour):
${resetLink}

If you did not request this, you can ignore this email. Your password will stay the same.`;

  const html = `<p>You asked to reset your UKAgentFlow password.</p>
<p><a href="${escapeHtmlAttribute(resetLink)}">Reset your password</a></p>
<p style="color:#666;font-size:14px">This link expires in one hour. If you did not request this, you can ignore this email.</p>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject,
    text,
    html,
  });

  if (error) {
    return { sent: false, reason: error.message ?? "Resend error" };
  }
  return { sent: true };
}

function escapeHtmlAttribute(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
