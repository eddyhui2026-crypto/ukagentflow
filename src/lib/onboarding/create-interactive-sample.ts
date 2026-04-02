import { randomBytes } from "node:crypto";
import { getSql } from "@/lib/db/neon";
import { getAppBaseUrl } from "@/lib/env/app-url";
import { storeHighlights } from "@/lib/feedback/extended-fields";
import { newPropertyShareToken } from "@/lib/properties/share-tokens";
import { getPropertyForCompany } from "@/lib/properties/queries";
import {
  getUserInteractiveOnboardingSamplePropertyId,
  setUserInteractiveOnboardingSamplePropertyId,
} from "@/lib/users/interactive-onboarding";

export type InteractiveSampleResult =
  | {
      ok: true;
      propertyId: string;
      feedbackId: string;
      vendorPortalToken: string;
      feedbackToken: string;
      feedbackUrl: string;
      vendorPortalUrl: string;
    }
  | { ok: false; error: string };

const SAMPLE_ADDRESS = "12 Sample Mews";
const SAMPLE_POSTCODE = "EC1A 1BB";
const SAMPLE_VENDOR = "Sample vendor (delete anytime)";
const DEMO_BUYER_NAME = "Alex (demo viewer)";

function viewingDateIsoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function loadExistingSample(
  companyId: string,
  propertyId: string,
): Promise<InteractiveSampleResult | null> {
  const prop = await getPropertyForCompany(propertyId, companyId);
  if (!prop) {
    return null;
  }
  const sql = getSql();
  const tokenRows = await sql`
    SELECT vb.feedback_token, f.id AS feedback_id
    FROM viewing_buyers vb
    INNER JOIN viewings v ON v.id = vb.viewing_id
    INNER JOIN feedback f ON f.viewing_id = v.id AND f.buyer_id = vb.buyer_id
    WHERE v.property_id = ${propertyId}
    LIMIT 1
  `;
  const tok = tokenRows[0] as { feedback_token: string; feedback_id: string } | undefined;
  if (!tok) {
    return null;
  }
  const base = getAppBaseUrl();
  return {
    ok: true,
    propertyId,
    feedbackId: tok.feedback_id,
    vendorPortalToken: prop.vendor_portal_token,
    feedbackToken: tok.feedback_token,
    feedbackUrl: `${base}/feedback/${tok.feedback_token}`,
    vendorPortalUrl: `${base}/vendor/${prop.vendor_portal_token}`,
  };
}

/**
 * Idempotent: returns existing linked sample property if present; otherwise inserts demo rows.
 */
export async function ensureInteractiveOnboardingSample(params: {
  companyId: string;
  userId: string;
  agentEmail: string;
}): Promise<InteractiveSampleResult> {
  const { companyId, userId, agentEmail } = params;
  const email = agentEmail.toLowerCase().trim();
  if (!email) {
    return { ok: false, error: "Missing agent email." };
  }

  const existingId = await getUserInteractiveOnboardingSamplePropertyId(userId);
  if (existingId) {
    const existing = await loadExistingSample(companyId, existingId);
    if (existing) {
      return existing;
    }
    await setUserInteractiveOnboardingSamplePropertyId(userId, null);
  }

  const sql = getSql();
  const vendorPortalToken = newPropertyShareToken();
  const buyerQrToken = newPropertyShareToken();
  const prequalShareToken = newPropertyShareToken();
  const salePrequalShareToken = newPropertyShareToken();
  const feedbackToken = randomBytes(32).toString("base64url");
  const viewingDate = viewingDateIsoDaysAgo(5);
  const highlightsStored = storeHighlights(["kitchen", "garden"]);

  let propertyId: string | null = null;

  try {
    const propRows = await sql`
      INSERT INTO properties (
        company_id,
        address,
        postcode,
        vendor_name,
        status,
        vendor_portal_token,
        buyer_qr_token,
        prequal_share_token,
        sale_prequal_share_token,
        hero_image_url,
        listing_type
      )
      VALUES (
        ${companyId},
        ${SAMPLE_ADDRESS},
        ${SAMPLE_POSTCODE},
        ${SAMPLE_VENDOR},
        'active',
        ${vendorPortalToken},
        ${buyerQrToken},
        ${prequalShareToken},
        ${salePrequalShareToken},
        NULL,
        'sale'::listing_type
      )
      RETURNING id
    `;
    const p = propRows[0] as { id: string } | undefined;
    propertyId = p?.id ?? null;
    if (!propertyId) {
      return { ok: false, error: "Could not create sample property." };
    }

    const viewingRows = await sql`
      INSERT INTO viewings (property_id, viewing_date, agent_id, invite_emails_via_app)
      VALUES (${propertyId}, ${viewingDate}, ${userId}, false)
      RETURNING id
    `;
    const v = viewingRows[0] as { id: string } | undefined;
    const viewingId = v?.id;
    if (!viewingId) {
      throw new Error("viewing_insert_failed");
    }

    const buyerRows = await sql`
      INSERT INTO buyers (id, company_id, name, email, phone)
      VALUES (gen_random_uuid(), ${companyId}, ${DEMO_BUYER_NAME}, ${email}, NULL)
      ON CONFLICT (company_id, email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = COALESCE(EXCLUDED.phone, buyers.phone)
      RETURNING id
    `;
    const buyerRow = buyerRows[0] as { id: string } | undefined;
    const buyerId = buyerRow?.id;
    if (!buyerId) {
      throw new Error("buyer_upsert_failed");
    }

    await sql`
      INSERT INTO viewing_buyers (
        viewing_id,
        buyer_id,
        feedback_token,
        feedback_invite_scheduled_at,
        email_sent,
        email_sent_at
      )
      VALUES (${viewingId}, ${buyerId}, ${feedbackToken}, NULL, true, now())
    `;

    const fbRows = await sql`
      INSERT INTO feedback (
        viewing_id,
        buyer_id,
        rating,
        interest_level,
        price_opinion,
        liked_text,
        disliked_text,
        wants_second_viewing,
        buyer_position,
        has_aip,
        property_highlights,
        negative_feedback_tags,
        listing_type,
        target_move_in_date,
        occupant_count,
        has_pets,
        pets_detail,
        household_income_band
      )
      VALUES (
        ${viewingId},
        ${buyerId},
        ${4},
        'warm'::interest_level,
        'fair'::price_opinion,
        ${"Bright kitchen and a usable garden — easy to picture living here."},
        ${"Only niggle: the hallway could do with a refresh."},
        ${true},
        'first_time_buyer'::buyer_position,
        ${true},
        ${highlightsStored},
        ${""},
        'sale'::listing_type,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
      )
      RETURNING id
    `;
    const fb = fbRows[0] as { id: string } | undefined;
    const feedbackId = fb?.id;
    if (!feedbackId) {
      throw new Error("feedback_insert_failed");
    }

    await setUserInteractiveOnboardingSamplePropertyId(userId, propertyId);

    const base = getAppBaseUrl();
    return {
      ok: true,
      propertyId,
      feedbackId,
      vendorPortalToken,
      feedbackToken,
      feedbackUrl: `${base}/feedback/${feedbackToken}`,
      vendorPortalUrl: `${base}/vendor/${vendorPortalToken}`,
    };
  } catch {
    if (propertyId) {
      await sql`DELETE FROM properties WHERE id = ${propertyId} AND company_id = ${companyId}`;
    }
    return { ok: false, error: "Could not create demo data. Try again." };
  }
}
