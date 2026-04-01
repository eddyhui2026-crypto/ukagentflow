"use server";

import { compare, hash } from "bcryptjs";
import { auth } from "@/auth";
import { getSql } from "@/lib/db/neon";
import {
  resetCompanyFeedbackInviteTemplates,
  updateCompanyAgentCopyInviteTemplates,
  updateCompanyBrandLogoUrl,
  updateCompanyFeedbackFormConfig,
  updateCompanyFeedbackInviteTemplates,
  updateCompanyLettingsFeedbackFormConfig,
  updateCompanyLettingPrequalFormConfig,
  updateCompanyPrequalShareTemplates,
  updateCompanyPublicFooterSettings,
  updateCompanySalePrequalFormConfig,
  updateUserProfilePhotoUrl,
} from "@/lib/companies/queries";
import {
  diffFeedbackFormConfigForStorage,
  resolvedFeedbackFormCopyFromFormData,
} from "@/lib/feedback/form-config";
import {
  diffLettingsFeedbackFormConfigForStorage,
  resolvedLettingsFeedbackFormCopyFromFormData,
} from "@/lib/feedback/lettings-form-config";
import {
  diffLettingPrequalSettingsForStorage,
  diffSalePrequalSettingsForStorage,
  resolvedLettingPrequalSettingsFromFormData,
  resolvedSalePrequalSettingsFromFormData,
} from "@/lib/prequal/page-copy-config";
import { parseHttpsImageUrl } from "@/lib/branding/safe-image-url";
import { revalidatePath } from "next/cache";

export type FeedbackInviteTemplateState =
  | { error: string }
  | { success: true; message?: string }
  | undefined;

const MAX_SUBJECT = 200;
const MAX_BODY = 8000;

export async function saveFeedbackInviteTemplatesAction(
  _prev: FeedbackInviteTemplateState,
  formData: FormData,
): Promise<FeedbackInviteTemplateState> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { error: "Not signed in." };
  }

  const intent = String(formData.get("intent") ?? "save").trim();

  if (intent === "reset") {
    await resetCompanyFeedbackInviteTemplates(session.user.companyId);
    revalidatePath("/settings");
    return { success: true, message: "Restored built-in defaults for new emails." };
  }

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return { error: "Body cannot be empty." };
  }
  if (subject.length > MAX_SUBJECT) {
    return { error: `Subject must be at most ${MAX_SUBJECT} characters.` };
  }
  if (body.length > MAX_BODY) {
    return { error: `Body must be at most ${MAX_BODY} characters.` };
  }
  if (!body.includes("{{feedbackLink}}")) {
    return {
      error:
        "Body must include {{feedbackLink}} so buyers receive a working link to the feedback form.",
    };
  }

  const inviteShowPropertyPhoto = formData.get("invite_show_property_photo") === "on";
  const inviteIncludeFooter = formData.get("invite_include_footer") === "on";

  await updateCompanyFeedbackInviteTemplates(
    session.user.companyId,
    subject.length > 0 ? subject : null,
    body,
    inviteShowPropertyPhoto,
    inviteIncludeFooter,
  );
  revalidatePath("/settings");
  return { success: true, message: "Saved. New viewing invites will use this template." };
}

export type FeedbackFormSettingsState =
  | { error: string }
  | { success: true; message?: string }
  | undefined;

export async function saveFeedbackFormConfigAction(
  _prev: FeedbackFormSettingsState,
  formData: FormData,
): Promise<FeedbackFormSettingsState> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { error: "Not signed in." };
  }

  const intent = String(formData.get("intent") ?? "save").trim();

  if (intent === "reset") {
    await updateCompanyFeedbackFormConfig(session.user.companyId, null);
    revalidatePath("/settings");
    return {
      success: true,
      message: "Buyer feedback page restored to built-in English copy.",
    };
  }

  const resolved = resolvedFeedbackFormCopyFromFormData(formData);
  const toStore = diffFeedbackFormConfigForStorage(resolved);
  await updateCompanyFeedbackFormConfig(session.user.companyId, toStore);
  revalidatePath("/settings");
  return {
    success: true,
    message: "Saved. Buyers opening your links will see this wording.",
  };
}

export type LettingsFeedbackFormSettingsState =
  | { error: string }
  | { success: true; message?: string }
  | undefined;

export type SalePrequalPageCopySettingsState =
  | { error: string }
  | { success: true; message?: string }
  | undefined;

export async function saveSalePrequalPageCopyAction(
  _prev: SalePrequalPageCopySettingsState,
  formData: FormData,
): Promise<SalePrequalPageCopySettingsState> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { error: "Not signed in." };
  }

  const intent = String(formData.get("intent") ?? "save").trim();

  if (intent === "reset") {
    await updateCompanySalePrequalFormConfig(session.user.companyId, null);
    revalidatePath("/settings");
    return {
      success: true,
      message: "For-sale pre-viewing page restored to built-in wording.",
    };
  }

  const resolved = resolvedSalePrequalSettingsFromFormData(formData);
  const toStore = diffSalePrequalSettingsForStorage(resolved);
  await updateCompanySalePrequalFormConfig(session.user.companyId, toStore);
  revalidatePath("/settings");
  return {
    success: true,
    message: "Saved. New visitors to your sale pre-viewing links will see this copy.",
  };
}

