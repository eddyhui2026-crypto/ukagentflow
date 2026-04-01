"use server";

import { getSql } from "@/lib/db/neon";
import { consumePrequalSubmitAttempt } from "@/lib/lettings/prequal-submit-rate";
import { getRequestClientIp } from "@/lib/http/client-ip";
import { getSalePropertyForPrequalToken } from "@/lib/sales/prequal-queries";
import { redirect } from "next/navigation";

export type SalePrequalFormState = { error?: string } | undefined;

const BUYING_POSITION = new Set([
  "ftb",
  "no_dependent_sale",
  "sale_on_market",
  "sale_not_on_market",
  "sale_sold_stc",
  "unspecified",
]);

const FUNDING = new Set(["mortgage", "cash"]);

const MORTGAGE_DIP = new Set(["have_dip", "pending", "not_yet", "na"]);

const SOLICITOR = new Set(["instructed", "arranging", "not_yet", "unspecified"]);

const TARGET_BAND = new Set([
  "asap",
  "1_3_months",
  "3_6_months",
  "6_plus_months",
  "researching",
  "unspecified",
]);

function normalizeEmail(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (!s || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return null;
  return s;
}

export async function submitSalePrequalAction(
  _prev: SalePrequalFormState,
  formData: FormData,
): Promise<SalePrequalFormState> {
  const urlToken = String(formData.get("sale_prequal_url_token") ?? "").trim();
  if (!urlToken) {
    return { error: "Invalid link." };
  }

  const ctx = await getSalePropertyForPrequalToken(urlToken);
  if (!ctx) {
    return { error: "This link is not valid." };
  }
  if (ctx.listing_type !== "sale") {
    return { error: "Pre-viewing checks are only for properties for sale." };
  }

  const ip = await getRequestClientIp();
  const rl = await consumePrequalSubmitAttempt(ip, urlToken);
  if (!rl.ok) {
    return { error: rl.message };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const buyingPositionRaw = String(formData.get("buying_position") ?? "").trim();
  const fundingRaw = String(formData.get("funding_type") ?? "").trim();
  let dipRaw = String(formData.get("mortgage_dip_status") ?? "").trim();
  const solicitorRaw = String(formData.get("solicitor_status") ?? "").trim();
  const targetRaw = String(formData.get("target_purchase_band") ?? "").trim();
  const additionalNotes =
    String(formData.get("additional_notes") ?? "").trim().slice(0, 4000) || null;

  if (!name || name.length > 200) {
    return { error: "Please enter your name." };
  }
  if (!email) {
    return { error: "Please enter a valid email address." };
  }

  const buying_position = BUYING_POSITION.has(buyingPositionRaw) ? buyingPositionRaw : "";
  if (!buying_position) {
    return { error: "Please choose your buying position." };
  }

  const funding_type = FUNDING.has(fundingRaw) ? fundingRaw : "";
  if (!funding_type) {
    return { error: "Please choose how you will fund the purchase." };
  }

  if (funding_type === "cash") {
    dipRaw = "na";
  }
  const mortgage_dip_status = MORTGAGE_DIP.has(dipRaw) ? dipRaw : "";
  if (!mortgage_dip_status) {
    return { error: "Please say whether you have a mortgage Decision in Principle (DIP)." };
  }
  if (funding_type === "mortgage" && mortgage_dip_status === "na") {
    return { error: "Please choose a DIP status, or select cash buyer if you are not using a mortgage." };
  }

  const solicitor_status = SOLICITOR.has(solicitorRaw) ? solicitorRaw : "";
  if (!solicitor_status) {
    return { error: "Please choose a solicitor / conveyancer option." };
  }

  const target_purchase_band = TARGET_BAND.has(targetRaw) ? targetRaw : "";
  if (!target_purchase_band) {
    return { error: "Please choose your purchase timescale." };
  }

  const sql = getSql();

  try {
    await sql`
      INSERT INTO sale_prequal_submissions (
        property_id,
        name,
        email,
        phone,
        buying_position,
        funding_type,
        mortgage_dip_status,
        solicitor_status,
        target_purchase_band,
        additional_notes
      )
      VALUES (
        ${ctx.property_id},
        ${name},
        ${email},
        ${phone},
        ${buying_position},
        ${funding_type},
        ${mortgage_dip_status},
        ${solicitor_status},
        ${target_purchase_band},
        ${additionalNotes}
      )
      ON CONFLICT (property_id, email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        buying_position = EXCLUDED.buying_position,
        funding_type = EXCLUDED.funding_type,
        mortgage_dip_status = EXCLUDED.mortgage_dip_status,
        solicitor_status = EXCLUDED.solicitor_status,
        target_purchase_band = EXCLUDED.target_purchase_band,
        additional_notes = EXCLUDED.additional_notes,
        submitted_at = now()
    `;
  } catch {
    return { error: "Could not save. Please try again." };
  }

  redirect(`/prequal/sale/${encodeURIComponent(urlToken)}/submitted`);
}
