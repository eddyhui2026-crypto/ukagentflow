"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { CloudinaryImageField } from "@/components/cloudinary-image-field";
import {
  updatePropertyHeroImageAction,
  type PropertyHeroState,
} from "./property-hero-actions";

const initial: PropertyHeroState = undefined;

export function PropertyHeroImageCard({
  propertyId,
  initialUrl,
  propertyLine,
}: {
  propertyId: string;
  initialUrl: string | null;
  propertyLine: string;
}) {
  const [state, formAction, pending] = useActionState(
    updatePropertyHeroImageAction,
    initial,
  );

  return (
    <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Listing image (buyer emails)
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        One optional photo for automated feedback invites. We shrink the file in your browser, then store it on
        Cloudinary. The email shows the image above the address (or the address only if you clear it).
      </p>
      <form
        key={initialUrl ?? ""}
        action={formAction}
        className="mt-4 space-y-4"
      >
        <input type="hidden" name="propertyId" value={propertyId} />
        <CloudinaryImageField
          name="hero_image_url"
          label="Upload photo"
          kind="property_hero"
          propertyId={propertyId}
          initialUrl={initialUrl}
          formDisabled={pending}
          helperText={
            <>
              JPEG, PNG, or WebP. Large photos are resized in the browser before upload. In buyer invites the
              address line under the image is:{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{propertyLine}</span>
            </>
          }
        />
        {state && "error" in state ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {state.error}
          </p>
        ) : null}
        {state && "success" in state && state.success ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">
            {state.message}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
