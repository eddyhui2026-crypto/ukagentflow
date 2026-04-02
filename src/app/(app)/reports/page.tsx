import { auth } from "@/auth";
import { listPropertiesForCompany } from "@/lib/properties/queries";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

function defaultToDate() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function defaultFromDate() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 30);
  return d.toISOString().slice(0, 10);
}

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.companyId) {
    return null;
  }

  const properties = await listPropertiesForCompany(session.user.companyId);

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Reports</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Export buyer feedback as CSV. Filters are optional; leave dates empty for all time (may
          be large).
        </p>

        <form
          method="GET"
          action="/api/reports/feedback"
          data-tour="onboarding-reports-form"
          className="mt-8 space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="space-y-1.5">
            <label htmlFor="propertyId" className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Property (optional)
            </label>
            <select
              id="propertyId"
              name="propertyId"
              className="w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              defaultValue=""
            >
              <option value="">All properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address}, {p.postcode} ({p.feedback_count} feedback)
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="from" className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                From date (optional)
              </label>
              <input
                id="from"
                name="from"
                type="date"
                defaultValue={defaultFromDate()}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Submitted at ≥ start of this day (UTC calendar date).
              </p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="to" className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                To date (optional)
              </label>
              <input
                id="to"
                name="to"
                type="date"
                defaultValue={defaultToDate()}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Inclusive end day (UTC calendar date).
              </p>
            </div>
          </div>

          <div className="rounded-md border border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-800 dark:text-zinc-200">
              <input
                type="checkbox"
                name="vendorExport"
                value="1"
                className="mt-1 rounded border-zinc-400 text-blue-600"
              />
              <span>
                <span className="font-medium">Export for vendor (anonymised)</span>
                <span className="mt-1 block text-xs font-normal text-zinc-600 dark:text-zinc-400">
                  Replaces buyer names with a neutral initial (e.g. Buyer&nbsp;S.) and clears email
                  for GDPR-friendly packs. Narrative fields are still included — remove columns in
                  Excel if you need a stricter pack.
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button type="submit" className={cn(buttonVariants({ variant: "default" }))}>
              Download CSV
            </button>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Includes <code className="rounded bg-zinc-200 px-1 text-[10px] dark:bg-zinc-800">price_feedback</code>{" "}
              labels (Too expensive / Fair price / Good value) plus a coded column for pivot tables.
            </span>
          </div>
        </form>

        <p className="mt-8 text-xs text-zinc-500 dark:text-zinc-400">
          Columns include viewing date, reply lag (days), price codes + vendor-facing price text,
          buyer position, AIP, highlight/concern tags, agent status, ratings, interest, second
          viewing, and free-text fields.
        </p>
      </div>
    </div>
  );
}
