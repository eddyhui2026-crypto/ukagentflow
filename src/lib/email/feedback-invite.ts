import { Resend } from "resend";
import { getAppBaseUrl } from "@/lib/env/app-url";
import { applyPublicFooterTemplate, PUBLIC_FORM_GDPR_NOTICE_EN } from "@/lib/branding/public-footer-template";
import { applyInvitePlainTemplate } from "@/lib/email/invite-plain";
import {
  buildMinimalFeedbackInviteShellHtml,
  type MinimalInviteLayoutInput,
} from "@/lib/email/invite-email-minimal-a";

/** Default subject; use {{buyerName}}, {{propertyLine}}, {{feedbackLink}}. */
export const DEFAULT_FEEDBACK_INVITE_SUBJECT_TEMPLATE =
  "Thanks for viewing {{propertyLine}}";

/** Default plain-text body (plain-text & optional extra HTML paragraphs; main CTA is the system button). */
export const DEFAULT_FEEDBACK_INVITE_BODY_TEMPLATE = `Hi {{buyerName}},

Thank you for viewing the property.

Please leave your feedback here (it takes about 30 seconds):
{{feedbackLink}}

Thank you.`;

export type FeedbackInviteLayoutContext = {
  propertyAddress: string;
  propertyPostcode: string;
  propertyImageUrl: string | null;
  companyName: string;
  companyLogoUrl: string | null;
  agentName: string;
  showPropertyPhoto: boolean;
  /** companies.invite_use_system_footer — entire footer (signature + photo + GDPR), or none */
  includeInviteFooter: boolean;
  publicFooterTemplate: string | null;
  showAgentPhotoInFooter: boolean;
  agentProfilePhotoUrl: string | null;
};

export type SendFeedbackInviteParams = {
  to: string;
  buyerName: string;
  /** Short property line for subject / plain template, e.g. "12 High St, AB1 2CD" */
  propertyLine: string;
  feedbackToken: string;
  subjectTemplate?: string | null;
  bodyTemplate?: string | null;
  inviteLayout: FeedbackInviteLayoutContext;
};

export type SendResult = { sent: true } | { sent: false; reason: string };

export type FeedbackInviteTemplateVars = {
  buyerName: string;
  propertyLine: string;
  feedbackLink: string;
};

export function renderFeedbackInviteEmailContent(options: {
  subjectTemplate?: string | null;
  bodyTemplate?: string | null;
  vars: FeedbackInviteTemplateVars;
  inviteLayout: FeedbackInviteLayoutContext;
}): { subject: string; text: string; html: string } {
  const subjectTpl =
    options.subjectTemplate?.trim() || DEFAULT_FEEDBACK_INVITE_SUBJECT_TEMPLATE;
  const bodyTpl =
    options.bodyTemplate?.trim() || DEFAULT_FEEDBACK_INVITE_BODY_TEMPLATE;

  const subject = applyInvitePlainTemplate(subjectTpl, options.vars);
  const link = options.vars.feedbackLink;

  const htmlFragment = plainInviteBodyTemplateToHtml(bodyTpl, options.vars);
  let extraHtml = stripFeedbackLinkParagraphs(htmlFragment, link);
  extraHtml = stripLeadingHiParagraph(extraHtml, options.vars.buyerName);
  extraHtml = extraHtml.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "").trim();

  const plainFull = applyInvitePlainTemplate(bodyTpl, options.vars);
  let extraPlain = stripFeedbackLinkFromPlain(plainFull, link);
  extraPlain = stripLeadingHiPlain(extraPlain, options.vars.buyerName);

  const L = options.inviteLayout;
  const shellInput: MinimalInviteLayoutInput = {
    buyerName: options.vars.buyerName,
    propertyAddress: L.propertyAddress,
    propertyPostcode: L.propertyPostcode,
    propertyImageUrl: L.propertyImageUrl,
    companyName: L.companyName,
    companyLogoUrl: L.companyLogoUrl,
    agentName: L.agentName,
    showPropertyPhoto: L.showPropertyPhoto,
    includeInviteFooter: L.includeInviteFooter,
    feedbackLink: link,
    publicFooterTemplate: L.publicFooterTemplate,
    showAgentPhotoInFooter: L.showAgentPhotoInFooter,
    agentProfilePhotoUrl: L.agentProfilePhotoUrl,
  };

  const html = buildMinimalFeedbackInviteShellHtml(shellInput, extraHtml);
  const text = buildMinimalPlainText(L, options.vars.buyerName, link, extraPlain);

  return { subject, text, html };
}

