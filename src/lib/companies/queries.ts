import { getSql } from "@/lib/db/neon";
import type { FeedbackFormConfigStored } from "@/lib/feedback/form-config";
import type { LettingsFeedbackFormConfigStored } from "@/lib/feedback/lettings-form-config";
import type {
  LettingPrequalFormConfigStored,
  LettingPrequalSettingsResolved,
  SalePrequalFormConfigStored,
  SalePrequalSettingsResolved,
} from "@/lib/prequal/page-copy-config";
import {
  mergeLettingPrequalSettings,
  mergeSalePrequalSettings,
  parseLettingPrequalFormConfigFromDb,
  parseSalePrequalFormConfigFromDb,
} from "@/lib/prequal/page-copy-config";

export type CompanyFeedbackInviteTemplates = {
  feedback_invite_subject_template: string | null;
  feedback_invite_body_template: string | null;
  agent_copy_invite_subject_template: string | null;
  agent_copy_invite_body_template: string | null;
  invite_show_property_photo: boolean;
  invite_use_system_footer: boolean;
};

export async function getCompanyFeedbackInviteTemplates(
  companyId: string,
): Promise<CompanyFeedbackInviteTemplates | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      feedback_invite_subject_template,
      feedback_invite_body_template,
      agent_copy_invite_subject_template,
      agent_copy_invite_body_template,
      invite_show_property_photo,
      invite_use_system_footer
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `;
  const row = rows[0] as CompanyFeedbackInviteTemplates | undefined;
  return row ?? null;
}

export async function updateCompanyFeedbackInviteTemplates(
  companyId: string,
  subject: string | null,
  body: string | null,
  inviteShowPropertyPhoto: boolean,
  inviteIncludeFooter: boolean,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE companies
    SET
      feedback_invite_subject_template = ${subject},
      feedback_invite_body_template = ${body},
      invite_show_property_photo = ${inviteShowPropertyPhoto},
      invite_use_system_footer = ${inviteIncludeFooter}
    WHERE id = ${companyId}
  `;
}

export async function resetCompanyFeedbackInviteTemplates(companyId: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE companies
    SET
      feedback_invite_subject_template = NULL,
      feedback_invite_body_template = NULL,
      invite_show_property_photo = true,
      invite_use_system_footer = true
    WHERE id = ${companyId}
  `;
}

export async function updateCompanyAgentCopyInviteTemplates(
  companyId: string,
  subject: string | null,
  body: string | null,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE companies
    SET
      agent_copy_invite_subject_template = ${subject},
      agent_copy_invite_body_template = ${body}
    WHERE id = ${companyId}
  `;
}

export async function getCompanyFeedbackFormConfig(
  companyId: string,
): Promise<unknown | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT feedback_form_config
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `;
  const row = rows[0] as { feedback_form_config: unknown } | undefined;
  return row?.feedback_form_config ?? null;
}

export type SettingsBrandingRow = {
  company_name: string;
  brand_logo_url: string | null;
  agent_name: string;
  profile_photo_url: string | null;
  public_footer_template: string | null;
  public_footer_show_agent_photo: boolean;
  invite_use_system_footer: boolean;
};

export async function getSettingsBranding(
  userId: string,
  companyId: string,
): Promise<SettingsBrandingRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      c.name AS company_name,
      c.brand_logo_url,
      c.public_footer_template,
      c.public_footer_show_agent_photo,
      c.invite_use_system_footer,
      u.name AS agent_name,
      u.profile_photo_url
    FROM users u
    INNER JOIN companies c ON c.id = u.company_id
    WHERE u.id = ${userId} AND u.company_id = ${companyId}
    LIMIT 1
  `;
  const row = rows[0] as SettingsBrandingRow | undefined;
  return row ?? null;
}

export async function updateCompanyPublicFooterSettings(
  companyId: string,
  template: string | null,
  showAgentPhoto: boolean,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE companies
    SET
      public_footer_template = ${template},
      public_footer_show_agent_photo = ${showAgentPhoto}
    WHERE id = ${companyId}
  `;
}

export async function updateCompanyBrandLogoUrl(
  companyId: string,
  logoUrl: string | null,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE companies
    SET brand_logo_url = ${logoUrl}
    WHERE id = ${companyId}
  `;
}

export async function updateUserProfilePhotoUrl(
  userId: string,
  companyId: string,
  photoUrl: string | null,
): Promise<boolean> {
  const sql = getSql();
  const result = await sql`
    UPDATE users
    SET profile_photo_url = ${photoUrl}
    WHERE id = ${userId} AND company_id = ${companyId}
    RETURNING id
  `;
  return (result as { id: string }[]).length > 0;
}

export async function updateCompanyFeedbackFormConfig(
  companyId: string,
  config: FeedbackFormConfigStored | null,
): Promise<void> {
  const sql = getSql();
  if (config === null) {
    await sql`
      UPDATE companies
      SET feedback_form_config = NULL
      WHERE id = ${companyId}
    `;
    return;
  }
  await sql`
    UPDATE companies
    SET feedback_form_config = ${config}
    WHERE id = ${companyId}
  `;
}

