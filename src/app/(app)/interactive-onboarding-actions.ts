"use server";

import { auth } from "@/auth";
import { ensureInteractiveOnboardingSample } from "@/lib/onboarding/create-interactive-sample";
import {
  setUserInteractiveOnboardingCompleted,
} from "@/lib/users/interactive-onboarding";
import { revalidatePath } from "next/cache";

export async function interactiveOnboardingCreateSampleAction(): Promise<
  | { ok: true; propertyId: string; feedbackId: string; feedbackUrl: string; vendorPortalUrl: string }
  | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.companyId || !session.user.id) {
    return { ok: false, error: "Not signed in." };
  }
  const email = session.user.email?.trim();
  if (!email) {
    return { ok: false, error: "Your account has no email — add one to run the demo." };
  }

  const r = await ensureInteractiveOnboardingSample({
    companyId: session.user.companyId,
    userId: session.user.id,
    agentEmail: email,
  });

  if (!r.ok) {
    return r;
  }

  revalidatePath("/dashboard");
  revalidatePath("/properties");
  revalidatePath(`/properties/${r.propertyId}`);

  return {
    ok: true,
    propertyId: r.propertyId,
    feedbackId: r.feedbackId,
    feedbackUrl: r.feedbackUrl,
    vendorPortalUrl: r.vendorPortalUrl,
  };
}

export async function interactiveOnboardingFinishAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }
  await setUserInteractiveOnboardingCompleted(session.user.id);
  revalidatePath("/dashboard");
  revalidatePath("/properties");
  revalidatePath("/settings");
  revalidatePath("/reports");
}
