"use client";

/// <reference types="google.maps" />

import { useCallback, useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function composeAddressLine(buildingBit: string, streetLine: string) {
  const b = buildingBit.trim();
  const s = streetLine.trim();
  if (!s) {
    return b;
  }
  if (!b) {
    return s;
  }
  return `${b}, ${s}`;
}

function streetHintFromGeocodeResult(
  result: google.maps.GeocoderResult,
): string {
  const parts: string[] = [];
  let route = "";
  let neighborhood = "";
  let sublocality = "";
  let locality = "";
  let postalTown = "";
  let admin2 = "";

  for (const c of result.address_components ?? []) {
    const t = c.types;
    if (t.includes("route")) {
      route = c.long_name;
    }
    if (t.includes("neighborhood")) {
      neighborhood = c.long_name;
    }
    if (t.includes("sublocality") || t.includes("sublocality_level_1")) {
      sublocality = c.long_name;
    }
    if (t.includes("locality")) {
      locality = c.long_name;
    }
    if (t.includes("postal_town")) {
      postalTown = c.long_name;
    }
    if (t.includes("administrative_area_level_2")) {
      admin2 = c.long_name;
    }
  }

  if (neighborhood && !parts.includes(neighborhood)) {
    parts.push(neighborhood);
  }
  if (sublocality && !parts.includes(sublocality)) {
    parts.push(sublocality);
  }
  if (route) {
    parts.push(route);
  }
  const town = postalTown || locality || admin2;
  if (town && !parts.some((p) => p.includes(town))) {
    parts.push(town);
  }

  return parts.filter(Boolean).join(", ");
}

type EntryMode = "search" | "manual";

type Props = {
  disabled?: boolean;
};

export function UkPostcodeStreetFields({ disabled }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  const streetInputRef = useRef<HTMLInputElement>(null);

  const [entryMode, setEntryMode] = useState<EntryMode>("search");

  const [manualAddress, setManualAddress] = useState("");
  const [manualPostcode, setManualPostcode] = useState("");

  const [postcodeInput, setPostcodeInput] = useState("");
  const [postcodeVerified, setPostcodeVerified] = useState(false);
  const [normalizedPostcode, setNormalizedPostcode] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [buildingLine, setBuildingLine] = useState("");
  const [streetLine, setStreetLine] = useState("");

  const combinedAddress = composeAddressLine(buildingLine, streetLine);

  const goManual = useCallback(() => {
    setEntryMode("manual");
    setLookupError(null);
    setLookupLoading(false);
    setPostcodeVerified(false);
    setNormalizedPostcode("");
    setPostcodeInput("");
    setBuildingLine("");
    setStreetLine("");
  }, []);

  const goSearch = useCallback(() => {
    setEntryMode("search");
    setManualAddress("");
    setManualPostcode("");
    setLookupError(null);
  }, []);

  useEffect(() => {
    if (entryMode !== "search" || !postcodeVerified || disabled) {
      return;
    }
    const t = requestAnimationFrame(() => {
      streetInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(t);
  }, [entryMode, postcodeVerified, disabled, normalizedPostcode]);

  const runLookup = useCallback(async () => {
    if (!apiKey) {
      setLookupError("Missing Google Maps API key.");
      return;
    }

    const raw = postcodeInput.trim();
    if (!raw) {
      setLookupError("Enter a postcode first.");
      setPostcodeVerified(false);
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setBuildingLine("");
    setStreetLine("");

    try {
      setOptions({ key: apiKey, v: "weekly" });
      await importLibrary("geocoding");

      const geocoder = new google.maps.Geocoder();
      const { results, status } = await new Promise<{
        results: google.maps.GeocoderResult[] | null;
        status: google.maps.GeocoderStatus;
      }>((resolve) => {
        geocoder.geocode(
          {
            address: `${raw}, United Kingdom`,
            componentRestrictions: { country: "gb" },
            region: "GB",
          },
          (results, status) => {
            resolve({ results, status });
          },
        );
      });

      if (status !== "OK" || !results?.length) {
        setPostcodeVerified(false);
        setNormalizedPostcode("");
        setLookupError(
          "Could not find that postcode. Check spelling, try a fuller UK postcode, or use manual entry.",
        );
        return;
      }

      const first = results[0];
      let pcOut = raw.toUpperCase().replace(/\s+/g, " ").trim();
      for (const c of first.address_components ?? []) {
        if (c.types.includes("postal_code")) {
          pcOut = c.long_name.toUpperCase().replace(/\s+/g, " ").trim();
          break;
        }
      }

      const hint = streetHintFromGeocodeResult(first);
      setStreetLine(hint);
      setNormalizedPostcode(pcOut);
      setPostcodeVerified(true);
      setLookupError(null);
    } catch {
      setPostcodeVerified(false);
      setNormalizedPostcode("");
      setLookupError(
        "Postcode lookup failed. Check Geocoding API for this key, or use manual entry.",
      );
    } finally {
      setLookupLoading(false);
    }
  }, [apiKey, postcodeInput]);

  if (!apiKey) {
    return null;
  }

  const formBusy = Boolean(disabled);
  const streetBlockActive = postcodeVerified && !formBusy;

  if (entryMode === "manual") {
    return (
      <div className="space-y-4">
        <input type="hidden" name="address_entry_mode" value="manual" />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Manual address
          </p>
          <button
            type="button"
            disabled={formBusy}
            onClick={goSearch}
            className={cn(
              "text-sm font-medium text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400",
            )}
          >
            Use postcode search instead
          </button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          If Google can&apos;t find the postcode, type the property address and postcode yourself.
        </p>

        <div className="space-y-1.5">
          <label
            htmlFor="manual-address"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Address (street &amp; door number)
          </label>
          <input
            id="manual-address"
            name="address"
            type="text"
            required
            disabled={formBusy}
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="e.g. 12 High Street, Ryhope"
            className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="manual-postcode"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Postcode
          </label>
          <input
            id="manual-postcode"
            name="postcode"
            type="text"
            required
            disabled={formBusy}
            value={manualPostcode}
            onChange={(e) => setManualPostcode(e.target.value.toUpperCase())}
            placeholder="e.g. SR4 8EU"
            className="flex h-10 max-w-[14rem] rounded-md border border-zinc-300 bg-white px-3 text-sm uppercase outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="address_entry_mode" value="search" />
      <input type="hidden" name="address" value={combinedAddress} />
      <input type="hidden" name="postcode" value={normalizedPostcode} />

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="postcode-lookup"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Postcode
          </label>
          <button
            type="button"
            disabled={formBusy}
            onClick={goManual}
            className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
          >
            Enter manually instead
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <input
            id="postcode-lookup"
            type="text"
            autoCapitalize="characters"
            autoComplete="postal-code"
            disabled={formBusy || lookupLoading}
            value={postcodeInput}
            onChange={(e) => {
              setPostcodeInput(e.target.value);
              setPostcodeVerified(false);
              setNormalizedPostcode("");
              setLookupError(null);
              setBuildingLine("");
              setStreetLine("");
            }}
            placeholder="e.g. SW1A 1AA"
            className="flex h-10 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm uppercase outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-950 sm:max-w-[14rem]"
          />
          <Button
            type="button"
            variant="outline"
            disabled={formBusy || lookupLoading || !postcodeInput.trim()}
            onClick={() => void runLookup()}
            className="shrink-0 sm:w-auto"
          >
            {lookupLoading ? "Searching…" : "Search postcode"}
          </Button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Enter your UK postcode and press Search. We&apos;ll suggest a street or area when
          Google finds one — then add or edit the door number.
        </p>
        {lookupError ? (
          <div className="space-y-2">
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {lookupError}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={formBusy}
              onClick={goManual}
            >
              Enter address manually
            </Button>
          </div>
        ) : null}
        {postcodeVerified ? (
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Postcode OK — {normalizedPostcode}. Fill in flat (optional) and street below.
          </p>
        ) : null}
      </div>

      {postcodeVerified ? (
        <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="space-y-1.5">
            <label
              htmlFor="door-flat"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Flat / unit (optional)
            </label>
            <input
              id="door-flat"
              type="text"
              readOnly={!streetBlockActive}
              value={buildingLine}
              onChange={(e) => setBuildingLine(e.target.value)}
              placeholder="e.g. Flat 12"
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 read-only:cursor-not-allowed read-only:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="street-line"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Door number &amp; street
            </label>
            <input
              ref={streetInputRef}
              id="street-line"
              type="text"
              readOnly={!streetBlockActive}
              value={streetLine}
              onChange={(e) => setStreetLine(e.target.value)}
              placeholder="e.g. 42 Baker Street (edit the hint Google filled in)"
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 read-only:cursor-not-allowed read-only:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
            {!streetLine.trim() ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                If this is empty, type the full street line including the door number.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
