"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const mainNav = [{ href: "/dashboard", label: "Dashboard" }];

const propertyNav = [
  { href: "/properties?listing=sale", label: "For sale", listing: "sale" as const },
  { href: "/properties?listing=letting", label: "To let", listing: "letting" as const },
];

const tailNav = [
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export function AppSidebar({ sidebarRecent24hCount = 0 }: { sidebarRecent24hCount?: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listingParam =
    searchParams.get("listing") === "letting" ? "letting" : "sale";

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-zinc-200 bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          UKAgentFlow
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {mainNav.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium",
                active
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
              )}
            >
              <span>{label}</span>
              {href === "/dashboard" && sidebarRecent24hCount > 0 ? (
                <span
                  className="min-w-[1.25rem] rounded-full bg-emerald-600 px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums text-white"
                  title={`${sidebarRecent24hCount} feedback or pre-viewing in the last 24 hours (live listings)`}
                >
                  {sidebarRecent24hCount > 99 ? "99+" : sidebarRecent24hCount}
                </span>
              ) : null}
            </Link>
          );
        })}

        <div className="my-2 px-3 pt-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Properties
          </p>
        </div>
        {propertyNav.map(({ href, label, listing }) => {
          const active =
            pathname === "/properties" && listingParam === listing;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium",
                active
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
              )}
            >
              {label}
            </Link>
          );
        })}

        <div className="my-2 border-t border-zinc-200 pt-2 dark:border-zinc-800" />
        {tailNav.map(({ href, label }) => {
          const active =
            href === "/settings"
              ? pathname === "/settings" || pathname.startsWith("/settings/")
              : href === "/reports"
                ? pathname === "/reports" || pathname.startsWith("/reports/")
                : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium",
                active
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