export type LettingPrequalPageCopySettingsState =
  | { error: string }
  | { success: true; message?: string }
  | undefined;

export async function saveLettingPrequalPageCopyAction(
  _prev: LettingPrequalPageCopySettingsState,
  formData: FormData,
): Promise<LettingPrequalPageCopySettingsState> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { error: "Not signed in." };
  }

  const intent = String(formData.get("intent") ?? "save").trim();

  if (intent === "reset") {
    await updateCompanyLettingPrequalFormConfig(session.user.companyId, null);
    revalidatePath("/settings");
    return {
      success: true,
      message: "To-let pre-viewing page restored to built-in wording.",
    };
  }

  const resolved = resolvedLettingPrequalSettingsFromFormData(formData);
  const toStore = diffLettingPrequalSettingsForStorage(resolved);
  await updateCompanyLettingPrequalFormConfig(session.user.companyId, toStore);
  revalidatePath("/settings");
  return {
    success: true,
    message: "Saved. New visitors to your rental pre-viewing links will see this copy.",
  };
}

export type PrequalShareTemplatesSettingsState = { error: string } | { ok: true } | null;

const MAX_PREQUAL_SHARE_SUBJECT = 200;
const MAX_PREQUAL_SHARE_WA = 4000;
const MAX_PREQUAL_SHARE_BODY = 8000;

export async function savePrequalShareTemplatesSettingsAction(
  _prev: PrequalShareTemplatesSettingsState,
  formData: FormData,
): Promise<PrequalShareTemplatesSettingsState> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { error: "Not signed in." };
  }

  const listingRaw = String(formData.get("listing") ?? "").trim();
  if (listingRaw !== "sale" && listingRaw !== "letting") {
    return { error: "Invalid listing type." };
  }
  const side = listingRaw as "sale" | "letting";

  const intent = String(formData.get("intent") ?? "save").trim();
  if (intent === "reset") {
    await updateCompanyPrequalShareTemplates(session.user.companyId, side, {
      whatsapp: null,
      emailSubject: null,
      emailBody: null,
    });
    revalidatePath("/settings");
    revalidatePath("/properties", "layout");
    return { ok: true };
  }

  const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;
  const emailSubject = String(formData.get("emailSubject") ?? "").trim() || null;
  const emailBody = String(formData.get("emailBody") ?? "").trim() || null;

  const fieldError = (label: string, s: string | null, max: number): string | null => {
    if (!s) return null;
    if (s.length > max) return `${label} must be at most ${max} characters.`;
    if (!s.includes("{{prequalLink}}")) {
      return `${label} must include {{prequalLink}}.`;
    }
    if (!s.includes("{{propertyLine}}")) {
      return `${label} must include {{propertyLine}}.`;
    }
    return null;
  };

  const waErr = fieldError("WhatsApp message", whatsapp, MAX_PREQUAL_SHARE_WA);
  if (waErr) return { error: waErr };
  const subjErr = fieldError("Email subject", emailSubject, MAX_PREQUAL_SHARE_SUBJECT);
  if (subjErr) return { error: subjErr };
  const bodyErr = fieldError("Email body", emailBody, MAX_PREQUAL_SHARE_BODY);
  if (bodyErr) return { error: bodyErr };

  await updateCompanyPrequalShareTemplates(session.user.companyId, side, {
    whatsapp,
    emailSubject,
    emailBody,
  });
  revalidatePath("/settings");
  revalidatePath("/properties", "layout");
  return { ok: true };
}

export async function saveLettingsFeedbackFormConfigAction(
  _prev: LettingsFeedbackFormSettingsState,
  formData: FormData,
): Promise<LettingsFeedbackFormSettingsState> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { error: "Not signed in." };
  }

  const intent = String(formData.get("intent") ?? "save").trim();

  if (intent === "reset") {
    await updateCompanyLettingsFeedbackFormConfig(session.user.companyId, null);
    revalidatePath("/settings");
    return {
      success: true,
      message: "Lettings feedback page restored to built-in English copy.",
    };
  }

  const resolved = resolvedLettingsFeedbackFormCopyFromFormData(formData);
  const toStore = diffLettingsFeedbackFormConfigForStorage(resolved);
  await updateCompanyLettingsFeedbackFormConfig(session.user.companyId, toStore);
  revalidatePath("/settings");
  return {
    success: true,
    message: "Saved. Tenants on rental listings will see this wording.",
  };
}

export type AgentCopyInviteTemplateState =
  | { error: string }
  | { success: true; message?: string }
  | undefined;

const MAX_AC_SUBJECT = 200;
const MAX_AC_BODY = 8000;

