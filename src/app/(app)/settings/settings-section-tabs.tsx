"use client";

import { Children, useCallback, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type SettingsTabId =
  | "invite"
  | "copy"
  | "feedback_forms"
  | "prequal_share"
  | "prequal"
  | "billing"
  | "account";

const TABS: {
  id: SettingsTabId;
  label: string;
  heading: string;
}[] = [
  {
    id: "invite",
    label: "Auto invite",
    heading: "Feedback invite email",
  },
  {
    id: "copy",
    label: "Copy-paste",
    heading: "Copy-paste email (when you send invites yourself)",
  },
  {
    id: "feedback_forms",
    label: "Feedback forms",
    heading: "Buyer feedback forms",
  },
  {
    id: "prequal_share",
    label: "Pre-view share",
    heading: "Pre-viewing share messages",
  },
  {
    id: "prequal",
    label: "Pre-view pages",
    heading: "Pre-viewing pages (public form)",
  },
  {
    id: "billing",
    label: "Billing",
    heading: "Billing & trial",
  },
  {
    id: "account",
    label: "Account",
    heading: "Your account",
  },
];

/** Maps URL ?tab= and legacy values to current tab ids. */
function normalizeTabParam(raw: string | null): SettingsTabId {
  if (raw === "form" || raw === "sale_feedback" || raw === "letting_feedback") {
    return "feedback_forms";
  }
  if (raw === "sale_prequal" || raw === "letting_prequal") {
    return "prequal";
  }
  if (
    raw === "invite" ||
    raw === "copy" ||
    raw === "feedback_forms" ||
    raw === "prequal_share" ||
    raw === "prequal" ||
    raw === "billing" ||
    raw === "account"
  ) {
    return raw;
  }
  return "invite";
}

/**
 * Shell shown on SSR + first client paint. Real controls mount after client snapshot so hydration
 * matches; some browser extensions inject attributes (e.g. fdprocessedid) onto buttons and
 * inputs before React hydrates, which otherwise triggers a mismatch.
 */
function SettingsSectionTabsSkeleton({ active }: { active: SettingsTabId }) {
  const meta = TABS.find((t) => t.id === active)!;
  return (
    <div className="mt-10">
      <div
        className="flex flex-wrap gap-1 rounded-lg border border-zinc-200 bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/50"
        aria-hidden
      >
        {TABS.map((t, tabIndex) => {
          const on = active === t.id;
          return (
            <div
              key={`settings-section-skel-${t.id}-${tabIndex}`}
              className={cn(
                "min-h-10 flex-1 rounded-md px-2.5 py-2 text-center text-xs font-medium sm:flex-none sm:px-3 sm:text-sm",
                on
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400",
              )}
            >
              {t.label}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{meta.heading}</h2>
        <div
          className="mt-4 h-72 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60"
          aria-hidden
        />
      </div>
    </div>
  );
}

export function SettingsSectionTabs({
  panels,
}: {
  panels: Record<SettingsTabId, ReactNode>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const active: SettingsTabId = normalizeTabParam(rawTab);

  const hydrationSafe = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const setTab = useCallback(
    (id: SettingsTabId) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("tab", id);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const meta = TABS.find((t) => t.id === active)!;
  const panelContent = panels[active];

  if (!hydrationSafe) {
    return <SettingsSectionTabsSkeleton active={active} />;
  }

  return (
    <div className="mt-10">
      <div
        className="flex flex-wrap gap-1 rounded-lg border border-zinc-200 bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/50"
        role="tablist"
        aria-label="Settings sections"
      >
        {TABS.map((t, tabIndex) => {
          const on = active === t.id;
          return (
            <button
              key={`settings-section-${t.id}-${tabIndex}`}
              type="button"
              role="tab"
              aria-selected={on}
              id={`settings-tab-${t.id}`}
              aria-controls={`settings-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setTab(t.id)}
              className={cn(
                "min-h-10 flex-1 rounded-md px-2.5 py-2 text-center text-xs font-medium transition-colors sm:flex-none sm:px-3 sm:text-sm",
                on
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`settings-panel-${active}`}
        aria-labelledby={`settings-tab-${active}`}
        className="mt-8"
      >
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{meta.heading}</h2>
        {/* RSC → client can deserialize multi-node panels as an iterable; toArray assigns stable keys. */}
        <div className="settings-section-panel-root" data-active-tab={active}>
          {Children.toArray(panelContent)}
        </div>
      </div>
    </div>
  );
}
