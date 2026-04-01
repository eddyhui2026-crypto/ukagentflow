"use server";

import { getSql } from "@/lib/db/neon";
import { getLettingPropertyForPrequalToken } from "@/lib/lettings/prequal-queries";
import { consumePrequalSubmitAttempt } from "@/lib/lettings/prequal-submit-rate";
import { getRequestClientIp } from "@/lib/http/client-ip";
import { redirect } from "next/navigation";

export type PrequalFormState = { error?: string } | undefined;

const INCOME = new Set(["25k_plus", "35k_plus", "50k_plus", "unspecified"]);

function normalizeEmail(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (!s || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return null;
  return s;
}

function parseOptionalDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
}

export async function submitLettingPrequalAction(
  _prev: PrequalFormState,
  formData: FormData,
): Promise<PrequalFormState> {
  const urlToken = String(formData.get("prequal_url_token") ?? "").trim();
  if (!urlToken) {
    return { error: "Invalid link." };
  }

  const ctx = await getLettingPropertyForPrequalToken(urlToken);
  if (!ctx) {
    return { error: "This link is not valid." };
  }
  if (ctx.listing_type !== "letting") {
    return { error: "Pre-viewing qualification is only for rental listings." };
  }

  const ip = await getRequestClientIp();
  const rl = await consumePrequalSubmitAttempt(ip, urlToken);
  if (!rl.ok) {
    return { error: rl.message };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const occupation = String(formData.get("occupation") ?? "").trim() || null;
  const incomeRaw = String(formData.get("annual_income_band") ?? "").trim();
  const visa = String(formData.get("visa_immigration_status") ?? "").trim() || null;

  if (!name || name.length > 200) {
    return { error: "Please enter your name." };
  }
  if (!email) {
    return { error: "Please enter a valid email address." };
  }

  const annual_income_band = INCOME.has(incomeRaw) ? incomeRaw : "";
  if (!annual_income_band) {
    return { error: "Please choose an income band or “Prefer not to say”." };
  }

  const petsRaw = String(formData.get("has_pets") ?? "unspecified").trim();
  let hasPets: boolean | null = null;
  if (petsRaw === "yes") hasPets = true;
  else if (petsRaw === "no") hasPets = false;
  else if (petsRaw === "unspecified") hasPets = null;
  else {
    return { error: "Please choose a pets option." };
  }
  const petsDetail =
    hasPets === true ? String(formData.get("pets_detail") ?? "").trim().slice(0, 500) || null : null;

  const moveInRaw = String(formData.get("target_move_in_date") ?? "");
  const target_move_in_date = parseOptionalDate(moveInRaw);
  if (moveInRaw.trim() && !target_move_in_date) {
    return { error: "Please enter a valid move-in date or leave it blank." };
  }

  const sql = getSql();

  try {
    await sql`
      INSERT INTO letting_prequal_submissions (
        property_id,
        name,
        email,
        phone,
        occupation,
        annual_income_band,
        has_pets,
        pets_detail,
        target_move_in_date,
        visa_immigration_status
      )
      VALUES (
        ${ctx.property_id},
        ${name},
        ${email},
        ${phone},
        ${occupation},
        ${annual_income_band},
        ${hasPets},
        ${petsDetail},
        ${target_move_in_date},
        ${visa}
      )
      ON CONFLICT (property_id, email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        occupation = EXCLUDED.occupation,
        annual_income_band = EXCLUDED.annual_income_band,
        has_pets = EXCLUDED.has_pets,
        pets_detail = EXCLUDED.pets_detail,
        target_move_in_date = EXCLUDED.target_move_in_date,
        visa_immigration_status = EXCLUDED.visa_immigration_status,
        submitted_at = now()
    `;
  } catch {
    return { error: "Could not save. Please try again." };
  }

  redirect(`/prequal/${encodeURIComponent(urlToken)}/submitted`);
}