export async function saveAgentCopyInviteTemplatesAction(
  _prev: AgentCopyInviteTemplateState,
  formData: FormData,
): Promise<AgentCopyInviteTemplateState> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { error: "Not signed in." };
  }

  const intent = String(formData.get("intent") ?? "save").trim();

  if (intent === "reset") {
    await updateCompanyAgentCopyInviteTemplates(session.user.companyId, null, null);
    revalidatePath("/settings");
    return {
      success: true,
      message: "Restored built-in copy-paste email templates.",
    };
  }

  const subject = String(formData.get("ac_subject") ?? "").trim();
  const body = String(formData.get("ac_body") ?? "").trim();

  if (!body) {
    return { error: "Body cannot be empty." };
  }
  if (subject.length > MAX_AC_SUBJECT) {
    return { error: `Subject must be at most ${MAX_AC_SUBJECT} characters.` };
  }
  if (body.length > MAX_AC_BODY) {
    return { error: `Body must be at most ${MAX_AC_BODY} characters.` };
  }
  if (!body.includes("{{feedbackLink}}")) {
    return {
      error:
        "Body must include {{feedbackLink}} so buyers receive the feedback URL in the pasted message.",
    };
  }

  await updateCompanyAgentCopyInviteTemplates(
    session.user.companyId,
    subject.length > 0 ? subject : null,
    body,
  );
  revalidatePath("/settings");
  return {
    success: true,
    message: "Saved. Property → Viewings → Copy email draft will use this wording.",
  };
}

export type InviteBrandingUrlsState =
  | { error: string }
  | { success: true; message?: string }
  | undefined;

export async function saveInviteBrandingUrlsAction(
  _prev: InviteBrandingUrlsState,
  formData: FormData,
): Promise<InviteBrandingUrlsState> {
  const session = await auth();
  const userId = session?.user?.id;
  const companyId = session?.user?.companyId;
  if (!userId || !companyId) {
    return { error: "Not signed in." };
  }

  const logoRaw = String(formData.get("brand_logo_url") ?? "").trim();
  const photoRaw = String(formData.get("profile_photo_url") ?? "").trim();

  const logoUrl = parseHttpsImageUrl(logoRaw || null);
  const photoUrl = parseHttpsImageUrl(photoRaw || null);

  if (logoRaw && !logoUrl) {
    return { error: "Company logo must be a full https image URL, or leave blank." };
  }
  if (photoRaw && !photoUrl) {
    return { error: "Your photo must be a full https image URL, or leave blank." };
  }

  await updateCompanyBrandLogoUrl(companyId, logoUrl);
  const ok = await updateUserProfilePhotoUrl(userId, companyId, photoUrl);
  if (!ok) {
    return { error: "Could not update your profile photo." };
  }

  revalidatePath("/settings");
  return { success: true, message: "Branding saved. New buyer invites will use these images." };
}

export type PublicFooterTemplateState =
  | { error: string }
  | { success: true; message?: string }
  | undefined;

const MAX_PUBLIC_FOOTER_TEMPLATE = 4000;

export async function savePublicFooterTemplateAction(
  _prev: PublicFooterTemplateState,
  formData: FormData,
): Promise<PublicFooterTemplateState> {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { error: "Not signed in." };
  }

  const intent = String(formData.get("intent") ?? "save").trim();

  if (intent === "reset") {
    await updateCompanyPublicFooterSettings(session.user.companyId, null, false);
    revalidatePath("/settings");
    return {
      success: true,
      message: "Restored built-in footer template and turned off agent photo.",
    };
  }

  const raw = String(formData.get("public_footer_template") ?? "");
  const trimmed = raw.trim();
  if (raw.length > MAX_PUBLIC_FOOTER_TEMPLATE) {
    return { error: `Footer must be at most ${MAX_PUBLIC_FOOTER_TEMPLATE} characters.` };
  }

  const showAgentPhoto = formData.get("public_footer_show_agent_photo") === "on";
  await updateCompanyPublicFooterSettings(
    session.user.companyId,
    trimmed.length > 0 ? raw.replace(/\r\n/g, "\n").trimEnd() : null,
    showAgentPhoto,
  );
  revalidatePath("/settings");
  return {
    success: true,
    message: "Saved. Automated feedback invite emails will use this footer.",
  };
}

export type ChangePasswordState =
  | { error: string }
  | { success: true; message?: string }
  | undefined;

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: "Not signed in." };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword) {
    return { error: "Fill in all fields." };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  const sql = getSql();
  const rows = await sql`
    SELECT password_hash
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  const row = rows[0] as { password_hash: string | null } | undefined;
  if (!row?.password_hash) {
    return { error: "Your account has no password set." };
  }

  const ok = await compare(currentPassword, row.password_hash);
  if (!ok) {
    return { error: "Current password is incorrect." };
  }

  const passwordHash = await hash(newPassword, 12);
  await sql`
    UPDATE users
    SET password_hash = ${passwordHash}
    WHERE id = ${userId}
  `;
  await sql`
    DELETE FROM password_reset_tokens
    WHERE user_id = ${userId}
  `;

  revalidatePath("/settings");
  return { success: true, message: "Password updated." };
}
