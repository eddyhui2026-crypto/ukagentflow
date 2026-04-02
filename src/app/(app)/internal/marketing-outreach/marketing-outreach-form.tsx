"use client";

import { sendInternalMarketingOutreachAction } from "@/app/(app)/internal/marketing-outreach/actions";
import { INTERNAL_MARKETING_MAX_RECIPIENTS } from "@/lib/email/internal-marketing-send";
import { Button } from "@/components/ui/button";
import { useActionState } from "react";

type Props = {
  warnSharedFrom: boolean;
};

const initialState = undefined;

export function MarketingOutreachForm({ warnSharedFrom }: Props) {
  const [state, formAction, pending] = useActionState(
    sendInternalMarketingOutreachAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-8">
      {warnSharedFrom ? (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          <strong className="font-semibold">From-address warning:</strong>{" "}
          <code className="text-xs">RESEND_FROM_MARKETING</code> is not set, so these sends use the same{" "}
          <code className="text-xs">RESEND_FROM</code> as transactional mail. Marketing sends can affect
          deliverability for invites and system mail. Prefer a dedicated marketing subdomain in Resend.
        </div>
      ) : null}

      {state && !state.ok ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="mo-subject" className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Subject template
        </label>
        <input
          id="mo-subject"
          name="subject"
          required
          disabled={pending}
          placeholder='e.g. Hello {{name}}, quick update from us'
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Placeholders: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{`{{name}}`}</code>,{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{`{{email}}`}</code>. Empty name becomes
          &ldquo;there&rdquo; for <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{`{{name}}`}</code>
          .
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="mo-body" className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Body template (plain text)
        </label>
        <textarea
          id="mo-body"
          name="body"
          required
          disabled={pending}
          rows={10}
          placeholder={`Hi {{name}},\n\n…\n\nTo stop receiving these, reply with UNSUBSCRIBE.\n\n— Your team`}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Paragraphs: separate with a blank line. You are responsible for UK marketing consent / unsubscribe
          wording.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Recipients (max {INTERNAL_MARKETING_MAX_RECIPIENTS})
        </p>
        <div className="space-y-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-[1fr_1fr] gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <span>Email</span>
            <span>Name (optional)</span>
          </div>
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {Array.from({ length: INTERNAL_MARKETING_MAX_RECIPIENTS }, (_, i) => (
              <li key={i} className="grid grid-cols-1 gap-2 px-3 py-2 sm:grid-cols-2 sm:gap-3">
                <input
                  name={`email_${i}`}
                  type="email"
                  autoComplete="off"
                  disabled={pending}
                  placeholder="buyer@example.com"
                  className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                />
                <input
                  name={`name_${i}`}
                  type="text"
                  autoComplete="off"
                  disabled={pending}
                  placeholder="Alex"
                  className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send batch"}
      </Button>

      {state?.ok ? (
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <p className="border-b border-zinc-200 px-4 py-2 text-sm font-medium dark:border-zinc-800">
            Results
          </p>
          <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            {state.results.map((r) => (
              <li key={r.to} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
                <span className="break-all font-mono text-xs">{r.to}</span>
                {r.ok ? (
                  <span className="text-emerald-600 dark:text-emerald-400">Sent</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">{r.error}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
