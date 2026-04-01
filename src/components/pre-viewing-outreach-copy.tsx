"use client";

import { CopyPlainButton } from "@/components/copy-plain-button";

export function PreViewingOutreachCopy({
  whatsappText,
  emailDraft,
  linkUrl,
}: {
  whatsappText: string;
  emailDraft: string;
  linkUrl: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <CopyPlainButton text={whatsappText} label="Copy WhatsApp message" />
        <CopyPlainButton text={emailDraft} label="Copy email draft" />
      </div>
      <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Link only
        </p>
        <p className="mt-1 break-all font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
          {linkUrl}
        </p>
        <div className="mt-2">
          <CopyPlainButton text={linkUrl} label="Copy pre-viewing link" />
        </div>
      </div>
    </div>
  );
}
