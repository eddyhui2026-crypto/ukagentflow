import { ClosePublicFormButton } from "@/components/close-public-form-button";

export default async function FeedbackSubmittedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw ?? "").trim();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <main className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          ✓
        </div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Thank you</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Your feedback has been sent. The agent will share what is helpful with the seller.
        </p>
        {token ? (
          <p className="mt-4 text-xs text-zinc-400">Reference: {token.slice(0, 8)}…</p>
        ) : null}
        <ClosePublicFormButton />
      </main>
    </div>
  );
}
