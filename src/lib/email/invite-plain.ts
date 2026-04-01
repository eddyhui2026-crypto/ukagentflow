export type InvitePlainTemplateVars = {
  buyerName: string;
  propertyLine: string;
  feedbackLink: string;
  /** Optional: use {{buyerEmail}} in copy-paste drafts */
  buyerEmail?: string;
};

/** Replace {{buyerName}}, {{propertyLine}}, {{feedbackLink}}, {{buyerEmail}} in a plain-text template. */
export function applyInvitePlainTemplate(
  template: string,
  vars: InvitePlainTemplateVars,
): string {
  return template
    .replace(/\{\{buyerName\}\}/g, vars.buyerName)
    .replace(/\{\{propertyLine\}\}/g, vars.propertyLine)
    .replace(/\{\{feedbackLink\}\}/g, vars.feedbackLink)
    .replace(/\{\{buyerEmail\}\}/g, vars.buyerEmail ?? "");
}
