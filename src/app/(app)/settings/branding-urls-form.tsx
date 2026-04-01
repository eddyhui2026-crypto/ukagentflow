"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { CloudinaryImageField } from "@/components/cloudinary-image-field";
import {
  saveInviteBrandingUrlsAction,
  type InviteBrandingUrlsState,
} from "./actions";

const initial: InviteBrandingUrlsState = undefined;

export function BrandingUrlsForm({
  initialLogoUrl,
  initialProfilePhotoUrl,
  companyNamePreview,
  agentNamePreview,
}: {
  initialLogoUrl: string | null;
  initialProfilePhotoUrl: string | null;
  companyNamePreview: string;
  agentNamePreview: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveInviteBrandingUrlsAction,
    initial,
  );

  return (
    <div className="space-y-6">
      <form
        key={`${initialLogoUrl ?? ""}|${initialProfilePhotoUrl ?? ""}`}
        action={formAction}
        className="max-w-xl space-y-6"
      >
        <CloudinaryImageField
          name="brand_logo_url"
          label="Company logo"
          kind="company_logo"
          initialUrl={initialLogoUrl}
          formDisabled={pending}
          helperText={
            <>
              Resized in the browser, then uploaded to Cloudinary. On buyer invites it appears{" "}
              <strong className="font-medium">centred at the top</strong>, with your{" "}
              <strong className="font-medium">company name</strong> on the line below (same layout as the homepage
              sample). Clear removes the logo (name only).
            </>
          }
        />
        <CloudinaryImageField
          name="profile_photo_url"
          label="Your photo"
          kind="profile_photo"
          initialUrl={initialProfilePhotoUrl}
          formDisabled={pending}
          helperText={
            <>
              Same flow as the logo. Shown above{" "}
              <strong className="font-medium">{agentNamePreview}</strong> on buyer invites.
            </>
          }
        />
        {state && "error" in state ? (
          <p
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}
        {state && "success" in state && state.success ? (
          <p
            className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
            role="status"
          >
            {state.message}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save branding"}
        </Button>
      </form>

      {(initialLogoUrl || initialProfilePhotoUrl) && (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Saved on server
          </p>
          <div className="mt-3 flex flex-wrap gap-6">
            <MiniPreview
              label="Company (invite header)"
              src={initialLogoUrl}
              fallbackText={companyNamePreview}
            />
            <MiniPreview
              label="You"
              src={initialProfilePhotoUrl}
              fallbackText={agentNamePreview}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MiniPreview({
  label,
  src,
  fallbackText,
}: {
  label: string;
  src: string | null;
  fallbackText: string;
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <div className="mt-1 rounded border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className="mx-auto max-h-16 max-w-[120px] object-contain"
          />
        ) : null}
        <p className="mt-1 max-w-[140px] text-xs text-zinc-700 dark:text-zinc-300">
          {fallbackText}
        </p>
      </div>
    </div>
  );
}
