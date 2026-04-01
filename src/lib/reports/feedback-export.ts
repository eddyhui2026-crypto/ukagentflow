import { getSql } from "@/lib/db/neon";
import {
  highlightsToDisplayString,
  negativesToDisplayString,
} from "@/lib/feedback/extended-fields";
import {
  lettingsHighlightsToDisplayString,
  lettingsNegativesToDisplayString,
} from "@/lib/feedback/lettings-extended-fields";
import { formatPriceOpinionVendor } from "@/lib/feedback/price-labels";
import { anonymiseBuyerNameForVendor } from "@/lib/privacy/anonymise-buyer";
import { AGENT_FOLLOW_UP_LABELS, type AgentFollowUp } from "@/lib/feedback/agent-follow-up";

export type FeedbackExportRow = {
  submitted_at: Date | string;
  property_address: string;
  property_postcode: string;
  viewing_date: string;
  buyer_name: string;
  buyer_email: string;
  listing_type: string;
  rating: number;
  interest_level: string;
  price_opinion: string;
  liked_text: string | null;
  disliked_text: string | null;
  wants_second_viewing: boolean;
  comment: string | null;
  reply_lag_days: number;
  agent_follow_up: string;
  buyer_position: string | null;
  has_aip: boolean | null;
  property_highlights: string;
  negative_feedback_tags: string;
  target_move_in_date: string | null;
  occupant_count: string | null;
  has_pets: boolean | null;
  pets_detail: string | null;
  household_income_band: string | null;
};

export type FeedbackExportFilters = {
  propertyId: string | null;
  from: string | null;
  to: string | null;
  vendorAnonymised: boolean;
};

