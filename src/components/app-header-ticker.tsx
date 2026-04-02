"use client";

import {
  APP_HEADER_TICKER_TIPS,
  appHeaderTipsDayKeyLondon,
  orderTipsForDay,
} from "@/lib/ui/app-header-tips";
import { useEffect, useState } from "react";

export function AppHeaderTicker() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const dayKey = appHeaderTipsDayKeyLondon();
  const ordered = orderTipsForDay(APP_HEADER_TICKER_TIPS, dayKey);
  const sep = "  ·  ";

  if (!ready) {
    return (
      <div
        className="h-7 border-t border-zinc-100 bg-zinc-50/95 dark:border-zinc-800 dark:bg-zinc-900/40"
        aria-hidden
      />
    );
  }

  const chain = ordered.join(sep);

  return (
    <div
      className="relative h-7 overflow-hidden border-t border-zinc-100 bg-zinc-50/95 text-[11px] leading-7 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400 sm:h-8 sm:text-xs sm:leading-8"
      role="region"
      aria-label="Tips"
    >
      <div className="app-header-ticker-static h-full px-3 sm:px-5">
        <p className="line-clamp-1">{ordered.slice(0, 2).join(sep)}</p>
      </div>
      <div className="app-header-ticker-marquee">
        <div className="app-header-marquee-track flex w-max">
          <div className="flex shrink-0">
            <span className="shrink-0 whitespace-nowrap px-3 sm:px-5">{chain}</span>
            <span className="shrink-0 whitespace-nowrap px-3 sm:px-5 text-zinc-300 dark:text-zinc-600">
              {sep}
            </span>
          </div>
          <div className="flex shrink-0" aria-hidden>
            <span className="shrink-0 whitespace-nowrap px-3 sm:px-5">{chain}</span>
            <span className="shrink-0 whitespace-nowrap px-3 sm:px-5 text-zinc-300 dark:text-zinc-600">
              {sep}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
