"use client";

import {
  GUIDED_TOUR_TRACK_ORDER,
  GUIDED_TOUR_TRACKS,
  type TourTrackId,
} from "@/lib/guided-tour/tracks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, Map } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function GuidedTourPicker({
  onPick,
  className,
}: {
  onPick: (id: TourTrackId) => void;
  className?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-expanded={menuOpen}
        aria-haspopup="listbox"
        className="hidden h-8 gap-1 px-2 text-xs sm:inline-flex sm:h-9 sm:px-2.5 sm:text-sm"
        onClick={() => setMenuOpen((o) => !o)}
      >
        <Map className="size-3.5 shrink-0" aria-hidden />
        Guided tour
        <ChevronDown className="size-3.5 shrink-0 opacity-70" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="sm:hidden"
        aria-expanded={menuOpen}
        aria-label="Guided tour, choose a topic"
        onClick={() => setMenuOpen((o) => !o)}
      >
        <Map className="size-4" aria-hidden />
      </Button>

      {menuOpen ? (
        <div
          className="absolute right-0 top-full z-[300] mt-1 max-h-[min(70vh,24rem)] w-[min(calc(100vw-1rem),20rem)] overflow-y-auto overflow-x-hidden rounded-lg border border-zinc-200 bg-white py-1 text-left shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          role="listbox"
        >
          {GUIDED_TOUR_TRACK_ORDER.map((id) => {
            const t = GUIDED_TOUR_TRACKS[id];
            return (
              <button
                key={id}
                type="button"
                role="option"
                className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => {
                  onPick(id);
                  setMenuOpen(false);
                }}
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{t.menuLabel}</span>
                <span className="text-xs leading-snug text-zinc-500 dark:text-zinc-400">
                  {t.menuBlurb}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
