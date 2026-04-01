import { applyInvitePlainTemplate, type InvitePlainTemplateVars } from "@/lib/email/invite-plain";

/** Default subject line in copied draft (agents paste into their email client). */
export const DEFAULT_AGENT_COPY_INVITE_SUBJECT_TEMPLATE =
  "Feedback after your viewing — {{propertyLine}}";

/** Default body; must keep {{feedbackLink}}. */
export const DEFAULT_AGENT_COPY_INVITE_BODY_TEMPLATE = `Hi {{buyerName}},

Thanks for viewing. When you have a moment, please leave a short note using the link below (about 30 seconds):
{{feedbackLink}}

Best regards`;

export type BuildAgentCopyDraftParams = {
  buyerEmail: string;
  buyerName: string;
  propertyLine: string;
  feedbackToken: string;
  baseUrl: string;
  subjectTemplate?: string | null;
  bodyTemplate?: string | null;
};

/**
 * One plain-text block for clipboard: To + Subject + body.
 * Paste into Gmail/Outlook, then set the To field from the first line if needed.
 */
export function buildAgentCopyEmailDraft(params: BuildAgentCopyDraftParams): string {
  const to = params.buyerEmail.trim();
  const base = params.baseUrl.replace(/\/$/, "");
  const feedbackLink = `${base}/feedback/${params.feedbackToken}`;
  const vars: InvitePlainTemplateVars = {
    buyerName: params.buyerName,
    propertyLine: params.propertyLine,
    feedbackLink,
    buyerEmail: to,
  };

  const subjectTpl =
    params.subjectTemplate?.trim() || DEFAULT_AGENT_COPY_INVITE_SUBJECT_TEMPLATE;
  const bodyTpl =
    params.bodyTemplate?.trim() || DEFAULT_AGENT_COPY_INVITE_BODY_TEMPLATE;

  const subject = applyInvitePlainTemplate(subjectTpl, vars);
  const body = applyInvitePlainTemplate(bodyTpl, vars);

  return `To: ${to}\n\nSubject: ${subject}\n\n${body}`;
}
