"use client";

import { useState } from "react";
import { BILLING_TRIAL_DAYS } from "@/lib/billing/trial";

type BillingSettingsPanelProps = {
  trialEndsAtIso: string;
  trialStartedAtIso: string;
  subscriptionStatus: string | null;
  stripeSubscriptionId: string | null;
  yearlyPriceConfigured: boolean;
  stripeConfigured: boolean;
};

function formatUk(dt: Date): string {
  return dt.toLocaleString("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "long",
    timeStyle: "short",
  });
}

export function BillingSettingsPanel({
  trialEndsAtIso,
  trialStartedAtIso,
  subscriptionStatus,
  stripeSubscriptionId,
  yearlyPriceConfigured,
  stripeConfigured,
}: BillingSettingsPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"month" | "year" | null>(null);

  const trialEnd = new Date(trialEndsAtIso);
  const inTrial = trialEnd.getTime() > Date.now();
  const status = subscriptionStatus?.toLowerCase() ?? "";
  const subscribed = status === "active" || status === "trialing";

  async function startCheckout(interval: "month" | "year") {
    setError(null);
    setLoading(interval);
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not start checkout.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Your workspace has a{" "}
        <strong className="font-medium text-zinc-800 dark:text-zinc-200">
          {BILLING_TRIAL_DAYS}-day
        </strong>{" "}
        trial from registration. You can open a Stripe checkout to subscribe at any time — if you still
        have trial time left,{" "}
        <strong className="font-medium text-zinc-800 dark:text-zinc-200">
          the first payment is due when that original trial ends
        </strong>{" "}
        (you keep the remaining days; paying early does not end the trial early).
      </p>

      <dl className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40 sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Trial started</dt>
          <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-50">
            {formatUk(new Date(trialStartedAtIso))}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Trial ends (billing anchor)</dt>
          <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-50">
            {formatUk(trialEnd)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-zinc-500 dark:text-zinc-400">Stripe subscription</dt>
          <dd className="mt-0.5 font-mono text-xs text-zinc-800 dark:text-zinc-200">
            {stripeSubscriptionId ?? "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
          <dd className="mt-0.5 font-medium capitalize text-zinc-900 dark:text-zinc-50">
            {subscriptionStatus ?? (inTrial ? "Trial (app)" : "—")}
          </dd>
        </div>
      </dl>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {!stripeConfigured ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Online checkout isn&apos;t turned on for this workspace yet. You can keep using the app; subscribe when
          your company enables billing.
        </p>
      ) : subscribed ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You have an active subscription. Payment method and billing details are handled in Stripe when your
          company sets that up; the status above refreshes as things change.
        </p>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => startCheckout("month")}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading === "month" ? "Redirecting…" : "Subscribe — monthly"}
          </button>
          {yearlyPriceConfigured ? (
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => startCheckout("year")}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              {loading === "year" ? "Redirecting…" : "Subscribe — yearly"}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
