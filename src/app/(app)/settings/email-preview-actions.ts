"use server";

import { auth } from "@/auth";
import { getSettingsBranding } from "@/lib/companies/queries";
import { getAppBaseUrl } from "@/lib/env/app-url";
import {
  INVITE_EMAIL_PREVIEW_SAMPLE_PROPERTY_IMAGE_URL,
  splitSamplePropertyLineForInvitePreview,
} from "@/lib/email/invite-preview-samples";
import { renderFeedbackInviteEmailContent } from "@/lib/email/feedback-invite";

const MAX_SUBJECT = 200;
const MAX_BODY = 8000;

const SAMPLE_BUYER_NAME = "Jordan Example";
const SAMPLE_PROPERTY_LINE = "12 Sample Street, London, SW1A 1AA";
const SAMPLE_TOKEN = "sample-token-preview";

export type PreviewAutoInviteResult =
  | { ok: true; subject: string; text: string; html: string }
  | { ok: false; error: string };

export async function previewAutoInviteEmail(
  formData: FormData,
): Promise<PreviewAutoInviteResult> {
  const session = await auth();
  if (!session?.user?.id || !session.user.companyId) {
    return { ok: false, error: "Not signed in." };
  }

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return { ok: false, error: "Body cannot be empty." };
  }
  if (subject.length > MAX_SUBJECT) {
    return { ok: false, error: `Subject must be at most ${MAX_SUBJECT} characters.` };
  }
  if (body.length > MAX_BODY) {
    return { ok: false, error: `Body must be at most ${MAX_BODY} characters.` };
  }
  if (!body.includes("{{feedbackLink}}")) {
    return {
      ok: false,
      error:
        "Body must include {{feedbackLink}} so buyers receive a working link to the feedback form.",
    };
  }

  const previewShowPhoto = formData.get("invite_show_property_photo") !== "off";

  const brandingRow = await getSettingsBranding(session.user.id, session.user.companyId);

  if (!brandingRow) {
    return { ok: false, error: "Could not load company settings." };
  }

  const footerToggleRaw = formData.get("invite_include_footer");
  const previewIncludeFooter =
    footerToggleRaw === null || footerToggleRaw === undefined
      ? brandingRow.invite_use_system_footer
      : footerToggleRaw === "on";

  const { address, postcode } = splitSamplePropertyLineForInvitePreview(SAMPLE_PROPERTY_LINE);

  const base = getAppBaseUrl().replace(/\/$/, "");
  const feedbackLink = `${base}/feedback/${SAMPLE_TOKEN}`;

  const inviteLayout = {
    propertyAddress: address,
    propertyPostcode: postcode,
    propertyImageUrl: previewShowPhoto ? INVITE_EMAIL_PREVIEW_SAMPLE_PROPERTY_IMAGE_URL : null,
    companyName: brandingRow.company_name,
    companyLogoUrl: brandingRow.brand_logo_url,
    agentName: brandingRow.agent_name,
    showPropertyPhoto: previewShowPhoto,
    includeInviteFooter: previewIncludeFooter,
    publicFooterTemplate: brandingRow.public_footer_template,
    showAgentPhotoInFooter: brandingRow.public_footer_show_agent_photo,
    agentProfilePhotoUrl:
      brandingRow.public_footer_show_agent_photo && brandingRow.profile_photo_url
        ? brandingRow.profile_photo_url
        : null,
  };

  const { subject: outSubject, text, html } = renderFeedbackInviteEmailContent({
    subjectTemplate: subject.length > 0 ? subject : null,
    bodyTemplate: body,
    vars: {
      buyerName: SAMPLE_BUYER_NAME,
      propertyLine: SAMPLE_PROPERTY_LINE,
      feedbackLink,
    },
    inviteLayout,
  });

  return { ok: true, subject: outSubject, text, html };
}
