"use client";

import type { Session } from "next-auth";
import { useEffect, useState } from "react";

function timeGreeting(hour: string): string {
  const h = parseInt(hour, 10);
  if (!Number.isFinite(h)) return "Hello";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function AppHeaderGreeting({ session }: { session: Session }) {
  const name = session.user?.name?.trim() || "";
  const first = name ? name.split(/\s+/)[0]! : "";
  const email = session.user?.email ?? "";
  const fallbackLine = name || email || "Agent";

  const [lead, setLead] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const hourStr =
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        hour: "numeric",
        hour12: false,
      })
        .formatToParts(now)
        .find((p) => p.type === "hour")?.value ?? "12";
    const tg = timeGreeting(hourStr);
    const welcomeBack = Boolean(session.user?.previousLoginAt);
    const part = welcomeBack ? `Welcome back — ${tg}` : tg;
    const who = first || (email ? email.split("@")[0] : "") || "there";
    setLead(`${part}, ${who}`);
  }, [session.user?.previousLoginAt, first, email]);

  return (
    <div className="min-w-0">
      <div className="text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
        <span className="line-clamp-2 font-medium text-zinc-800 sm:line-clamp-1 dark:text-zinc-100">
          {lead ?? fallbackLine}
        </span>
        <span className="mt-0.5 hidden text-[11px] text-zinc-500 sm:mt-0 sm:inline sm:text-sm">
          <span className="text-zinc-300 dark:text-zinc-600"> · </span>
          <span className="truncate">{email}</span>
        </span>
      </div>
      {email ? (
        <p className="truncate text-[11px] text-zinc-500 sm:hidden dark:text-zinc-400">{email}</p>
      ) : null}
    </div>
  );
}
