import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import {
  listPropertiesForCompany,
  type PropertyListFilters,
} from "@/lib/properties/queries";
import { buttonVariants } from "@/components/ui/button-variants";
import { PropertyStatusSelect } from "@/components/property-status-select";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { getAppBaseUrl } from "@/lib/env/app-url";
import { PropertiesListSearch } from "./properties-list-search";
import { PropertyListRowActions } from "./property-list-row-actions";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.companyId) {
    return null;
  }

  const sp = await searchParams;
  const raw = sp.listing?.toLowerCase();
  if (raw !== "sale" && raw !== "letting") {
    redirect("/properties?listing=sale");
  }
  const listing = raw as "sale" | "letting";

  const q = sp.q?.trim();
  const filters: PropertyListFilters | undefined = q ? { q } : undefined;

  const properties = await listPropertiesForCompany(session.user.companyId, listing, filters);
  const base = getAppBaseUrl().replace(/\/$/, "");

  const title = listing === "letting" ? "To let" : "For sale";
  const subtitle =
    listing === "letting"
      ? "Rental instructions and viewing pipeline"
      : "Sales instructions and viewing pipeline";

  return (
    <div className="px-3 py-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-6xl min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          </div>
          <Link
            href="/properties/new"
            data-tour="onboarding-add-property"
            className={cn(buttonVariants({ variant: "default", size: "default" }))}
          >
            + Add property
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Filter by street or postcode. Use <strong className="font-medium text-zinc-600 dark:text-zinc-400">Quick actions</strong>{" "}
              to schedule a viewing, open the property, or copy vendor / quick feedback / pre-viewing links — no need to
              open the property first.
            </p>
            <Suspense
              fallback={
                <div className="h-9 min-w-[10rem] max-w-[22rem] animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700" />
              }
            >
              <PropertiesListSearch listing={listing} />
            </Suspense>
          </div>
          {properties.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-zinc-600 dark:text-zinc-400">
              {q ? (
                <>
                  No properties match &ldquo;{q}&rdquo;. Try another address or postcode, or{" "}
                  <Link
                    href={`/properties?listing=${listing}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    clear search
                  </Link>
                  .
                </>
              ) : (
                <>
                  No {listing === "letting" ? "lettings" : "sales"} yet. Add an instruction to start
                  tracking viewings and feedback.
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto overscroll-x-contain touch-pan-x">
              <table className="w-full min-w-[56rem] text-left text-sm xl:min-w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                    <th className="px-3 py-3 sm:px-4">Address</th>
                    <th className="w-16 px-2 py-3 text-right tabular-nums sm:w-20 sm:px-4">Viewings</th>
                    <th className="w-16 px-2 py-3 text-right tabular-nums sm:w-20 sm:px-4">Feedback</th>
                    <th className="min-w-[10rem] px-3 py-3 sm:px-4">Status</th>
                    <th className="min-w-[14rem] px-3 py-3 sm:min-w-[16rem] sm:px-4">Quick actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {properties.map((p) => {
                    const vendorUrl = `${base}/vendor/${p.vendor_portal_token}`;
                    const quickFeedbackUrl = `${base}/feedback/quick/${p.buyer_qr_token}`;
                    const prequalUrl =
                      listing === "letting"
                        ? `${base}/prequal/${p.prequal_share_token}`
                        : `${base}/prequal/sale/${p.sale_prequal_share_token}`;
                    return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                    >
                      <td className="px-3 py-3 font-medium text-zinc-900 sm:px-4 dark:text-zinc-50">
                        <div className="flex items-start gap-3">
                          {p.hero_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.hero_image_url}
                              alt=""
                              className="mt-0.5 size-12 shrink-0 rounded-md border border-zinc-200 object-cover dark:border-zinc-700"
                            />
                          ) : (
                            <span
                              className="mt-0.5 size-12 shrink-0 rounded-md border border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
                              title="No listing photo yet"
                              aria-hidden
                            />
                          )}
                          <Link
                            href={`/properties/${p.id}`}
                            className="min-w-0 hover:underline"
                          >
                            {p.address}
                            <span className="mt-0.5 block text-xs font-normal text-zinc-500">
                              {p.postcode}
                            </span>
                          </Link>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right align-top tabular-nums text-zinc-700 sm:px-4 dark:text-zinc-300">
                        {p.viewing_count}
                      </td>
                      <td className="px-2 py-3 text-right align-top tabular-nums text-zinc-700 sm:px-4 dark:text-zinc-300">
                        {p.feedback_count}
                      </td>
                      <td className="px-3 py-3 align-top sm:px-4">
                        <PropertyStatusSelect
                          propertyId={p.id}
                          listingType={listing}
                          currentStatus={p.status}
                          selectClassName="max-w-[16rem]"
                        />
                      </td>
                      <td className="px-3 py-3 align-top sm:px-4">
                        <PropertyListRowActions
                          propertyId={p.id}
                          vendorUrl={vendorUrl}
                          quickFeedbackUrl={quickFeedbackUrl}
                          prequalUrl={prequalUrl}
                        />
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
