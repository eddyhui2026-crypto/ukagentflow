/**
 * "Scheme A" — minimal buyer feedback invite (property-first, clean notification style).
 * Table + inline CSS only for email clients.
 */

import {
  applyPublicFooterTemplate,
  PUBLIC_FORM_GDPR_NOTICE_EN,
} from "@/lib/branding/public-footer-template";

export type MinimalInviteLayoutInput = {
  buyerName: string;
  propertyAddress: string;
  propertyPostcode: string;
  /** Resolved hero URL or null */
  propertyImageUrl: string | null;
  companyName: string;
  companyLogoUrl: string | null;
  agentName: string;
  showPropertyPhoto: boolean;
  includeInviteFooter: boolean;
  feedbackLink: string;
  /** Plain-text template; null/empty → built-in default (see applyPublicFooterTemplate). */
  publicFooterTemplate: string | null;
  showAgentPhotoInFooter: boolean;
  agentProfilePhotoUrl: string | null;
};

const C_TEXT = "#0f172a";
const C_MUTED = "#64748b";
const C_PAGE_BG = "#f1f5f9";
const C_CARD_BG = "#ffffff";
const C_BTN = "#0284c7";

export function buildMinimalFeedbackInviteShellHtml(
  input: MinimalInviteLayoutInput,
  /** Body HTML from template with feedback link paragraph removed (optional intro/outro). */
  extraBodyHtml: string,
): string {
  const showImg = Boolean(input.showPropertyPhoto && input.propertyImageUrl);
  const nameOnlyBlock = input.companyName.trim()
    ? `<div style="text-align:center;padding:8px 16px 24px 16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="font-size:18px;font-weight:600;color:${C_TEXT};letter-spacing:-0.02em;line-height:1.35;">
    ${escapeHtml(input.companyName.trim())}
  </div>
</div>`
    : `<div style="padding:8px 16px 16px 16px;"></div>`;

  /** Match marketing mock: centred column — logo (if any), then company name underneath in muted type (when set). */
  const logoBlock = input.companyLogoUrl
    ? `<div style="text-align:center;padding:8px 16px 28px 16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <img src="${escapeAttr(input.companyLogoUrl)}" alt="${escapeAttr(input.companyName.trim() || "Company")}" height="40" style="display:inline-block;max-height:40px;width:auto;max-width:220px;height:auto;border:0;" />
  ${
    input.companyName.trim()
      ? `<div style="margin-top:10px;font-size:13px;font-weight:500;color:${C_MUTED};line-height:1.45;max-width:22rem;margin-left:auto;margin-right:auto;">
    ${escapeHtml(input.companyName.trim())}
  </div>`
      : ""
  }
</div>`
    : nameOnlyBlock;

  const propertyCardInner = showImg
    ? `
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
  <tr>
    <td width="44%" valign="middle" style="padding:0 16px 0 0;vertical-align:middle;">
      <img src="${escapeAttr(input.propertyImageUrl!)}" alt="" width="200" style="display:block;width:200px;max-width:100%;height:auto;border:0;border-radius:12px;" />
    </td>
    <td valign="middle" style="vertical-align:middle;padding:8px 0;">
      <div style="font-size:17px;font-weight:700;color:${C_TEXT};line-height:1.35;letter-spacing:-0.02em;">
        ${escapeHtml(input.propertyAddress)}
      </div>
      <div style="margin-top:6px;font-size:14px;font-weight:500;color:${C_MUTED};letter-spacing:0.02em;">
        ${escapeHtml(input.propertyPostcode)}
      </div>
    </td>
  </tr>
</table>`.trim()
    : `
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
  <tr>
    <td align="center" style="padding:20px 16px;">
      <div style="font-size:17px;font-weight:700;color:${C_TEXT};line-height:1.4;">
        ${escapeHtml(input.propertyAddress)}
      </div>
      <div style="margin-top:8px;font-size:14px;font-weight:500;color:${C_MUTED};">
        ${escapeHtml(input.propertyPostcode)}
      </div>
    </td>
  </tr>
</table>`.trim();

  const cardWrapOpen = showImg
    ? `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${C_CARD_BG};border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 1px 2px rgba(15,23,42,0.06);">`
    : `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f8fafc;border-radius:16px;border:2px dashed #cbd5e1;">`;

  const ctaButton = `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto 0 auto;border-collapse:collapse;">
  <tr>
    <td align="center" bgcolor="${C_BTN}" style="border-radius:10px;background:${C_BTN};mso-padding-alt:14px 32px;">
      <a href="${escapeAttr(input.feedbackLink)}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
        Leave feedback
      </a>
    </td>
  </tr>
</table>`.trim();

  const propertyLine = [input.propertyAddress, input.propertyPostcode].filter(Boolean).join(", ");
  const footerPlain = applyPublicFooterTemplate(input.publicFooterTemplate, {
    agentName: input.agentName,
    companyName: input.companyName,
    propertyLine,
  });
  const footerBodyHtml = plainFooterToShellHtml(footerPlain);

  const photoBlock =
    input.includeInviteFooter &&
    input.showAgentPhotoInFooter &&
    input.agentProfilePhotoUrl
      ? `<div style="text-align:center;margin-top:36px;padding-top:4px;">
  <img src="${escapeAttr(input.agentProfilePhotoUrl)}" alt="" width="56" height="56" style="display:inline-block;width:56px;height:56px;border-radius:9999px;object-fit:cover;border:0;" />
</div>`
      : "";

  const footerTextTopPad = photoBlock ? "12px" : "36px";

  const footerSig = input.includeInviteFooter
    ? `
${photoBlock}
<div style="margin-top:${footerTextTopPad};padding-top:24px;font-size:13px;color:${C_MUTED};line-height:1.5;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  ${footerBodyHtml}
</div>`.trim()
    : "";

  const gdpr = input.includeInviteFooter
    ? `<div style="margin-top:16px;font-size:11px;line-height:1.45;color:#94a3b8;text-align:center;max-width:480px;margin-left:auto;margin-right:auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  ${escapeHtml(PUBLIC_FORM_GDPR_NOTICE_EN)}
</div>`
    : "";

  const extraBlock = extraBodyHtml.trim()
    ? `<div style="margin-top:24px;font-size:15px;line-height:1.55;color:${C_TEXT};font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  ${extraBodyHtml}
</div>`
    : "";

  return `
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${C_PAGE_BG};margin:0;padding:0;">
  <tr>
    <td align="center" style="padding:32px 16px 40px 16px;">
      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:520px;margin:0 auto;">
        <tr>
          <td>
            ${logoBlock}
            <p style="margin:0 0 20px 0;font-size:17px;line-height:1.5;color:${C_TEXT};font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
              Hi ${escapeHtml(input.buyerName)},
            </p>
            ${cardWrapOpen}
              <tr>
                <td style="padding:20px;">
                  ${propertyCardInner}
                </td>
              </tr>
            </table>
            ${ctaButton}
            ${extraBlock}
            ${footerSig}
            ${gdpr}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
}

function plainFooterToShellHtml(plain: string): string {
  return plain
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map(
      (block) =>
        `<p style="margin:0 0 10px 0;">${escapeHtml(block).replace(/\n/g, "<br/>")}</p>`,
    )
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
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
