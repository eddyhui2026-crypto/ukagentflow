/** Clipboard helpers for agents sharing pre-viewing links (sale & to let). */

/** Matches `companies` pre-view share columns (see migrations). */
export type PrequalShareTemplatesRowLike = {
  sale_prequal_share_whatsapp_template: string | null;
  sale_prequal_share_email_subject_template: string | null;
  sale_prequal_share_email_body_template: string | null;
  letting_prequal_share_whatsapp_template: string | null;
  letting_prequal_share_email_subject_template: string | null;
  letting_prequal_share_email_body_template: string | null;
};

export type PrequalShareVars = {
  propertyLine: string;
  prequalLink: string;
};

const VAR_LINE = /\{\{propertyLine\}\}/g;
const VAR_LINK = /\{\{prequalLink\}\}/g;

export function applyPrequalShareTemplate(template: string, vars: PrequalShareVars): string {
  return template.replace(VAR_LINE, vars.propertyLine).replace(VAR_LINK, vars.prequalLink);
}

export const DEFAULT_SALE_PREQUAL_SHARE_WHATSAPP_TEMPLATE =
  "Hi — before your viewing at {{propertyLine}}, please complete our short pre-viewing checks: {{prequalLink}}";

export const DEFAULT_LETTING_PREQUAL_SHARE_WHATSAPP_TEMPLATE =
  "Hi — before your viewing at {{propertyLine}} (to let), please complete our short pre-viewing form: {{prequalLink}}";

export const DEFAULT_SALE_PREQUAL_SHARE_EMAIL_SUBJECT_TEMPLATE =
  "Pre-viewing checks — {{propertyLine}}";

export const DEFAULT_SALE_PREQUAL_SHARE_EMAIL_BODY_TEMPLATE = `Hi,

Before your viewing, please complete our short pre-viewing checks using the link below:
{{prequalLink}}

Thank you`;

export const DEFAULT_LETTING_PREQUAL_SHARE_EMAIL_SUBJECT_TEMPLATE =
  "Pre-viewing (to let) — {{propertyLine}}";

export const DEFAULT_LETTING_PREQUAL_SHARE_EMAIL_BODY_TEMPLATE = `Hi,

Before your viewing, please complete our short tenant pre-viewing form:
{{prequalLink}}

Thank you`;

export type PrequalListingKind = "sale" | "letting";

export type PrequalShareTemplatesInput = {
  whatsapp: string | null | undefined;
  emailSubject: string | null | undefined;
  emailBody: string | null | undefined;
  listing: PrequalListingKind;
};

/** Built-in copy shown in Settings placeholders and used when DB values are null. */
export const DEFAULT_PREQUAL_SHARE_TEMPLATES: Record<
  PrequalListingKind,
  { whatsapp: string; emailSubject: string; emailBody: string }
> = {
  sale: {
    whatsapp: DEFAULT_SALE_PREQUAL_SHARE_WHATSAPP_TEMPLATE,
    emailSubject: DEFAULT_SALE_PREQUAL_SHARE_EMAIL_SUBJECT_TEMPLATE,
    emailBody: DEFAULT_SALE_PREQUAL_SHARE_EMAIL_BODY_TEMPLATE,
  },
  letting: {
    whatsapp: DEFAULT_LETTING_PREQUAL_SHARE_WHATSAPP_TEMPLATE,
    emailSubject: DEFAULT_LETTING_PREQUAL_SHARE_EMAIL_SUBJECT_TEMPLATE,
    emailBody: DEFAULT_LETTING_PREQUAL_SHARE_EMAIL_BODY_TEMPLATE,
  },
};

function resolvedWhatsappTemplates(input: PrequalShareTemplatesInput): string {
  const t = input.whatsapp?.trim();
  if (t) return t;
  return input.listing === "sale"
    ? DEFAULT_SALE_PREQUAL_SHARE_WHATSAPP_TEMPLATE
    : DEFAULT_LETTING_PREQUAL_SHARE_WHATSAPP_TEMPLATE;
}

function resolvedEmailSubject(input: PrequalShareTemplatesInput): string {
  const t = input.emailSubject?.trim();
  if (t) return t;
  return input.listing === "sale"
    ? DEFAULT_SALE_PREQUAL_SHARE_EMAIL_SUBJECT_TEMPLATE
    : DEFAULT_LETTING_PREQUAL_SHARE_EMAIL_SUBJECT_TEMPLATE;
}

function resolvedEmailBody(input: PrequalShareTemplatesInput): string {
  const t = input.emailBody?.trim();
  if (t) return t;
  return input.listing === "sale"
    ? DEFAULT_SALE_PREQUAL_SHARE_EMAIL_BODY_TEMPLATE
    : DEFAULT_LETTING_PREQUAL_SHARE_EMAIL_BODY_TEMPLATE;
}

export function buildPreViewingWhatsAppText(params: {
  propertyLine: string;
  prequalUrl: string;
  templates: PrequalShareTemplatesInput;
}): string {
  const tpl = resolvedWhatsappTemplates(params.templates);
  return applyPrequalShareTemplate(tpl, {
    propertyLine: params.propertyLine,
    prequalLink: params.prequalUrl,
  });
}

/**
 * Plain-text block for clipboard: To + Subject + body (paste into an email client).
 * "To:" is left blank for the agent to fill.
 */
export function buildPreViewingEmailDraft(params: {
  propertyLine: string;
  prequalUrl: string;
  templates: PrequalShareTemplatesInput;
}): string {
  const subjectTpl = resolvedEmailSubject(params.templates);
  const bodyTpl = resolvedEmailBody(params.templates);
  const subject = applyPrequalShareTemplate(subjectTpl, {
    propertyLine: params.propertyLine,
    prequalLink: params.prequalUrl,
  });
  const body = applyPrequalShareTemplate(bodyTpl, {
    propertyLine: params.propertyLine,
    prequalLink: params.prequalUrl,
  });
  return `To:\n\nSubject: ${subject}\n\n${body}`;
}

export function prequalShareTemplatesInputFromRow(
  row: PrequalShareTemplatesRowLike | null,
  listing: "sale" | "letting",
): PrequalShareTemplatesInput {
  if (!row) {
    return { listing, whatsapp: null, emailSubject: null, emailBody: null };
  }
  if (listing === "sale") {
    return {
      listing,
      whatsapp: row.sale_prequal_share_whatsapp_template,
      emailSubject: row.sale_prequal_share_email_subject_template,
      emailBody: row.sale_prequal_share_email_body_template,
    };
  }
  return {
    listing,
    whatsapp: row.letting_prequal_share_whatsapp_template,
    emailSubject: row.letting_prequal_share_email_subject_template,
    emailBody: row.letting_prequal_share_email_body_template,
  };
}
