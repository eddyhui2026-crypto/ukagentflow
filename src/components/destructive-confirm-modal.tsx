"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Z_MODAL = 6200;

function useBodyPortalEl(): HTMLElement | null {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    setEl(document.body);
  }, []);
  return el;
}

export function DestructiveConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  pending = false,
  error = null,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
}) {
  const portalEl = useBodyPortalEl();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !portalEl) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-end justify-center p-4 sm:items-center sm:p-6"
      style={{ zIndex: Z_MODAL }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="destructive-confirm-title"
      aria-describedby="destructive-confirm-desc"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[1px]"
        aria-label="Close"
        disabled={pending}
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl",
          "dark:border-zinc-700 dark:bg-zinc-900",
        )}
      >
        <h2
          id="destructive-confirm-title"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-50"
        >
          {title}
        </h2>
        <div
          id="destructive-confirm-desc"
          className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300"
        >
          {description}
        </div>
        {error ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    portalEl,
  );
}
