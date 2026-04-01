import { ClosePublicFormButton } from "@/components/close-public-form-button";
import { getSalePropertyForPrequalToken } from "@/lib/sales/prequal-queries";

export default async function SalePrequalSubmittedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw ?? "").trim();

  let ok = false;
  if (token) {
    const ctx = await getSalePropertyForPrequalToken(token);
    ok = Boolean(ctx && ctx.listing_type === "sale");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <main className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {ok ? (
          <>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Thank you</h1>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Your details have been sent to the agent. They may contact you about next steps.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              This confirmation page does not match a valid link.
            </p>
          </>
        )}
        <ClosePublicFormButton />
      </main>
    </div>
  );
}
