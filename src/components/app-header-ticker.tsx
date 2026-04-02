"use client";

import {
  APP_HEADER_TICKER_TIPS,
  appHeaderTipsDayKeyLondon,
  orderTipsForDay,
} from "@/lib/ui/app-header-tips";
import { useEffect, useMemo, useState } from "react";

/** One tip at a time; slow rotation so it never feels crowded. */
const TIP_DISPLAY_MS = 28_000;

export function AppHeaderTicker() {
  const [ready, setReady] = useState(false);
  const dayKey = useMemo(() => appHeaderTipsDayKeyLondon(), []);
  const ordered = useMemo(
    () => orderTipsForDay(APP_HEADER_TICKER_TIPS, dayKey),
    [dayKey],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || ordered.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ordered.length);
    }, TIP_DISPLAY_MS);
    return () => window.clearInterval(id);
  }, [ready, ordered.length]);

  if (!ready) {
    return (
      <div
        className="min-h-10 border-t border-zinc-100 bg-zinc-50/95 dark:border-zinc-800 dark:bg-zinc-900/40"
        aria-hidden
      />
    );
  }

  const tip = ordered[index] ?? ordered[0] ?? "";

  return (
    <div
      className="border-t border-zinc-100 bg-zinc-50/95 px-3 py-2 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400 sm:px-5 sm:text-xs"
      role="region"
      aria-label="Tips"
    >
      <p key={`${dayKey}-${index}`} className="app-header-tip-line text-center leading-snug sm:text-left">
        {tip}
      </p>
    </div>
  );
}
