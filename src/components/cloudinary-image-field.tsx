"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { compressImageForUpload } from "@/lib/upload/compress-image-client";

export type CloudinaryImageKind =
  | "property_hero"
  /** Before the property row exists (Add property); stored URL is saved on create. */
  | "property_hero_draft"
  | "company_logo"
  | "profile_photo";

export function CloudinaryImageField({
  name,
  label,
  kind,
  propertyId,
  initialUrl,
  helperText,
  formDisabled,
}: {
  name: string;
  label: string;
  kind: CloudinaryImageKind;
  propertyId?: string;
  initialUrl: string | null;
  helperText?: React.ReactNode;
  formDisabled?: boolean;
}) {
  const inputId = useId();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [previewNonce, setPreviewNonce] = useState(0);

  useEffect(() => {
    setUrl(initialUrl ?? "");
  }, [initialUrl]);

  async function onPickFile(file: File | null) {
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      const compressed = await compressImageForUpload(file);
      const fd = new FormData();
      fd.set("file", compressed);
      fd.set("kind", kind);
      if (kind === "property_hero" && propertyId) {
        fd.set("propertyId", propertyId);
      }
      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: fd,
      });
      const data: unknown = await res.json().catch(() => ({}));
      const obj = data as { error?: string; url?: string };
      if (!res.ok) {
        throw new Error(obj.error || "Upload failed");
      }
      if (!obj.url || typeof obj.url !== "string") {
        throw new Error("Invalid upload response");
      }
      setUrl(obj.url);
      setPreviewNonce((n) => n + 1);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const disabled = formDisabled || busy;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <input type="hidden" name={name} value={url} readOnly />
      <div className="flex flex-wrap items-center gap-2">
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="text-sm text-zinc-600 file:mr-2 file:rounded-md file:border file:border-zinc-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium dark:text-zinc-400 dark:file:border-zinc-600 dark:file:bg-zinc-900"
          disabled={disabled}
          onChange={(e) => {
            const f = e.target.files?.[0];
            void onPickFile(f ?? null);
            e.target.value = "";
          }}
        />
        {url ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={disabled}
            onClick={() => {
              setUrl("");
              setErr(null);
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>
      {busy ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Compressing and uploading…
        </p>
      ) : null}
      {err ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {err}
        </p>
      ) : null}
      {helperText ? (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{helperText}</div>
      ) : null}
      {url ? (
        <div className="mt-2 inline-block rounded-md border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${url}-${previewNonce}`}
            src={url}
            alt=""
            className="max-h-32 max-w-full rounded object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}
