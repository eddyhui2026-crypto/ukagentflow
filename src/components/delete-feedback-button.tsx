"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteFeedbackAction } from "@/app/(app)/dashboard/feedback-actions";
import { DestructiveConfirmModal } from "@/components/destructive-confirm-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

export function DeleteFeedbackButton({
  feedbackId,
  buyerLabel,
  className,
  compact = false,
}: {
  feedbackId: string;
  buyerLabel: string;
  className?: string;
  /** Icon-only for dense tables */
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant={compact ? "ghost" : "outline"}
        size={compact ? "icon-xs" : "sm"}
        className={cn(
          compact
            ? "text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
            : "gap-1.5 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/50",
          className,
        )}
        aria-label={compact ? `Delete feedback for ${buyerLabel}` : undefined}
        onClick={() => {
          setErr(null);
          setOpen(true);
        }}
      >
        <Trash2 className="size-3.5 shrink-0" aria-hidden />
        {compact ? null : "Delete"}
      </Button>
      <DestructiveConfirmModal
        open={open}
        onOpenChange={(v) => {
          if (!pending) {
            setOpen(v);
          }
        }}
        title="Delete this feedback?"
        description={
          <>
            <p>
              This removes the submitted feedback record for{" "}
              <strong className="font-medium text-zinc-800 dark:text-zinc-100">{buyerLabel}</strong>. The
              viewing and buyer link stay in place; only the feedback answers are deleted. This cannot be
              undone.
            </p>
          </>
        }
        confirmLabel="Delete feedback"
        pending={pending}
        error={err}
        onConfirm={() => {
          setErr(null);
          startTransition(async () => {
            const r = await deleteFeedbackAction(feedbackId);
            if (!r.ok) {
              setErr(r.error);
              return;
            }
            setOpen(false);
            router.refresh();
          });
        }}
      />
    </>
  );
}
