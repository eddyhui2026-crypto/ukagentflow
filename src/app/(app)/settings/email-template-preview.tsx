"use client";

import { useState } from "react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import {
  previewAutoInviteEmail,
  type PreviewAutoInviteResult,
} from "./email-preview-actions";

export function AutoInviteTemplatePreview({
  subjectRef,
  bodyRef,
  showPhotoRef,
  includeFooterRef,
}: {
  subjectRef: RefObject<HTMLInputElement | null>;
  bodyRef: RefObject<HTMLTextAreaElement | null>;
  showPhotoRef: RefObject<HTMLInputElement | null>;
  includeFooterRef: RefObject<HTMLInputElement | null>;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<Extract<PreviewAutoInviteResult, { ok: true }> | null>(
    null,
  );

  async function run() {
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("subject", subjectRef.current?.value ?? "");
      fd.set("body", bodyRef.current?.value ?? "");
      fd.set("invite_show_property_photo", showPhotoRef.current?.checked ? "on" : "off");
      const r = await previewAutoInviteEmail(fd);
      if (!r.ok) {
        setErr(r.error);
        setData(null);
        return;
      }
      setData(r);
    } finally {
      setBusy(false);
    }
  }

  const srcDoc =
    data?.html != null
      ? `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:16px;font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.5;color:#18181b;background:#fff}</style></head><body>${data.html}</body></html>`
      : "";

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/30">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Full email preview (sample data)
        </h3>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Last step: after editing subject, body, layout options, and (if shown) the footer block above, click
          Generate preview. Sample buyer and address; link is fake. Branding from{" "}
          <strong className="font-medium">Account</strong>. Footer in the preview follows{" "}
          <strong className="font-medium">Include footer</strong> and saved footer text (unsaved toggles still
          apply here). Listing image is a placeholder when &quot;Show listing photo&quot; is on.
        </p>
        <Button
          type="button"
          className="mt-3"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => void run()}
        >
          {busy ? "Generating…" : "Generate preview"}
        </Button>
      </div>
      {err ? (
        <p className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </p>
      ) : null}
      {data ? (
        <div className="space-y-4 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Subject
            </p>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">{data.subject}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              HTML (as in the buyer&apos;s inbox)
            </p>
            <iframe
              title="Email HTML preview"
              className="mt-1 h-[min(480px,70vh)] w-full rounded-md border border-zinc-200 bg-white dark:border-zinc-700"
              sandbox="allow-same-origin"
              srcDoc={srcDoc}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
