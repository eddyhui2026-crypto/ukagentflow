import { auth } from "@/auth";
import { MarketingOutreachForm } from "@/app/(app)/internal/marketing-outreach/marketing-outreach-form";
import { getInternalMarketingFrom } from "@/lib/email/internal-marketing-send";
import { isInternalMarketingOutreachAllowed } from "@/lib/internal/marketing-outreach-allowlist";
import { notFound } from "next/navigation";

export default async function InternalMarketingOutreachPage() {
  const session = await auth();
  if (!isInternalMarketingOutreachAllowed(session?.user?.email)) {
    notFound();
  }

  const { usingTransactionalFallback } = getInternalMarketingFrom();

  return (
    <div className="px-3 py-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Internal marketing outreach
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Send up to 10 personalised messages via Resend. Access is restricted to emails listed in{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">INTERNAL_MARKETING_OUTREACH_EMAILS</code>
          .
        </p>
        <MarketingOutreachForm warnSharedFrom={usingTransactionalFallback} />
      </div>
    </div>
  );
}
