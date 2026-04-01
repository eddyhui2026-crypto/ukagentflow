import { getSql } from "@/lib/db/neon";
import type { AgentFollowUp } from "@/lib/feedback/agent-follow-up";

export type DashboardListingStats = {
  property_count: number;
  viewing_count: number;
  feedback_count: number;
  prequal_count: number;
  hot_leads_count: number;
};

export type DashboardStatsSplit = {
  sale: DashboardListingStats;
  letting: DashboardListingStats;
};

export async function getDashboardStatsSplit(companyId: string): Promise<DashboardStatsSplit> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      (
        SELECT COUNT(*)::int
        FROM properties p
        WHERE p.company_id = ${companyId} AND p.listing_type = 'sale'::listing_type
      ) AS sale_property_count,
      (
        SELECT COUNT(*)::int
        FROM viewings v
        INNER JOIN properties p ON p.id = v.property_id
        WHERE p.company_id = ${companyId} AND p.listing_type = 'sale'::listing_type
      ) AS sale_viewing_count,
      (
        SELECT COUNT(*)::int
        FROM feedback f
        INNER JOIN viewings v ON v.id = f.viewing_id
        INNER JOIN properties p ON p.id = v.property_id
        WHERE p.company_id = ${companyId} AND p.listing_type = 'sale'::listing_type
      ) AS sale_feedback_count,
      (
        SELECT COUNT(*)::int
        FROM sale_prequal_submissions s
        INNER JOIN properties p ON p.id = s.property_id
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'sale'::listing_type
          AND p.status NOT IN ('sold', 'let', 'withdrawn')
      ) AS sale_prequal_count,
      (
        SELECT COUNT(DISTINCT f.buyer_id)::int
        FROM feedback f
        INNER JOIN viewings v ON v.id = f.viewing_id
        INNER JOIN properties p ON p.id = v.property_id
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'sale'::listing_type
          AND f.interest_level = 'hot'
      ) AS sale_hot_leads_count,
      (
        SELECT COUNT(*)::int
        FROM properties p
        WHERE p.company_id = ${companyId} AND p.listing_type = 'letting'::listing_type
      ) AS letting_property_count,
      (
        SELECT COUNT(*)::int
        FROM viewings v
        INNER JOIN properties p ON p.id = v.property_id
        WHERE p.company_id = ${companyId} AND p.listing_type = 'letting'::listing_type
      ) AS letting_viewing_count,
      (
        SELECT COUNT(*)::int
        FROM feedback f
        INNER JOIN viewings v ON v.id = f.viewing_id
        INNER JOIN properties p ON p.id = v.property_id
        WHERE p.company_id = ${companyId} AND p.listing_type = 'letting'::listing_type
      ) AS letting_feedback_count,
      (
        SELECT COUNT(*)::int
        FROM letting_prequal_submissions s
        INNER JOIN properties p ON p.id = s.property_id
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'letting'::listing_type
          AND p.status NOT IN ('sold', 'let', 'withdrawn')
      ) AS letting_prequal_count,
      (
        SELECT COUNT(DISTINCT f.buyer_id)::int
        FROM feedback f
        INNER JOIN viewings v ON v.id = f.viewing_id
        INNER JOIN properties p ON p.id = v.property_id
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'letting'::listing_type
          AND f.interest_level = 'hot'
      ) AS letting_hot_leads_count
  `;
  const r = rows[0] as {
    sale_property_count: number;
    sale_viewing_count: number;
    sale_feedback_count: number;
    sale_prequal_count: number;
    sale_hot_leads_count: number;
    letting_property_count: number;
    letting_viewing_count: number;
    letting_feedback_count: number;
    letting_prequal_count: number;
    letting_hot_leads_count: number;
  };
  return {
    sale: {
      property_count: r.sale_property_count,
      viewing_count: r.sale_viewing_count,
      feedback_count: r.sale_feedback_count,
      prequal_count: r.sale_prequal_count,
      hot_leads_count: r.sale_hot_leads_count,
    },
    letting: {
      property_count: r.letting_property_count,
      viewing_count: r.letting_viewing_count,
      feedback_count: r.letting_feedback_count,
      prequal_count: r.letting_prequal_count,
      hot_leads_count: r.letting_hot_leads_count,
    },
  };
}

/**
 * Same shape as {@link getDashboardStatsSplit}, but only rows whose activity falls in the current
 * UK week: Monday 00:00 Europe/London through now (ISO week boundary).
 */
export async function getDashboardWeekStatsSplit(companyId: string): Promise<DashboardStatsSplit> {
  const sql = getSql();
  const rows = await sql`
    WITH week_start AS (
      SELECT (date_trunc('week', timezone('Europe/London', now())) AT TIME ZONE 'Europe/London') AS ts
    )
    SELECT
      (
        SELECT COUNT(*)::int
        FROM properties p
        CROSS JOIN week_start ws
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'sale'::listing_type
          AND p.created_at >= ws.ts
      ) AS sale_property_count,
      (
        SELECT COUNT(*)::int
        FROM viewings v
        INNER JOIN properties p ON p.id = v.property_id
        CROSS JOIN week_start ws
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'sale'::listing_type
          AND v.viewing_date >= (ws.ts AT TIME ZONE 'Europe/London')::date
      ) AS sale_viewing_count,
      (
        SELECT COUNT(*)::int
        FROM feedback f
        INNER JOIN viewings v ON v.id = f.viewing_id
        INNER JOIN properties p ON p.id = v.property_id
        CROSS JOIN week_start ws
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'sale'::listing_type
          AND f.submitted_at >= ws.ts
      ) AS sale_feedback_count,
      (
        SELECT COUNT(*)::int
        FROM sale_prequal_submissions s
        INNER JOIN properties p ON p.id = s.property_id
        CROSS JOIN week_start ws
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'sale'::listing_type
          AND p.status NOT IN ('sold', 'let', 'withdrawn')
          AND s.submitted_at >= ws.ts
      ) AS sale_prequal_count,
      (
        SELECT COUNT(DISTINCT f.buyer_id)::int
        FROM feedback f
        INNER JOIN viewings v ON v.id = f.viewing_id
        INNER JOIN properties p ON p.id = v.property_id
        CROSS JOIN week_start ws
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'sale'::listing_type
          AND f.interest_level = 'hot'
          AND f.submitted_at >= ws.ts
      ) AS sale_hot_leads_count,
      (
        SELECT COUNT(*)::int
        FROM properties p
        CROSS JOIN week_start ws
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'letting'::listing_type
          AND p.created_at >= ws.ts
      ) AS letting_property_count,
      (
        SELECT COUNT(*)::int
        FROM viewings v
        INNER JOIN properties p ON p.id = v.property_id
        CROSS JOIN week_start ws
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'letting'::listing_type
          AND v.viewing_date >= (ws.ts AT TIME ZONE 'Europe/London')::date
      ) AS letting_viewing_count,
      (
        SELECT COUNT(*)::int
        FROM feedback f
        INNER JOIN viewings v ON v.id = f.viewing_id
        INNER JOIN properties p ON p.id = v.property_id
        CROSS JOIN week_start ws
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'letting'::listing_type
          AND f.submitted_at >= ws.ts
      ) AS letting_feedback_count,
      (
        SELECT COUNT(*)::int
        FROM letting_prequal_submissions s
        INNER JOIN properties p ON p.id = s.property_id
        CROSS JOIN week_start ws
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'letting'::listing_type
          AND p.status NOT IN ('sold', 'let', 'withdrawn')
          AND s.submitted_at >= ws.ts
      ) AS letting_prequal_count,
      (
        SELECT COUNT(DISTINCT f.buyer_id)::int
        FROM feedback f
        INNER JOIN viewings v ON v.id = f.viewing_id
        INNER JOIN properties p ON p.id = v.property_id
        CROSS JOIN week_start ws
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'letting'::listing_type
          AND f.interest_level = 'hot'
          AND f.submitted_at >= ws.ts
      ) AS letting_hot_leads_count
  `;
  const r = rows[0] as {
    sale_property_count: number;
    sale_viewing_count: number;
    sale_feedback_count: number;
    sale_prequal_count: number;
    sale_hot_leads_count: number;
    letting_property_count: number;
    letting_viewing_count: number;
    letting_feedback_count: number;
    letting_prequal_count: number;
    letting_hot_leads_count: number;
  };
  return {
    sale: {
      property_count: r.sale_property_count,
      viewing_count: r.sale_viewing_count,
      feedback_count: r.sale_feedback_count,
      prequal_count: r.sale_prequal_count,
      hot_leads_count: r.sale_hot_leads_count,
    },
    letting: {
      property_count: r.letting_property_count,
      viewing_count: r.letting_viewing_count,
      feedback_count: r.letting_feedback_count,
      prequal_count: r.letting_prequal_count,
      hot_leads_count: r.letting_hot_leads_count,
    },
  };
}

export type RecentFeedbackRow = {
  id: string;
  property_id: string;
  property_address: string;
  property_postcode: string;
  property_hero_image_url: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  rating: number;
  interest_level: string;
  price_opinion: string;
  wants_second_viewing: boolean;
  viewing_date: string;
  submitted_at: Date | string;
  reply_lag_days: number;
  agent_follow_up: AgentFollowUp;
  /** Submitted within the dashboard rolling recent window (e.g. last 24h). */
  is_new_within_24h?: boolean;
};

export type FeedbackNewSinceLoginCounts = { sale: number; letting: number };

/** Feedback submissions after `since` on live instructions (same archive rules as recent lists). */
export async function countFeedbackSinceForCompany(
  companyId: string,
  since: Date,
): Promise<FeedbackNewSinceLoginCounts> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      (
        SELECT COUNT(*)::int
        FROM feedback f
        INNER JOIN viewings v ON v.id = f.viewing_id
        INNER JOIN properties p ON p.id = v.property_id
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'sale'::listing_type
          AND p.status NOT IN ('sold', 'let', 'withdrawn')
          AND f.submitted_at > ${since}
      ) AS sale,
      (
        SELECT COUNT(*)::int
        FROM feedback f
        INNER JOIN viewings v ON v.id = f.viewing_id
        INNER JOIN properties p ON p.id = v.property_id
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'letting'::listing_type
          AND p.status NOT IN ('sold', 'let', 'withdrawn')
          AND f.submitted_at > ${since}
      ) AS letting
  `;
  const r = rows[0] as { sale: number; letting: number };
  return { sale: r.sale, letting: r.letting };
}

