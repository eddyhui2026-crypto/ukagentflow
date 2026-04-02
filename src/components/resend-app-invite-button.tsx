"use client";

import { useActionState } from "react";
import { resendFeedbackInviteAction } from "@/app/(app)/properties/[id]/invite-actions";
import { Button } from "@/components/ui/button";

export function ResendAppInviteButton({
  viewingBuyerId,
  propertyId,
}: {
  viewingBuyerId: string;
  propertyId: string;
}) {
  const [state, formAction, isPending] = useActionState(
    resendFeedbackInviteAction,
    undefined,
  );

  return (
    <form
      action={formAction}
      className="m-0 flex min-w-[8.5rem] flex-col items-stretch gap-0.5 p-0"
    >
      <input type="hidden" name="viewing_buyer_id" value={viewingBuyerId} />
      <input type="hidden" name="property_id" value={propertyId} />
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        disabled={isPending}
        className="h-8 text-xs"
      >
        {isPending ? "Sending…" : "Email invite again"}
      </Button>
      {state?.error ? (
        <span className="text-[11px] leading-snug text-red-600 dark:text-red-400">{state.error}</span>
      ) : null}
      {state?.success ? (
        <span className="text-[11px] leading-snug text-emerald-700 dark:text-emerald-400">
          {state.success}
        </span>
      ) : null}
    </form>
  );
}
