"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyPlainButton({
  text,
  label,
  copiedLabel = "Copied",
  className,
  title,
}: {
  text: string;
  label: string;
  copiedLabel?: string;
  className?: string;
  /** Hover / a11y name when label is abbreviated */
  title?: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      title={title ?? label}
      className={cn("h-8 shrink-0 text-xs", className)}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        window.setTimeout(() => setDone(false), 2000);
      }}
    >
      {done ? copiedLabel : label}
    </Button>
  );
}
