import { getSql } from "@/lib/db/neon";
import { sendFeedbackInviteEmail } from "@/lib/email/feedback-invite";
import {
  assertResendInviteAllowed,
  recordResendInviteEvent,
} from "@/lib/feedback/submit-rate-limit";
import { FEEDBACK_LINK_VALID_DAYS_AFTER_VIEWING } from "@/lib/feedback/token-policy";

export async function resendAppFeedbackInviteForViewingBuyer(options: {
  viewingBuyerId: string;
  propertyId: string;
  companyId: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      vb.id,
      v.invite_emails_via_app,
      vb.token_invalidated_at,
      (
        (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/London')::date >
        v.viewing_date + ${FEEDBACK_LINK_VALID_DAYS_AFTER_VIEWING}::integer
      ) AS link_expired,
      vb.feedback_token,
      b.email AS buyer_email,
      b.name AS buyer_name,
      p.address,
      p.postcode,
      p.hero_image_url,
      c.feedback_invite_subject_template,
      c.feedback_invite_body_template,
      c.invite_show_property_photo,
      c.invite_use_system_footer,
      c.name AS company_name,
      c.brand_logo_url,
      c.public_footer_template,
      c.public_footer_show_agent_photo,
      ua.name AS agent_name,
      ua.profile_photo_url AS agent_profile_photo_url
    FROM viewing_buyers vb
    INNER JOIN viewings v ON v.id = vb.viewing_id
    INNER JOIN properties p ON p.id = v.property_id
    INNER JOIN companies c ON c.id = p.company_id
    INNER JOIN users ua ON ua.id = v.agent_id
    INNER JOIN buyers b ON b.id = vb.buyer_id
    WHERE vb.id = ${options.viewingBuyerId}
      AND v.property_id = ${options.propertyId}
      AND p.company_id = ${options.companyId}
    LIMIT 1
  `;

  const row = rows[0] as
    | {
        id: string;
        invite_emails_via_app: boolean;
        token_invalidated_at: Date | string | null;
        link_expired: boolean;
        feedback_token: string;
        buyer_email: string;
        buyer_name: string;
        address: string;
        postcode: string;
        hero_image_url: string | null;
        feedback_invite_subject_template: string | null;
        feedback_invite_body_template: string | null;
        invite_show_property_photo: boolean;
        invite_use_system_footer: boolean;
        company_name: string;
        brand_logo_url: string | null;
        agent_name: string;
        public_footer_template: string | null;
        public_footer_show_agent_photo: boolean;
        agent_profile_photo_url: string | null;
      }
    | undefined;

  if (!row) {
    return { ok: false, message: "Buyer row not found." };
  }
  if (!row.invite_emails_via_app) {
    return {
      ok: false,
      message: "This viewing uses manual invites. Use Copy email draft.",
    };
  }
  if (row.token_invalidated_at) {
    return { ok: false, message: "This feedback link was revoked." };
  }
  if (row.link_expired) {
    return {
      ok: false,
      message: "Feedback window closed for this viewing. The buyer needs a new link (schedule again or contact support).",
    };
  }

  const rl = await assertResendInviteAllowed(options.viewingBuyerId);
  if (!rl.ok) {
    return rl;
  }

  const propertyLine = `${row.address}, ${row.postcode}`;
  const result = await sendFeedbackInviteEmail({
    to: row.buyer_email,
    buyerName: row.buyer_name,
    propertyLine,
    feedbackToken: row.feedback_token,
    subjectTemplate: row.feedback_invite_subject_template,
    bodyTemplate: row.feedback_invite_body_template,
    inviteLayout: {
      propertyAddress: row.address,
      propertyPostcode: row.postcode,
      propertyImageUrl: row.hero_image_url,
      companyName: row.company_name,
      companyLogoUrl: row.brand_logo_url,
      agentName: row.agent_name,
      showPropertyPhoto: row.invite_show_property_photo,
      includeInviteFooter: row.invite_use_system_footer,
      publicFooterTemplate: row.public_footer_template,
      showAgentPhotoInFooter: row.public_footer_show_agent_photo,
      agentProfilePhotoUrl:
        row.public_footer_show_agent_photo && row.agent_profile_photo_url
          ? row.agent_profile_photo_url
          : null,
    },
  });

  if (!result.sent) {
    return { ok: false, message: result.reason || "Email could not be sent." };
  }

  await recordResendInviteEvent(options.viewingBuyerId);

  await sql`
    UPDATE viewing_buyers
    SET email_sent = true,
        email_sent_at = now()
    WHERE id = ${row.id}
  `;

  return { ok: true };
}
