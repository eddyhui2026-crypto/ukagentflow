"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { changePasswordAction, type ChangePasswordState } from "./actions";

const initial: ChangePasswordState = undefined;

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initial,
  );

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="currentPassword"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-offset-zinc-950"
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="newPassword"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-offset-zinc-950"
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-offset-zinc-950"
        />
      </div>
      {state && "error" in state ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state && "success" in state && state.success ? (
        <p
          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
          role="status"
        >
          {state.message ?? "Saved."}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Update password"}
      </Button>
    </form>
  );
}
