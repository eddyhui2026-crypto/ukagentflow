import { notFound } from "next/navigation";
import {
  getVendorPortalProperty,
  listVendorPortalFeedback,
} from "@/lib/vendor/portal-queries";
import {
  formatBuyerPosition,
  formatHasAip,
  highlightsToDisplayString,
  negativesToDisplayString,
} from "@/lib/feedback/extended-fields";
import { formatPriceOpinionVendor } from "@/lib/feedback/price-labels";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  return {
    title: "Property feedback",
    robots: { index: false, follow: false },
  };
}

function formatViewDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatInterest(label: string) {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function replyLagLabel(days: number) {
  if (days <= 0) return "Same day";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export default async function VendorPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw ?? "").trim();
  if (!token) {
    notFound();
  }

  const prop = await getVendorPortalProperty(token);
  if (!prop) {
    notFound();
  }

  const rows = await listVendorPortalFeedback(token);
  const line = `${prop.address}, ${prop.postcode}`;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Vendor snapshot</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{line}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Buyer names are not shown here. Your agent may share fuller detail separately. This page is a
            read-only summary of feedback your agent collects after viewings.
          </p>
        </header>

        {rows.length === 0 ? (
          <div className="mt-12 rounded-lg border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No buyer feedback recorded yet. Check back after viewings — your agent will send links or
              QR codes to viewers.
            </p>
          </div>
        ) : (
          <div className="mt-10 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                    <th className="px-3 py-3">Viewing</th>
                    <th className="px-3 py-3">Submitted</th>
                    <th className="px-3 py-3">Lag</th>
                    <th className="px-3 py-3 text-right">Rating</th>
                    <th className="px-3 py-3">Interest</th>
                    <th className="px-3 py-3">Price view</th>
                    <th className="px-3 py-3">2nd</th>
                    <th className="hidden px-3 py-3 lg:table-cell">Position</th>
                    <th className="hidden px-3 py-3 lg:table-cell">AIP</th>
                    <th className="hidden px-3 py-3 xl:table-cell">Highlights</th>
                    <th className="hidden px-3 py-3 xl:table-cell">Concerns</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {rows.map((row) => (
                    <tr key={row.id} className="align-top hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {formatViewDate(row.viewing_date)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {formatDateTime(row.submitted_at)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-700 dark:text-zinc-300">
                        {replyLagLabel(row.reply_lag_days)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                        {row.rating}/5
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                            row.interest_level === "hot" &&
                              "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
                            row.interest_level === "warm" &&
                              "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
                            row.interest_level === "cold" &&
                              "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                          )}
                        >
                          {formatInterest(row.interest_level)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {formatPriceOpinionVendor(row.price_opinion)}
                      </td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {row.wants_second_viewing ? "Yes" : "No"}
                      </td>
                      <td className="hidden max-w-[6rem] px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400 lg:table-cell">
                        {formatBuyerPosition(row.buyer_position)}
                      </td>
                      <td className="hidden px-3 py-3 text-zinc-600 dark:text-zinc-400 lg:table-cell">
                        {formatHasAip(row.has_aip)}
                      </td>
                      <td className="hidden max-w-[10rem] px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400 xl:table-cell">
                        {highlightsToDisplayString(row.property_highlights)}
                      </td>
                      <td className="hidden max-w-[10rem] px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400 xl:table-cell">
                        {negativesToDisplayString(row.negative_feedback_tags)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
