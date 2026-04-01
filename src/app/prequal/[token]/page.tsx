import { ClosePublicFormButton } from "@/components/close-public-form-button";
import { getLettingPrequalSettingsForCompany } from "@/lib/companies/queries";
import { getLettingPropertyForPrequalToken } from "@/lib/lettings/prequal-queries";
import { LettingPrequalForm } from "./prequal-form";

export default async function PrequalEntryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw ?? "").trim();

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Invalid link.</p>
      </div>
    );
  }

  const ctx = await getLettingPropertyForPrequalToken(token);
  if (!ctx || ctx.listing_type !== "letting") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <main className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Link not found</h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            This pre-viewing link may be wrong, or the listing is not available for rent here.
          </p>
          <ClosePublicFormButton />
        </main>
      </div>
    );
  }

  const settings = await getLettingPrequalSettingsForCompany(ctx.company_id);
  const pageCopy = settings.page;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-zinc-50 px-4 py-10 dark:from-zinc-950 dark:to-zinc-950">
      <main className="mx-auto w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {pageCopy.pageTitle}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{pageCopy.pageSubtitle}</p>
        {pageCopy.intro ? (
          <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm whitespace-pre-wrap text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            {pageCopy.intro}
          </div>
        ) : null}
        <div className="mt-6">
          <LettingPrequalForm
            token={token}
            address={ctx.address}
            postcode={ctx.postcode}
            labels={settings.labels}
          />
        </div>
      </main>
    </div>
  );
}
