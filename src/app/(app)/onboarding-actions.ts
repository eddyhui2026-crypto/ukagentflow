"use server";

import { auth } from "@/auth";
import { setUserOnboardingIntroDismissed } from "@/lib/users/onboarding";
import { revalidatePath } from "next/cache";

export async function dismissAppOnboardingIntroAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await setUserOnboardingIntroDismissed(session.user.id);
  revalidatePath("/dashboard");
  revalidatePath("/properties");
  revalidatePath("/settings");
  revalidatePath("/reports");
}
