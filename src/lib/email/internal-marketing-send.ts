import { Resend } from "resend";
import { applySimpleTemplate, type SimpleTemplateVars } from "@/lib/email/simple-template";

export const INTERNAL_MARKETING_MAX_RECIPIENTS = 10;
export const INTERNAL_MARKETING_SEND_DELAY_MS = 150;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Double-newline → paragraphs; single newlines → br. */
export function plainMarketingBodyToHtml(plain: string): string {
  return plain
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export function getInternalMarketingFrom(): { from: string; usingTransactionalFallback: boolean } {
  const marketing = process.env.RESEND_FROM_MARKETING?.trim();
  const transactional = process.env.RESEND_FROM?.trim();
  if (marketing) {
    return { from: marketing, usingTransactionalFallback: false };
  }
  if (transactional) {
    return { from: transactional, usingTransactionalFallback: true };
  }
  return { from: "", usingTransactionalFallback: true };
}

export type InternalMarketingSendOneResult =
  | { ok: true; to: string }
  | { ok: false; to: string; error: string };

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function sendInternalMarketingEmail(options: {
  to: string;
  subject: string;
  textBody: string;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const { from } = getInternalMarketingFrom();

  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY not set" };
  }
  if (!from) {
    return { sent: false, reason: "RESEND_FROM / RESEND_FROM_MARKETING not set" };
  }

  const to = options.to.trim().toLowerCase();
  if (!to || !to.includes("@")) {
    return { sent: false, reason: "Invalid email address" };
  }

  const html = plainMarketingBodyToHtml(options.textBody);
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: options.subject.trim(),
    text: options.textBody,
    html,
  });

  if (error) {
    return { sent: false, reason: error.message ?? "Resend API error" };
  }

  return { sent: true };
}

export type MarketingRecipientInput = {
  email: string;
  /** Display name; empty → "there" for {{name}} in copy */
  name: string;
};

export async function sendInternalMarketingBatch(options: {
  subjectTemplate: string;
  bodyTemplate: string;
  recipients: MarketingRecipientInput[];
}): Promise<InternalMarketingSendOneResult[]> {
  const results: InternalMarketingSendOneResult[] = [];
  const list = options.recipients.slice(0, INTERNAL_MARKETING_MAX_RECIPIENTS);

  for (let i = 0; i < list.length; i++) {
    if (i > 0) {
      await delay(INTERNAL_MARKETING_SEND_DELAY_MS);
    }
    const r = list[i];
    const email = r.email.trim().toLowerCase();
    const nameTrim = r.name.trim();
    const vars: SimpleTemplateVars = {
      name: nameTrim || "there",
      email,
    };
    const subject = applySimpleTemplate(options.subjectTemplate, vars);
    const textBody = applySimpleTemplate(options.bodyTemplate, vars);
    const send = await sendInternalMarketingEmail({
      to: email,
      subject,
      textBody,
    });
    if (send.sent) {
      results.push({ ok: true, to: email });
    } else {
      results.push({ ok: false, to: email, error: send.reason });
    }
  }

  return results;
}
