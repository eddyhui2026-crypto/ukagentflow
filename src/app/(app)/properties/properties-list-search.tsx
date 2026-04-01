"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

/** Debounced search on /properties — keeps `listing`, updates `q`. */
export function PropertiesListSearch({ listing }: { listing: "sale" | "letting" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const qParam = searchParams.get("q") ?? "";
  const [localQ, setLocalQ] = useState(qParam);

  useEffect(() => {
    setLocalQ(qParam);
  }, [qParam]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const trimmed = localQ.trim();
      const cur = qParam.trim();
      if (trimmed === cur) return;
      const next = new URLSearchParams();
      next.set("listing", listing);
      if (trimmed) next.set("q", trimmed);
      startTransition(() => {
        router.replace(`/properties?${next.toString()}`);
      });
    }, 400);
    return () => window.clearTimeout(t);
  }, [localQ, qParam, listing, router]);

  return (
    <input
      type="search"
      value={localQ}
      onChange={(e) => setLocalQ(e.target.value)}
      placeholder="Search address or postcode…"
      autoComplete="off"
      disabled={pending}
      aria-label="Search properties by address or postcode"
      className="w-full min-w-[10rem] max-w-[22rem] rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
    />
  );
}
