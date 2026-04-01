"use client";

import Link from "next/link";
import { CalendarPlus, ExternalLink } from "lucide-react";
import { CopyPlainButton } from "@/components/copy-plain-button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

/** One row on For sale / To let — schedule, open detail, copy share links without entering the property first. */
export function PropertyListRowActions({
  propertyId,
  vendorUrl,
  quickFeedbackUrl,
  prequalUrl,
}: {
  propertyId: string;
  vendorUrl: string;
  quickFeedbackUrl: string;
  prequalUrl: string;
}) {
  const scheduleHref = `/properties/${propertyId}/viewings/new`;
  const detailHref = `/properties/${propertyId}`;
  const copySm = "h-7 px-2 text-[11px]";

  return (
    <div className="flex min-w-[12rem] max-w-[22rem] flex-col gap-2 py-0.5 sm:min-w-[14rem]">
      <div className="flex flex-wrap items-center gap-1.5">
        <Link
          href={scheduleHref}
          title="Schedule a new viewing"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "h-8 gap-1 text-xs font-medium",
          )}
        >
          <CalendarPlus className="size-3.5 shrink-0" aria-hidden />
          <span className="sm:hidden">Schedule</span>
          <span className="hidden sm:inline">Schedule viewing</span>
        </Link>
        <Link
          href={detailHref}
          title="Open property page (photos, all links)"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-8 gap-1 text-xs",
          )}
        >
          <ExternalLink className="size-3.5 shrink-0" aria-hidden />
          <span className="sm:hidden">Open</span>
          <span className="hidden sm:inline">Open property</span>
        </Link>
      </div>
      <div className="flex flex-wrap gap-1">
        <CopyPlainButton
          text={vendorUrl}
          label="Vendor"
          title="Copy vendor live portal link"
          copiedLabel="Copied"
          className={copySm}
        />
        <CopyPlainButton
          text={quickFeedbackUrl}
          label="Quick / QR"
          title="Copy quick feedback landing (buyers enter email after scanning QR)"
          copiedLabel="Copied"
          className={copySm}
        />
        <CopyPlainButton
          text={prequalUrl}
          label="Pre-viewing"
          title="Copy pre-viewing qualification link"
          copiedLabel="Copied"
          className={copySm}
        />
      </div>
    </div>
  );
}
