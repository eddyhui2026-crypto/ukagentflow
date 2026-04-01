"use client";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

/** `<a download>` for a PNG data URL (suitable for printing / laminating at the property). */
export function QrPngDownloadButton({
  dataUrl,
  fileName,
  className,
}: {
  dataUrl: string;
  /** e.g. ukagentflow-buyer-qr.png */
  fileName: string;
  className?: string;
}) {
  if (!dataUrl) return null;

  return (
    <a
      href={dataUrl}
      download={fileName}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "h-8 w-full text-xs sm:w-auto",
        className,
      )}
    >
      Download PNG for printing
    </a>
  );
}
