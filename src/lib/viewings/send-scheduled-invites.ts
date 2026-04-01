import { getSql } from "@/lib/db/neon";
import { sendFeedbackInviteEmail } from "@/lib/email/feedback-invite";

const BATCH = 50;

type DueRow = {
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
};

export async function sendDueFeedbackInvites(): Promise<{
  scanned: number;
  sent: number;
  failed: number;
  /** Populated when sends fail (e.g. missing RESEND_* or Resend error message). */
  errors?: string[];
}> {
  const sql = getSql();
  const rows = (await sql`
    SELECT
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
    WHERE v.invite_emails_via_app = true
      AND vb.email_sent = false
      AND vb.token_invalidated_at IS NULL
      AND vb.feedback_invite_scheduled_at IS NOT NULL
      AND vb.feedback_invite_scheduled_at <= now()
    ORDER BY vb.feedback_invite_scheduled_at ASC
    LIMIT ${BATCH}
  `) as DueRow[];

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
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

    if (result.sent) {
      const upd = (await sql`
        UPDATE viewing_buyers
        SET email_sent = true, email_sent_at = now()
        WHERE feedback_token = ${row.feedback_token} AND email_sent = false
        RETURNING id
      `) as { id: string }[];
      if (upd.length > 0) {
        sent++;
      }
    } else {
      failed++;
      errors.push(`${row.buyer_email}: ${result.reason}`);
    }
  }

  return {
    scanned: rows.length,
    sent,
    failed,
    ...(errors.length > 0 ? { errors } : {}),
  };
}
