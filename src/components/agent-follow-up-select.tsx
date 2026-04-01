"use client";

import {
  AGENT_FOLLOW_UP_LABELS,
  type AgentFollowUp,
} from "@/lib/feedback/agent-follow-up";
import { updateFeedbackAgentFollowUp } from "@/app/(app)/dashboard/feedback-actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const ORDER: AgentFollowUp[] = ["new", "called", "followed_up"];

export function AgentFollowUpSelect({
  feedbackId,
  value,
  compact = false,
}: {
  feedbackId: string;
  value: AgentFollowUp;
  /** Narrower select (e.g. dashboard table column). */
  compact?: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setCurrent(value);
  }, [value]);

  return (
    <div className="flex flex-col gap-1">
      <select
        className={cn(
          "rounded-md border border-zinc-300 bg-white py-1.5 text-xs font-medium text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50",
          compact ? "max-w-[7.375rem] px-1.5" : "max-w-[10.5rem] px-2",
          pending && "opacity-60",
        )}
        disabled={pending}
        value={current}
        aria-label="Feedback follow-up status"
        onChange={(e) => {
          const next = e.target.value as AgentFollowUp;
          setCurrent(next);
          setErr(null);
          startTransition(async () => {
            const r = await updateFeedbackAgentFollowUp(feedbackId, next);
            if (!r.ok) {
              setErr(r.error);
              setCurrent(value);
              return;
            }
            router.refresh();
          });
        }}
      >
        {ORDER.map((k) => (
          <option key={k} value={k}>
            {AGENT_FOLLOW_UP_LABELS[k]}
          </option>
        ))}
      </select>
      {err ? <span className="text-[10px] text-red-600 dark:text-red-400">{err}</span> : null}
    </div>
  );
}