function buildMinimalPlainText(
  layout: FeedbackInviteLayoutContext,
  buyerName: string,
  link: string,
  extraPlain: string,
): string {
  const lines: string[] = [layout.companyName, "", `Hi ${buyerName},`, "", layout.propertyAddress];
  if (layout.propertyPostcode) lines.push(layout.propertyPostcode);
  lines.push("", `Leave feedback: ${link}`, "");
  if (extraPlain) lines.push(extraPlain, "");
  const propertyLine = [layout.propertyAddress, layout.propertyPostcode].filter(Boolean).join(", ");
  if (layout.includeInviteFooter) {
    lines.push(
      applyPublicFooterTemplate(layout.publicFooterTemplate, {
        agentName: layout.agentName,
        companyName: layout.companyName,
        propertyLine,
      }),
    );
    lines.push("", PUBLIC_FORM_GDPR_NOTICE_EN);
  }
  return lines.join("\n");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripFeedbackLinkParagraphs(html: string, linkUrl: string): string {
  const esc = escapeRegExp(linkUrl);
  let out = html.replace(
    new RegExp(`<p>\\s*<a\\s[^>]*href="${esc}"[^>]*>[\\s\\S]*?<\\/a>\\s*<\\/p>`, "gi"),
    "",
  );
  out = out.replace(new RegExp(`<p>\\s*${esc}\\s*<\\/p>`, "gi"), "");
  return out.trim();
}

function stripLeadingHiParagraph(html: string, buyerName: string): string {
  const esc = escapeRegExp(buyerName);
  return html
    .replace(new RegExp(`^\\s*<p>Hi\\s+${esc},?\\s*<\\/p>\\s*`, "i"), "")
    .trim();
}

function stripFeedbackLinkFromPlain(plain: string, link: string): string {
  return plain
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0 && !b.includes(link))
    .join("\n\n")
    .trim();
}

function stripLeadingHiPlain(plain: string, buyerName: string): string {
  return plain
    .replace(new RegExp(`^Hi\\s+${escapeRegExp(buyerName)},?\\s*\\n+`, "i"), "")
    .trim();
}

export async function sendFeedbackInviteEmail(
  params: SendFeedbackInviteParams,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();

  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY not set" };
  }
  if (!from) {
    return { sent: false, reason: "RESEND_FROM not set" };
  }

  const base = getAppBaseUrl().replace(/\/$/, "");
  const feedbackLink = `${base}/feedback/${params.feedbackToken}`;
  const vars: FeedbackInviteTemplateVars = {
    buyerName: params.buyerName,
    propertyLine: params.propertyLine,
    feedbackLink,
  };

  const { subject, text, html } = renderFeedbackInviteEmailContent({
    subjectTemplate: params.subjectTemplate,
    bodyTemplate: params.bodyTemplate,
    vars,
    inviteLayout: params.inviteLayout,
  });

  const to = params.to.trim();
  if (!to || !to.includes("@")) {
    return { sent: false, reason: "Invalid buyer email address (empty or malformed)" };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    html,
  });

  if (error) {
    return { sent: false, reason: error.message ?? "Resend API error" };
  }

  return { sent: true };
}

/** Plain-text invite body with `\\n\\n` paragraph breaks → safe HTML paragraphs. */
function plainInviteBodyTemplateToHtml(
  template: string,
  vars: FeedbackInviteTemplateVars,
): string {
  const filled = template
    .replace(/\{\{buyerName\}\}/g, escapeHtml(vars.buyerName))
    .replace(/\{\{propertyLine\}\}/g, escapeHtml(vars.propertyLine))
    .replace(
      /\{\{feedbackLink\}\}/g,
      `<a href="${escapeAttr(vars.feedbackLink)}">${escapeHtml(vars.feedbackLink)}</a>`,
    )
    .trim();
  return filled
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
