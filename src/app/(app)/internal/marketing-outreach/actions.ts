"use server";

import { auth } from "@/auth";
import {
  getInternalMarketingFrom,
  INTERNAL_MARKETING_MAX_RECIPIENTS,
  sendInternalMarketingBatch,
  type InternalMarketingSendOneResult,
  type MarketingRecipientInput,
} from "@/lib/email/internal-marketing-send";
import { isInternalMarketingOutreachAllowed } from "@/lib/internal/marketing-outreach-allowlist";

export type MarketingOutreachState =
  | { ok: true; results: InternalMarketingSendOneResult[]; usingTransactionalFallback: boolean }
  | { ok: false; error: string };

export async function sendInternalMarketingOutreachAction(
  _prev: MarketingOutreachState | undefined,
  formData: FormData,
): Promise<MarketingOutreachState> {
  const session = await auth();
  if (!isInternalMarketingOutreachAllowed(session?.user?.email)) {
    return { ok: false, error: "Not allowed." };
  }

  const subjectTpl = String(formData.get("subject") ?? "").trim();
  const bodyTpl = String(formData.get("body") ?? "").trim();
  if (!subjectTpl || !bodyTpl) {
    return { ok: false, error: "Subject and body are required." };
  }

  const recipients: MarketingRecipientInput[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < INTERNAL_MARKETING_MAX_RECIPIENTS; i++) {
    const e = String(formData.get(`email_${i}`) ?? "").trim().toLowerCase();
    const n = String(formData.get(`name_${i}`) ?? "").trim();
    if (!e) {
      continue;
    }
    if (!e.includes("@")) {
      return { ok: false, error: `Invalid email on row ${i + 1}.` };
    }
    if (seen.has(e)) {
      return { ok: false, error: `Duplicate email: ${e}` };
    }
    seen.add(e);
    recipients.push({ email: e, name: n });
  }

  if (recipients.length === 0) {
    return { ok: false, error: "Add at least one recipient with an email." };
  }

  const results = await sendInternalMarketingBatch({
    subjectTemplate: subjectTpl,
    bodyTemplate: bodyTpl,
    recipients,
  });

  const { usingTransactionalFallback } = getInternalMarketingFrom();
  return { ok: true, results, usingTransactionalFallback };
}