/** propertyId, from, to: optional; validate before call (uuid / YYYY-MM-DD). */
export async function listFeedbackForCsvExport(
  companyId: string,
  filters: FeedbackExportFilters,
): Promise<FeedbackExportRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      f.submitted_at,
      p.address AS property_address,
      p.postcode AS property_postcode,
      v.viewing_date::text AS viewing_date,
      b.name AS buyer_name,
      b.email AS buyer_email,
      f.listing_type::text AS listing_type,
      f.rating,
      f.interest_level::text AS interest_level,
      f.price_opinion::text AS price_opinion,
      f.liked_text,
      f.disliked_text,
      f.wants_second_viewing,
      f.comment,
      GREATEST(
        0,
        (
          (f.submitted_at AT TIME ZONE 'Europe/London')::date - v.viewing_date
        )::integer
      ) AS reply_lag_days,
      f.agent_follow_up::text AS agent_follow_up,
      f.buyer_position::text AS buyer_position,
      f.has_aip,
      f.property_highlights,
      f.negative_feedback_tags,
      f.target_move_in_date::text AS target_move_in_date,
      f.occupant_count,
      f.has_pets,
      f.pets_detail,
      f.household_income_band
    FROM feedback f
    INNER JOIN viewings v ON v.id = f.viewing_id
    INNER JOIN properties p ON p.id = v.property_id
    INNER JOIN buyers b ON b.id = f.buyer_id
    WHERE p.company_id = ${companyId}
      AND (${filters.propertyId}::uuid IS NULL OR p.id = ${filters.propertyId}::uuid)
      AND (
        ${filters.from}::date IS NULL
        OR f.submitted_at >= ${filters.from}::date
      )
      AND (
        ${filters.to}::date IS NULL
        OR f.submitted_at < (${filters.to}::date + interval '1 day')
      )
    ORDER BY f.submitted_at DESC
  `;
  return rows as FeedbackExportRow[];
}

function csvEscape(value: unknown): string {
  if (value == null || value === "") return "";
  const s = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function agentFollowUpLabel(s: string): string {
  const k = s as AgentFollowUp;
  return AGENT_FOLLOW_UP_LABELS[k] ?? s;
}

type CsvColumn = {
  header: string;
  get: (row: FeedbackExportRow, vendorAnonymised: boolean) => unknown;
};

const CSV_COLUMNS: CsvColumn[] = [
  { header: "submitted_at", get: (r) => r.submitted_at },
  { header: "viewing_date", get: (r) => r.viewing_date },
  { header: "reply_lag_days", get: (r) => r.reply_lag_days },
  { header: "property_address", get: (r) => r.property_address },
  { header: "property_postcode", get: (r) => r.property_postcode },
  {
    header: "buyer_name",
    get: (r, v) => (v ? anonymiseBuyerNameForVendor(r.buyer_name) : r.buyer_name),
  },
  {
    header: "buyer_email",
    get: (r, v) => (v ? "" : r.buyer_email),
  },
  { header: "listing_type", get: (r) => r.listing_type },
  { header: "rating", get: (r) => r.rating },
  { header: "interest_level", get: (r) => r.interest_level },
  { header: "price_opinion_code", get: (r) => r.price_opinion },
  { header: "price_feedback", get: (r) => formatPriceOpinionVendor(r.price_opinion) },
  { header: "wants_second_viewing", get: (r) => r.wants_second_viewing },
  { header: "agent_status", get: (r) => agentFollowUpLabel(r.agent_follow_up) },
  { header: "buyer_position", get: (r) => r.buyer_position ?? "" },
  {
    header: "has_aip",
    get: (r) =>
      r.has_aip === true ? "yes" : r.has_aip === false ? "no" : "",
  },
  {
    header: "property_highlights",
    get: (r) => {
      const s =
        r.listing_type === "letting"
          ? lettingsHighlightsToDisplayString(r.property_highlights)
          : highlightsToDisplayString(r.property_highlights);
      return s === "—" ? "" : s;
    },
  },
  {
    header: "negative_feedback",
    get: (r) => {
      const s =
        r.listing_type === "letting"
          ? lettingsNegativesToDisplayString(r.negative_feedback_tags)
          : negativesToDisplayString(r.negative_feedback_tags);
      return s === "—" ? "" : s;
    },
  },
  { header: "liked_text", get: (r) => r.liked_text },
  { header: "disliked_text", get: (r) => r.disliked_text },
  { header: "comment", get: (r) => r.comment },
  { header: "target_move_in_date", get: (r) => r.target_move_in_date ?? "" },
  { header: "occupant_count", get: (r) => r.occupant_count ?? "" },
  {
    header: "has_pets",
    get: (r) =>
      r.has_pets === true ? "yes" : r.has_pets === false ? "no" : "",
  },
  { header: "pets_detail", get: (r) => r.pets_detail ?? "" },
  { header: "household_income_band", get: (r) => r.household_income_band ?? "" },
];

export function buildFeedbackCsv(
  rows: FeedbackExportRow[],
  options?: { vendorAnonymised?: boolean },
): string {
  const vendorAnonymised = options?.vendorAnonymised ?? false;
  const headerLine = CSV_COLUMNS.map((c) => c.header).join(",");
  const dataLines = rows.map((row) =>
    CSV_COLUMNS.map((c) => {
      let v: unknown = c.get(row, vendorAnonymised);
      if (c.header === "submitted_at" && v != null) {
        v =
          v instanceof Date
            ? v.toISOString()
            : typeof v === "string"
              ? v
              : String(v);
      }
      if (typeof v === "boolean") v = v ? "true" : "false";
      return csvEscape(v);
    }).join(","),
  );
  return "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
}

export function parseExportFilters(searchParams: URLSearchParams): FeedbackExportFilters {
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;

  const rawProp = searchParams.get("propertyId")?.trim() ?? "";
  const propertyId = uuidRe.test(rawProp) ? rawProp : null;

  const rawFrom = searchParams.get("from")?.trim() ?? "";
  const from = dateRe.test(rawFrom) ? rawFrom : null;

  const rawTo = searchParams.get("to")?.trim() ?? "";
  const to = dateRe.test(rawTo) ? rawTo : null;

  const vendorAnonymised =
    searchParams.get("vendorExport") === "1" ||
    searchParams.get("anonymised") === "1";

  return { propertyId, from, to, vendorAnonymised };
}
