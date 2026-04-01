"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  resetPasswordWithTokenAction,
  type ResetPasswordState,
} from "../actions";

const initial: ResetPasswordState = undefined;

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    resetPasswordWithTokenAction,
    initial,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-offset-zinc-950"
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="confirm"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Confirm new password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-offset-zinc-950"
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
