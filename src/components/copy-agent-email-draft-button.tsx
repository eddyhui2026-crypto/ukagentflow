"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyAgentEmailDraftButton({ draftText }: { draftText: string }) {
  const [done, setDone] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 shrink-0 text-xs"
      onClick={async () => {
        await navigator.clipboard.writeText(draftText);
        setDone(true);
        window.setTimeout(() => setDone(false), 2000);
      }}
    >
      {done ? "Copied" : "Copy email draft"}
    </Button>
  );
}
