"use client";

import { useActionState } from "react";
import { claimQuickFeedbackAction } from "./actions";
import { Button } from "@/components/ui/button";

export function QuickClaimForm({ qrToken }: { qrToken: string }) {
  const [state, formAction, pending] = useActionState(claimQuickFeedbackAction, undefined);

  return (
    <form action={formAction} className="mt-8 space-y-4 text-left">
      <input type="hidden" name="qr_token" value={qrToken} />
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Your email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="same email your agent used for this viewing"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Checking…" : "Continue to feedback"}
      </Button>
    </form>
  );
}
