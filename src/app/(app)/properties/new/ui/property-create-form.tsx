"use client";

import { useActionState, useState } from "react";
import {
  createPropertyAction,
  type PropertyFormState,
} from "../../actions";
import { Button } from "@/components/ui/button";
import { CloudinaryImageField } from "@/components/cloudinary-image-field";
import { UkPostcodeStreetFields } from "@/components/uk-postcode-street-fields";
import { propertyStatusOptions } from "@/lib/properties/status";

const initial: PropertyFormState = undefined;

const hasGoogleKey = Boolean(
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim(),
);

export function PropertyCreateForm() {
  const [state, formAction, pending] = useActionState(
    createPropertyAction,
    initial,
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [listingType, setListingType] = useState<"sale" | "letting">("sale");
  const statusOptions = propertyStatusOptions(listingType);

  return (
    <form
      action={formAction}
      className="space-y-4"
      onSubmit={(e) => {
        if (!hasGoogleKey) {
          return;
        }
        const fd = new FormData(e.currentTarget);
        const mode = String(fd.get("address_entry_mode") ?? "search");
        const addr = String(fd.get("address") ?? "").trim();
        const pc = String(fd.get("postcode") ?? "").trim();
        if (!pc || !addr) {
          e.preventDefault();
          setLocalError(
            mode === "manual"
              ? "Enter both address and postcode."
              : "Confirm the postcode with Search, then complete street details—or use Enter manually.",
          );
          return;
        }
        setLocalError(null);
      }}
    >
      {hasGoogleKey ? (
        <>
          <UkPostcodeStreetFields disabled={pending} />
          {localError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {localError}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
            Set <code className="font-mono text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
            for postcode lookup. For now, enter everything manually.
          </p>
          <div className="space-y-1.5">
            <label htmlFor="address" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              placeholder="e.g. 12 High Street"
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-offset-zinc-950"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="postcode" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Postcode
            </label>
            <input
              id="postcode"
              name="postcode"
              type="text"
              required
              placeholder="e.g. SW1A 1AA"
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-offset-zinc-950"
            />
          </div>
        </>
      )}

      <CloudinaryImageField
        name="hero_image_url"
        label="Listing photo (optional)"
        kind="property_hero_draft"
        initialUrl={null}
        formDisabled={pending}
        helperText="Compressed in the browser and uploaded to Cloudinary. You can change it later on the property page."
      />

      <div className="space-y-1.5">
        <label htmlFor="listing_type" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Listing type
        </label>
        <select
          id="listing_type"
          name="listing_type"
          value={listingType === "letting" ? "letting" : "sale"}
          onChange={(e) =>
            setListingType(e.target.value === "letting" ? "letting" : "sale")
          }
          className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-offset-zinc-950"
        >
          <option value="sale">For sale (buyer feedback)</option>
          <option value="letting">To let (tenant feedback)</option>
        </select>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Tenant viewings use the lettings feedback form and labels from Settings → Lettings.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="vendor_name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Vendor / landlord name
        </label>
        <input
          id="vendor_name"
          name="vendor_name"
          type="text"
          required
          className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-offset-zinc-950"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="status" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Instruction status
        </label>
        <select
          id="status"
          name="status"
          key={listingType}
          defaultValue="active"
          className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-offset-zinc-950"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {listingType === "sale"
            ? "Use Under offer (STC) once an offer is agreed subject to contract."
            : "Use Let agreed for a tenancy agreed subject to references / deposit."}
        </p>
      </div>
      {state?.error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save property"}
      </Button>
    </form>
  );
}