export async function getCompanyLettingsFeedbackFormConfig(
  companyId: string,
): Promise<unknown | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT lettings_feedback_form_config
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `;
  const row = rows[0] as { lettings_feedback_form_config: unknown } | undefined;
  return row?.lettings_feedback_form_config ?? null;
}

export async function updateCompanyLettingsFeedbackFormConfig(
  companyId: string,
  config: LettingsFeedbackFormConfigStored | null,
): Promise<void> {
  const sql = getSql();
  if (config === null) {
    await sql`
      UPDATE companies
      SET lettings_feedback_form_config = NULL
      WHERE id = ${companyId}
    `;
    return;
  }
  await sql`
    UPDATE companies
    SET lettings_feedback_form_config = ${config}
    WHERE id = ${companyId}
  `;
}

export type CompanyPrequalShareTemplatesRow = {
  sale_prequal_share_whatsapp_template: string | null;
  sale_prequal_share_email_subject_template: string | null;
  sale_prequal_share_email_body_template: string | null;
  letting_prequal_share_whatsapp_template: string | null;
  letting_prequal_share_email_subject_template: string | null;
  letting_prequal_share_email_body_template: string | null;
};

export async function getCompanyPrequalFormConfigs(companyId: string): Promise<{
  sale_raw: unknown | null;
  letting_raw: unknown | null;
}> {
  const sql = getSql();
  const rows = await sql`
    SELECT sale_prequal_form_config, letting_prequal_form_config
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `;
  const row = rows[0] as
    | {
        sale_prequal_form_config: unknown | null;
        letting_prequal_form_config: unknown | null;
      }
    | undefined;
  return {
    sale_raw: row?.sale_prequal_form_config ?? null,
    letting_raw: row?.letting_prequal_form_config ?? null,
  };
}

export async function getCompanyPrequalShareTemplates(
  companyId: string,
): Promise<CompanyPrequalShareTemplatesRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      sale_prequal_share_whatsapp_template,
      sale_prequal_share_email_subject_template,
      sale_prequal_share_email_body_template,
      letting_prequal_share_whatsapp_template,
      letting_prequal_share_email_subject_template,
      letting_prequal_share_email_body_template
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `;
  return (rows[0] as CompanyPrequalShareTemplatesRow | undefined) ?? null;
}

export async function updateCompanyPrequalShareTemplates(
  companyId: string,
  side: "sale" | "letting",
  patch: {
    whatsapp: string | null;
    emailSubject: string | null;
    emailBody: string | null;
  },
): Promise<void> {
  const sql = getSql();
  if (side === "sale") {
    await sql`
      UPDATE companies
      SET
        sale_prequal_share_whatsapp_template = ${patch.whatsapp},
        sale_prequal_share_email_subject_template = ${patch.emailSubject},
        sale_prequal_share_email_body_template = ${patch.emailBody}
      WHERE id = ${companyId}
    `;
  } else {
    await sql`
      UPDATE companies
      SET
        letting_prequal_share_whatsapp_template = ${patch.whatsapp},
        letting_prequal_share_email_subject_template = ${patch.emailSubject},
        letting_prequal_share_email_body_template = ${patch.emailBody}
      WHERE id = ${companyId}
    `;
  }
}

export async function getSalePrequalSettingsForCompany(
  companyId: string,
): Promise<SalePrequalSettingsResolved> {
  const sql = getSql();
  const rows = await sql`
    SELECT sale_prequal_form_config
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `;
  const raw = (rows[0] as { sale_prequal_form_config: unknown | null } | undefined)
    ?.sale_prequal_form_config ?? null;
  return mergeSalePrequalSettings(parseSalePrequalFormConfigFromDb(raw));
}

export async function getLettingPrequalSettingsForCompany(
  companyId: string,
): Promise<LettingPrequalSettingsResolved> {
  const sql = getSql();
  const rows = await sql`
    SELECT letting_prequal_form_config
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `;
  const raw = (rows[0] as { letting_prequal_form_config: unknown | null } | undefined)
    ?.letting_prequal_form_config ?? null;
  return mergeLettingPrequalSettings(parseLettingPrequalFormConfigFromDb(raw));
}

export async function updateCompanySalePrequalFormConfig(
  companyId: string,
  config: SalePrequalFormConfigStored | null,
): Promise<void> {
  const sql = getSql();
  if (config === null) {
    await sql`
      UPDATE companies
      SET sale_prequal_form_config = NULL
      WHERE id = ${companyId}
    `;
    return;
  }
  await sql`
    UPDATE companies
    SET sale_prequal_form_config = ${config}
    WHERE id = ${companyId}
  `;
}

export async function updateCompanyLettingPrequalFormConfig(
  companyId: string,
  config: LettingPrequalFormConfigStored | null,
): Promise<void> {
  const sql = getSql();
  if (config === null) {
    await sql`
      UPDATE companies
      SET letting_prequal_form_config = NULL
      WHERE id = ${companyId}
    `;
    return;
  }
  await sql`
    UPDATE companies
    SET letting_prequal_form_config = ${config}
    WHERE id = ${companyId}
  `;
}
