"use client";

import { useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type SettingsListingTabId = "feedback_forms" | "prequal_share" | "prequal";

function listingSideFromSearch(rawTab: string | null, sideParam: string | null): "sale" | "letting" {
  if (sideParam === "letting") return "letting";
  if (rawTab === "letting_feedback" || rawTab === "letting_prequal") return "letting";
  return "sale";
}

export function SettingsListingSplitShell({
  tabId,
  sale,
  letting,
  saleLabel = "For sale",
  lettingLabel = "To let",
}: {
  tabId: SettingsListingTabId;
  sale: ReactNode;
  letting: ReactNode;
  saleLabel?: string;
  lettingLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const sideParam = searchParams.get("side");

  const listingSide = useMemo(
    () => listingSideFromSearch(tabParam, sideParam),
    [tabParam, sideParam],
  );

  const setListing = useCallback(
    (next: "sale" | "letting") => {
      const p = new URLSearchParams(searchParams.toString());
      p.set("tab", tabId);
      if (next === "letting") p.set("side", "letting");
      else p.delete("side");
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, tabId],
  );

  return (
    <div className="settings-listing-split">
      <div
        className="mb-6 flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Listing type (sales vs lettings)"
      >
        <button
          type="button"
          role="tab"
          aria-selected={listingSide === "sale"}
          tabIndex={listingSide === "sale" ? 0 : -1}
          onClick={() => setListing("sale")}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
            listingSide === "sale"
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
              : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/80",
          )}
        >
          <ChevronLeft className="size-4 opacity-70" aria-hidden />
          {saleLabel}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={listingSide === "letting"}
          tabIndex={listingSide === "letting" ? 0 : -1}
          onClick={() => setListing("letting")}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
            listingSide === "letting"
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
              : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/80",
          )}
        >
          {lettingLabel}
          <ChevronRight className="size-4 opacity-70" aria-hidden />
        </button>
      </div>
      <div className={cn(listingSide !== "sale" && "hidden")}>{sale}</div>
      <div className={cn(listingSide !== "letting" && "hidden")}>{letting}</div>
    </div>
  );
}
