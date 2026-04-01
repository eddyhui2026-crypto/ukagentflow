"use server";

import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export type AuthFormState = { error?: string } | undefined;

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrlRaw = String(formData.get("callbackUrl") ?? "/dashboard");
  const callbackUrl =
    callbackUrlRaw.startsWith("/") && !callbackUrlRaw.startsWith("//")
      ? callbackUrlRaw
      : "/dashboard";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const next = await signIn("credentials", {
    email,
    password,
    redirect: false,
    redirectTo: callbackUrl,
  });

  if (typeof next === "string") {
    if (next.includes("error=CredentialsSignin") || next.includes("error=AccessDenied")) {
      return { error: "Invalid email or password." };
    }
    redirect(next);
  }

  return { error: "Could not sign in." };
}
