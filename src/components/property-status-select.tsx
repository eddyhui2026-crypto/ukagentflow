"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  updatePropertyStatusAction,
  type PropertyStatusFormState,
} from "@/app/(app)/properties/actions";
import { propertyStatusOptions } from "@/lib/properties/status";
import { cn } from "@/lib/utils";

const initial: PropertyStatusFormState = undefined;

function resolvedValue(
  listingType: "sale" | "letting",
  currentStatus: string,
): string {
  const normalized = currentStatus.toLowerCase();
  const opts = propertyStatusOptions(listingType);
  const hasValue = opts.some((o) => o.value === normalized);
  if (hasValue) return normalized;
  if (opts.length > 0) return opts[0]!.value;
  return "active";
}

export function PropertyStatusSelect({
  propertyId,
  listingType,
  currentStatus,
  className,
  selectClassName,
}: {
  propertyId: string;
  listingType: "sale" | "letting";
  currentStatus: string;
  className?: string;
  selectClassName?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updatePropertyStatusAction, initial);
  const wasPending = useRef(false);

  const normalized = currentStatus.toLowerCase();
  const opts = propertyStatusOptions(listingType);
  const hasValue = opts.some((o) => o.value === normalized);

  const serverValue = resolvedValue(listingType, currentStatus);
  const [value, setValue] = useState(serverValue);

  useEffect(() => {
    setValue(serverValue);
  }, [serverValue]);

  useEffect(() => {
    if (wasPending.current && !pending && state === undefined) {
      router.refresh();
    }
    wasPending.current = pending;
  }, [pending, state, router]);

  return (
    <div className={cn("min-w-0", className)}>
      <form action={formAction} className="inline-flex flex-col gap-1">
        <input type="hidden" name="property_id" value={propertyId} />
        <label htmlFor={`instruction-status-${propertyId}`} className="sr-only">
          Instruction status
        </label>
        <select
          id={`instruction-status-${propertyId}`}
          name="status"
          value={value}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value;
            const form = e.currentTarget.form;
            flushSync(() => setValue(next));
            form?.requestSubmit();
          }}
          className={cn(
            "w-full min-w-[10rem] rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 sm:text-sm",
            selectClassName,
          )}
        >
          {!hasValue ? (
            <option value={normalized}>{normalized} (legacy — choose a new status)</option>
          ) : null}
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {state?.error ? (
          <span className="max-w-xs text-[11px] text-red-600 dark:text-red-400">{state.error}</span>
        ) : null}
      </form>
    </div>
  );
}
