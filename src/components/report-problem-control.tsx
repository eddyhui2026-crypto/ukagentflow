"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReportProblemControl() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/report-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          pageUrl:
            typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      const o = data as { error?: string };
      if (!res.ok) {
        setErr(o.error || "Something went wrong.");
        return;
      }
      setDone(true);
      setMessage("");
      window.setTimeout(() => {
        setOpen(false);
        setDone(false);
      }, 2000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Report issue"
        className={cn(
          "border-amber-500/80 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-500/50 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-950/80",
          "gap-1.5 px-2 sm:px-2.5",
        )}
        onClick={() => {
          setOpen(true);
          setErr(null);
          setDone(false);
        }}
      >
        <AlertTriangle className="size-4 shrink-0 sm:hidden" aria-hidden />
        <span className="hidden sm:inline">Report issue</span>
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-issue-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close"
            onClick={() => !busy && setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-700 dark:bg-zinc-950">
            <h2
              id="report-issue-title"
              className="text-base font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Report an issue
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Describe what went wrong or what you were trying to do. This is emailed to support via
              Resend (you may get a direct reply).
            </p>
            <label htmlFor="report-issue-msg" className="mt-3 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Details
            </label>
            <textarea
              id="report-issue-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-amber-500/40 focus-visible:ring-2 dark:border-zinc-600 dark:bg-zinc-900"
              placeholder="e.g. After saving a viewing, the page showed…"
            />
            {err ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                {err}
              </p>
            ) : null}
            {done ? (
              <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300" role="status">
                Sent. Thank you.
              </p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500"
                disabled={busy || message.trim().length < 10}
                onClick={() => void submit()}
              >
                {busy ? "Sending…" : "Send report"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
