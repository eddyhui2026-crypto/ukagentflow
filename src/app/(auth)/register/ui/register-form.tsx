"use client";

import { useActionState } from "react";
import { registerAction } from "../actions";
import type { AuthFormState } from "../../login/actions";
import { Button } from "@/components/ui/button";

const initial: AuthFormState = undefined;

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="companyName"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Company name
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          required
          className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-offset-zinc-950"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Your name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-offset-zinc-950"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-offset-zinc-950"
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Password (min 8 characters)
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
      {state?.error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
