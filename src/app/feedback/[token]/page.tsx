import { ClosePublicFormButton } from "@/components/close-public-form-button";
import { getFeedbackContextByToken } from "@/lib/feedback/queries";
import { FeedbackForm } from "./feedback-form";
import { LettingsFeedbackForm } from "./lettings-feedback-form";

export default async function FeedbackEntryPage({
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

  const ctx = await getFeedbackContextByToken(token);

  if (!ctx) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <main className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Link not found
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            This feedback link may be wrong or expired. Contact your estate agent if you need
            help.
          </p>
          <ClosePublicFormButton />
        </main>
      </div>
    );
  }

  if (ctx.token_invalidated_at) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <main className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Link no longer active
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Ask your agent to send you a new feedback link.
          </p>
        </main>
      </div>
    );
  }

  if (ctx.link_expired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <main className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            This feedback link has expired
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Links stay open for a limited time after the viewing. Contact your estate agent if you still
            need to leave feedback.
          </p>
        </main>
      </div>
    );
  }

  if (ctx.already_submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <main className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Thanks — we already have your feedback
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            You submitted feedback for this viewing. If you need to change anything, contact
            your agent.
          </p>
          <ClosePublicFormButton />
        </main>
      </div>
    );
  }

  const isLetting = ctx.listing_type === "letting";
  const headerCopy = isLetting ? ctx.lettingsFormCopy : ctx.saleFormCopy;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h1 className="text-center text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {headerCopy.pageTitle}
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {headerCopy.pageSubtitle}
        </p>
        {headerCopy.intro ? (
          <div className="mt-5 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm whitespace-pre-wrap text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            {headerCopy.intro}
          </div>
        ) : null}
        <div className="mt-8">
          {isLetting ? (
            <LettingsFeedbackForm
              token={token}
              buyerName={ctx.buyer_name}
              propertyAddress={ctx.property_address}
              propertyPostcode={ctx.property_postcode}
              propertyImageUrl={ctx.property_hero_image_url}
              copy={ctx.lettingsFormCopy}
            />
          ) : (
            <FeedbackForm
              token={token}
              buyerName={ctx.buyer_name}
              propertyAddress={ctx.property_address}
              propertyPostcode={ctx.property_postcode}
              propertyImageUrl={ctx.property_hero_image_url}
              copy={ctx.saleFormCopy}
            />
          )}
        </div>
      </main>
    </div>
  );
}
