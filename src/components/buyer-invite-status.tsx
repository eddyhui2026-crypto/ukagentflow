"use client";

import { useEffect, useState } from "react";

/** Invite send state; compares scheduled time to clock (client-only) for Scheduled vs Queued. */
export function BuyerInviteStatus({
  viaApp,
  emailSent,
  scheduledAt,
}: {
  viaApp: boolean;
  emailSent: boolean;
  scheduledAt: Date | string | null | undefined;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!viaApp) {
    return (
      <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-900 dark:bg-violet-950 dark:text-violet-200">
        Agent copy
      </span>
    );
  }
  if (emailSent) {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
        Emailed
      </span>
    );
  }
  if (scheduledAt) {
    const t = typeof scheduledAt === "string" ? new Date(scheduledAt) : scheduledAt;
    const due = t.getTime() <= now;
    if (!due) {
      return (
        <span className="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-950 dark:bg-sky-950 dark:text-sky-100">
          Scheduled
        </span>
      );
    }
    return (
      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-950 dark:bg-amber-950/70 dark:text-amber-100">
        Queued
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-950 dark:bg-amber-950/70 dark:text-amber-100">
      Not sent
    </span>
  );
}
