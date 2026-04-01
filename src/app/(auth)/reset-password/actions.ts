"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { getSql } from "@/lib/db/neon";
import {
  hashPasswordResetToken,
  isPasswordResetTokenFormat,
} from "@/lib/auth/password-reset-token";

export type ResetPasswordState = { error: string } | undefined;

export async function resetPasswordWithTokenAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!isPasswordResetTokenFormat(token)) {
    return { error: "This reset link is invalid or incomplete." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const tokenHash = hashPasswordResetToken(token);
  const sql = getSql();

  const rows = await sql`
    SELECT id, user_id
    FROM password_reset_tokens
    WHERE token_hash = ${tokenHash}
      AND used_at IS NULL
      AND expires_at > now()
    LIMIT 1
  `;
  const row = rows[0] as { id: string; user_id: string } | undefined;
  if (!row) {
    return { error: "This link has expired or was already used. Request a new one from the sign-in page." };
  }

  const passwordHash = await hash(password, 12);
  await sql`
    UPDATE users
    SET password_hash = ${passwordHash}
    WHERE id = ${row.user_id}
  `;

  await sql`
    UPDATE password_reset_tokens
    SET used_at = now()
    WHERE id = ${row.id}
  `;

  await sql`
    DELETE FROM password_reset_tokens
    WHERE user_id = ${row.user_id} AND used_at IS NULL
  `;

  redirect("/login?reset=1");
}
