"use server";

import { getSql } from "@/lib/db/neon";
import {
  generatePasswordResetRawToken,
  hashPasswordResetToken,
} from "@/lib/auth/password-reset-token";
import { sendPasswordResetEmail } from "@/lib/email/password-reset";

export type ForgotPasswordState =
  | { success: true }
  | { error: string }
  | undefined;

const RESET_VALID_MS = 60 * 60 * 1000;

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!email) {
    return { error: "Enter your email address." };
  }

  const sql = getSql();
  const rows = await sql`
    SELECT id, email, password_hash
    FROM users
    WHERE lower(trim(email)) = ${email}
    LIMIT 1
  `;
  const row = rows[0] as
    | { id: string; email: string; password_hash: string | null }
    | undefined;

  if (!row?.password_hash) {
    return { success: true };
  }

  const rawToken = generatePasswordResetRawToken();
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_VALID_MS);

  await sql`
    DELETE FROM password_reset_tokens
    WHERE user_id = ${row.id} AND used_at IS NULL
  `;

  await sql`
    INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
    VALUES (${row.id}, ${tokenHash}, ${expiresAt.toISOString()})
  `;

  const sent = await sendPasswordResetEmail({
    to: row.email,
    resetToken: rawToken,
  });
  if (!sent.sent) {
    console.error("[forgot-password] email failed:", sent.reason);
    return {
      error:
        "We could not send email right now. Check RESEND_API_KEY / RESEND_FROM, or try again later.",
    };
  }

  return { success: true };
}
