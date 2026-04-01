/** GDPR line: shared with invite email shell and public footer preview. */
export const PUBLIC_FORM_GDPR_NOTICE_EN =
  "Your data is processed under UK GDPR. You can request access or deletion by replying to this email or contacting the agent above.";

/** Default when DB template is null or blank (placeholders filled at render time). */
export const DEFAULT_PUBLIC_FOOTER_TEMPLATE = `{{agentName}} | {{companyName}}

If you need help with this form, contact your estate agent.`;

export type PublicFooterTemplateVars = {
  agentName: string;
  companyName: string;
  /** Optional; empty when unknown (e.g. some prequal flows). */
  propertyLine: string;
};

const VAR_AGENT = /\{\{agentName\}\}/g;
const VAR_COMPANY = /\{\{companyName\}\}/g;
const VAR_PROPERTY = /\{\{propertyLine\}\}/g;

/** Apply placeholders. Template must be plain text only (stored in DB). */
export function applyPublicFooterTemplate(
  template: string | null | undefined,
  vars: PublicFooterTemplateVars,
): string {
  const raw = template?.trim();
  const base = raw && raw.length > 0 ? raw : DEFAULT_PUBLIC_FOOTER_TEMPLATE;
  return base
    .replace(VAR_AGENT, vars.agentName || "")
    .replace(VAR_COMPANY, vars.companyName || "")
    .replace(VAR_PROPERTY, vars.propertyLine || "");
}
