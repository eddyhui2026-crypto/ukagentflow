"use client";

import { useActionState, useState } from "react";
import {
  createViewingAction,
  type ViewingFormState,
} from "../../actions";
import { Button } from "@/components/ui/button";

const initial: ViewingFormState = undefined;

function newRowId() {
  return crypto.randomUUID();
}

export function NewViewingForm({ propertyId }: { propertyId: string }) {
  const [rowIds, setRowIds] = useState<string[]>(() => [newRowId()]);
  const [state, formAction, pending] = useActionState(
    createViewingAction,
    initial,
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="property_id" value={propertyId} />
      <div className="space-y-1.5">
        <label htmlFor="viewing_date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Viewing date
        </label>
        <input
          id="viewing_date"
          name="viewing_date"
          type="date"
          required
          className="flex h-10 max-w-xs rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Buyers at this viewing
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRowIds((ids) => [...ids, newRowId()])}
          >
            + Add buyer
          </Button>
        </div>

        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Each buyer gets a private feedback link. Names and emails are saved on Save.
        </p>

        <ul className="mt-4 space-y-4">
          {rowIds.map((rowId, index) => (
            <li
              key={rowId}
              className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Buyer {index + 1}
                </span>
                {rowIds.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setRowIds((ids) => ids.filter((id) => id !== rowId))
                    }
                    className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Name
                  </label>
                  <input
                    name="buyer_name"
                    type="text"
                    placeholder="e.g. Jane Smith"
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Email
                  </label>
                  <input
                    name="buyer_email"
                    type="email"
                    placeholder="buyer@example.com"
                    autoComplete="off"
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Phone (optional)
                  </label>
                  <input
                    name="buyer_phone"
                    type="tel"
                    className="flex h-9 w-full max-w-md rounded-md border border-zinc-300 bg-white px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <fieldset className="mt-6 space-y-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <legend className="px-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            How to deliver feedback links
          </legend>
          <label className="flex cursor-pointer gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="radio"
              name="invite_emails_via_app"
              value="1"
              defaultChecked
              className="mt-1 border-zinc-400 text-blue-600"
            />
            <span>
              <strong className="font-medium text-zinc-900 dark:text-zinc-50">
                Email buyers automatically
              </strong>
              <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                UKAgentFlow emails each buyer a personal link via Resend{" "}
                <strong className="font-medium text-zinc-700 dark:text-zinc-300">
                  the morning after the viewing
                </strong>{" "}
                (about 9:00 Europe/London), not immediately. A scheduled job must run on your host
                (see <code className="rounded bg-zinc-200 px-1 text-[10px] dark:bg-zinc-800">vercel.json</code>{" "}
                + <code className="rounded bg-zinc-200 px-1 text-[10px] dark:bg-zinc-800">CRON_SECRET</code>).
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="radio"
              name="invite_emails_via_app"
              value="0"
              className="mt-1 border-zinc-400 text-blue-600"
            />
            <span>
              <strong className="font-medium text-zinc-900 dark:text-zinc-50">
                I&apos;ll copy links myself
              </strong>
              <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                No email from us. You get a unique link per buyer on the property page to paste into
                your own message.
              </span>
            </span>
          </label>
        </fieldset>
      </div>

      {state && "error" in state ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save viewing"}
        </Button>
      </div>
    </form>
  );
}
