"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyPlainButton({
  text,
  label,
  copiedLabel = "Copied",
}: {
  text: string;
  label: string;
  copiedLabel?: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 shrink-0 text-xs"
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