/** Pre-viewing submissions after `since` on live instructions (same archive rules as recent lists). */
export async function countPrequalSinceForCompany(
  companyId: string,
  since: Date,
): Promise<FeedbackNewSinceLoginCounts> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      (
        SELECT COUNT(*)::int
        FROM sale_prequal_submissions s
        INNER JOIN properties p ON p.id = s.property_id
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'sale'::listing_type
          AND p.status NOT IN ('sold', 'let', 'withdrawn')
          AND s.submitted_at > ${since}
      ) AS sale,
      (
        SELECT COUNT(*)::int
        FROM letting_prequal_submissions s
        INNER JOIN properties p ON p.id = s.property_id
        WHERE p.company_id = ${companyId}
          AND p.listing_type = 'letting'::listing_type
          AND p.status NOT IN ('sold', 'let', 'withdrawn')
          AND s.submitted_at > ${since}
      ) AS letting
  `;
  const r = rows[0] as { sale: number; letting: number };
  return { sale: r.sale, letting: r.letting };
}

export type RecentFeedbackListFilters = {
  /** Case-insensitive match on address, postcode, and person name / email / phone (feedback buyer or pre-viewing submitter) */
  q?: string;
};

export async function listRecentFeedbackForCompany(
  companyId: string,
  listing: "sale" | "letting",
  limit = 35,
  filters?: RecentFeedbackListFilters,
): Promise<RecentFeedbackRow[]> {
  const sql = getSql();
  const listingFilter =
    listing === "sale"
      ? sql`AND p.listing_type = 'sale'::listing_type`
      : sql`AND p.listing_type = 'letting'::listing_type`;

  const qRaw = filters?.q?.trim();
  const qFilter = qRaw
    ? sql`AND (
      p.address ILIKE ${"%" + qRaw + "%"}
      OR p.postcode ILIKE ${"%" + qRaw + "%"}
      OR b.name ILIKE ${"%" + qRaw + "%"}
      OR b.email ILIKE ${"%" + qRaw + "%"}
      OR COALESCE(b.phone, '') ILIKE ${"%" + qRaw + "%"}
    )`
    : sql``;

  /** Keep in sync with PROPERTY_STATUSES_ARCHIVED_ON_DASHBOARD in lib/properties/status.ts */
  const dashboardLiveFilter = sql`AND p.status NOT IN ('sold', 'let', 'withdrawn')`;

  const rows = await sql`
    SELECT
      f.id,
      p.id AS property_id,
      p.address AS property_address,
      p.postcode AS property_postcode,
      p.hero_image_url AS property_hero_image_url,
      b.name AS buyer_name,
      b.email AS buyer_email,
      b.phone AS buyer_phone,
      f.rating,
      f.interest_level::text AS interest_level,
      f.price_opinion::text AS price_opinion,
      f.wants_second_viewing,
      v.viewing_date::text AS viewing_date,
      f.submitted_at,
      GREATEST(
        0,
        (
          (f.submitted_at AT TIME ZONE 'Europe/London')::date - v.viewing_date
        )::integer
      ) AS reply_lag_days,
      f.agent_follow_up::text AS agent_follow_up
    FROM feedback f
    INNER JOIN viewings v ON v.id = f.viewing_id
    INNER JOIN properties p ON p.id = v.property_id
    INNER JOIN buyers b ON b.id = f.buyer_id
    WHERE p.company_id = ${companyId}
    ${listingFilter}
    ${qFilter}
    ${dashboardLiveFilter}
    ORDER BY (f.interest_level = 'hot') DESC, f.submitted_at DESC
    LIMIT ${limit}
  `;
  return rows as RecentFeedbackRow[];
}

export type RecentSalePrequalDashboardRow = {
  id: string;
  property_id: string;
  property_address: string;
  property_postcode: string;
  property_hero_image_url: string | null;
  name: string;
  email: string;
  phone: string | null;
  buying_position: string;
  funding_type: string;
  submitted_at: Date | string;
  is_new_within_24h?: boolean;
};

export type RecentLettingPrequalDashboardRow = {
  id: string;
  property_id: string;
  property_address: string;
  property_postcode: string;
  property_hero_image_url: string | null;
  name: string;
  email: string;
  phone: string | null;
  annual_income_band: string;
  has_pets: boolean | null;
  submitted_at: Date | string;
  is_new_within_24h?: boolean;
};

export async function listRecentSalePrequalForCompany(
  companyId: string,
  limit = 35,
  filters?: RecentFeedbackListFilters,
): Promise<RecentSalePrequalDashboardRow[]> {
  const sql = getSql();
  const qRaw = filters?.q?.trim();
  const qFilter = qRaw
    ? sql`AND (
      p.address ILIKE ${"%" + qRaw + "%"}
      OR p.postcode ILIKE ${"%" + qRaw + "%"}
      OR s.name ILIKE ${"%" + qRaw + "%"}
      OR s.email ILIKE ${"%" + qRaw + "%"}
      OR COALESCE(s.phone, '') ILIKE ${"%" + qRaw + "%"}
    )`
    : sql``;
  const dashboardLiveFilter = sql`AND p.status NOT IN ('sold', 'let', 'withdrawn')`;
  const rows = await sql`
    SELECT
      s.id,
      p.id AS property_id,
      p.address AS property_address,
      p.postcode AS property_postcode,
      p.hero_image_url AS property_hero_image_url,
      s.name,
      s.email,
      s.phone,
      s.buying_position,
      s.funding_type,
      s.submitted_at
    FROM sale_prequal_submissions s
    INNER JOIN properties p ON p.id = s.property_id
    WHERE p.company_id = ${companyId}
      AND p.listing_type = 'sale'::listing_type
    ${dashboardLiveFilter}
    ${qFilter}
    ORDER BY s.submitted_at DESC
    LIMIT ${limit}
  `;
  return rows as RecentSalePrequalDashboardRow[];
}

export async function listRecentLettingPrequalForCompany(
  companyId: string,
  limit = 35,
  filters?: RecentFeedbackListFilters,
): Promise<RecentLettingPrequalDashboardRow[]> {
  const sql = getSql();
  const qRaw = filters?.q?.trim();
  const qFilter = qRaw
    ? sql`AND (
      p.address ILIKE ${"%" + qRaw + "%"}
      OR p.postcode ILIKE ${"%" + qRaw + "%"}
      OR s.name ILIKE ${"%" + qRaw + "%"}
      OR s.email ILIKE ${"%" + qRaw + "%"}
      OR COALESCE(s.phone, '') ILIKE ${"%" + qRaw + "%"}
    )`
    : sql``;
  const dashboardLiveFilter = sql`AND p.status NOT IN ('sold', 'let', 'withdrawn')`;
  const rows = await sql`
    SELECT
      s.id,
      p.id AS property_id,
      p.address AS property_address,
      p.postcode AS property_postcode,
      p.hero_image_url AS property_hero_image_url,
      s.name,
      s.email,
      s.phone,
      s.annual_income_band,
      s.has_pets,
      s.submitted_at
    FROM letting_prequal_submissions s
    INNER JOIN properties p ON p.id = s.property_id
    WHERE p.company_id = ${companyId}
      AND p.listing_type = 'letting'::listing_type
    ${dashboardLiveFilter}
    ${qFilter}
    ORDER BY s.submitted_at DESC
    LIMIT ${limit}
  `;
  return rows as RecentLettingPrequalDashboardRow[];
}