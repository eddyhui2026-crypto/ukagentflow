"use server";

import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { BILLING_TRIAL_DAYS } from "@/lib/billing/trial";
import { getSql } from "@/lib/db/neon";
import type { AuthFormState } from "../login/actions";

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!companyName || !name || !email || !password) {
    return { error: "All fields are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const sql = getSql();

  const existing = await sql`
    SELECT id FROM users WHERE lower(trim(email)) = ${email} LIMIT 1
  `;
  if (existing.length > 0) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hash(password, 12);
  const userId = randomUUID();

  const trialStart = new Date();
  const trialEnd = new Date(trialStart);
  trialEnd.setUTCDate(trialEnd.getUTCDate() + BILLING_TRIAL_DAYS);

  const companyRows = await sql`
    INSERT INTO companies (name, plan, trial_started_at, trial_ends_at)
    VALUES (${companyName}, 'free', ${trialStart}, ${trialEnd})
    RETURNING id
  `;
  const companyId = (companyRows[0] as { id: string } | undefined)?.id;
  if (!companyId) {
    return { error: "Could not create company." };
  }

  await sql`
    INSERT INTO users (id, company_id, name, email, role, password_hash)
    VALUES (${userId}, ${companyId}, ${name}, ${email}, 'agent', ${passwordHash})
  `;

  const next = await signIn("credentials", {
    email,
    password,
    redirect: false,
    redirectTo: "/dashboard",
  });

  if (typeof next === "string") {
    if (next.includes("error=CredentialsSignin") || next.includes("error=AccessDenied")) {
      return {
        error: "Account created but sign-in failed. Try logging in manually.",
      };
    }
    redirect(next);
  }

  return { error: "Could not sign you in after registration." };
}
