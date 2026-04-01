"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

/** URL query keys: sales vs lettings; same value filters feedback and pre-viewing tables in that panel */
export type DashboardFeedbackSearchParam = "dqs" | "dql";

export function DashboardPanelSearch({
  param,
  placeholder,
}: {
  param: DashboardFeedbackSearchParam;
  placeholder: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const qParam = searchParams.get(param) ?? "";
  const [localQ, setLocalQ] = useState(qParam);

  useEffect(() => {
    setLocalQ(qParam);
  }, [qParam]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const trimmed = localQ.trim();
      const cur = qParam.trim();
      if (trimmed === cur) return;
      const next = new URLSearchParams(searchParams.toString());
      if (trimmed) next.set(param, trimmed);
      else next.delete(param);
      startTransition(() => {
        router.replace(`/dashboard${next.toString() ? `?${next}` : ""}`);
      });
    }, 400);
    return () => window.clearTimeout(t);
  }, [localQ, qParam, param, router, searchParams]);

  return (
    <input
      type="search"
      value={localQ}
      onChange={(e) => setLocalQ(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      disabled={pending}
      aria-label={placeholder}
      className="w-full min-w-[10rem] max-w-[18rem] rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
    />
  );
}
