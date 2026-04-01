"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  INVITE_EMAIL_PREVIEW_SAMPLE_PROPERTY_IMAGE_URL,
  splitSamplePropertyLineForInvitePreview,
} from "@/lib/email/invite-preview-samples";
import {
  resolvedLettingsFeedbackFormCopyFromFormData,
  type LettingsFeedbackFormCopyResolved,
} from "@/lib/feedback/lettings-form-config";
import {
  LETTINGS_HIGHLIGHT_KEYS,
  LETTINGS_HIGHLIGHT_LABELS,
  LETTINGS_NEGATIVE_KEYS,
  LETTINGS_NEGATIVE_LABELS,
} from "@/lib/feedback/lettings-extended-fields";
import { cn } from "@/lib/utils";

const SAMPLE_BUYER_NAME = "Jordan Example";
const SAMPLE_PROPERTY_LINE = "12 Sample Street, London, SW1A 1AA";

const INCOME_HINT =
  "Many landlords look for roughly 30× the monthly rent in gross household income — optional here.";

function LettingsBuyerFormVisualPreview({ copy }: { copy: LettingsFeedbackFormCopyResolved }) {
  const L = copy.labels;
  const { address, postcode } =
    splitSamplePropertyLineForInvitePreview(SAMPLE_PROPERTY_LINE);
  const demoHighlightKey = LETTINGS_HIGHLIGHT_KEYS[0]!;
  const demoNegativeKey = LETTINGS_NEGATIVE_KEYS[0]!;

  return (
    <div
      className="pointer-events-none select-none text-left [&_button]:cursor-default [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none"
      aria-hidden
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-700 dark:text-zinc-300">Step 1 of 2</span>
          <span>Quick answers</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div className="h-full w-[50%] rounded-full bg-sky-600" />
        </div>
      </div>

      <div
        className={cn(
          "mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40",
        )}
      >
        <div className="flex gap-4 p-4 sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={INVITE_EMAIL_PREVIEW_SAMPLE_PROPERTY_IMAGE_URL}
              alt=""
              className="h-full w-full object-cover"
              width={96}
              height={96}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {address}
            </p>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{postcode}</p>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">Hi {SAMPLE_BUYER_NAME}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {L.ratingLegend}
          </legend>
          <div className="flex flex-wrap gap-1">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <span key={n} className="rounded-md p-0.5">
                <span
                  className={cn(
                    "block text-[2.25rem] leading-none sm:text-[2.5rem]",
                    n <= 4 ? "text-amber-400" : "text-zinc-200 dark:text-zinc-700",
                  )}
                >
                  ★
                </span>
              </span>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {L.interestLegend}
          </legend>
          <div className="flex flex-col gap-2">
            {(
              [
                { v: "hot", label: L.interestHot, on: false },
                { v: "warm", label: L.interestWarm, on: true },
                { v: "cold", label: L.interestCold, on: false },
              ] as const
            ).map(({ v, label, on }) => (
              <div
                key={v}
                className={cn(
                  "flex justify-center rounded-full border px-4 py-2.5 text-center text-sm font-medium",
                  on
                    ? "border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-600"
                    : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950",
                )}
              >
                {label}
              </div>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{L.rentLegend}</p>
          <div className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200">
            {L.rentFair}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{L.moveInLegend}</p>
          <div className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
            yyyy-mm-dd
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{L.occupantsLegend}</p>
          <div className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
            Prefer not to say
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{L.petsLegend}</legend>
          <div className="flex flex-col gap-2">
            {(
              [
                { label: L.petsUnspecified, on: true },
                { label: L.petsNo, on: false },
                { label: L.petsYes, on: false },
              ] as const
            ).map(({ label, on }) => (
              <div
                key={label}
                className={cn(
                  "flex justify-center rounded-full border px-4 py-2.5 text-center text-sm font-medium",
                  on
                    ? "border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-600"
                    : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950",
                )}
              >
                {label}
              </div>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {L.incomeLegend}
            </span>
            <span className="inline-flex text-zinc-400 dark:text-zinc-500" title={INCOME_HINT}>
              <Info className="size-4" />
            </span>
          </div>
          <div className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
            {L.incomeUnspecified}
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-10 dark:border-zinc-700">
          <div className="w-full rounded-lg bg-sky-600 py-3 text-center text-[15px] font-semibold text-white dark:bg-sky-600">
            Continue
          </div>
        </div>
      </div>

      <p className="mt-8 border-t border-zinc-200 pt-6 text-center text-xs font-medium uppercase tracking-wide text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
        Step 2 (sample layout)
      </p>

      <div className="mt-4 space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {L.highlightsLegend}
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div
              className={cn(
                "flex min-h-[44px] items-center justify-center rounded-full border px-3 py-2.5 text-center text-sm font-medium",
                "border-sky-600 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/45 dark:text-sky-100",
              )}
            >
              {LETTINGS_HIGHLIGHT_LABELS[demoHighlightKey]}
            </div>
            <div className="hidden sm:block" />
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {L.negativesLegend}
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div
              className={cn(
                "flex min-h-[44px] items-center justify-center rounded-full border px-3 py-2.5 text-center text-sm font-medium",
                "border-sky-600 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/45 dark:text-sky-100",
              )}
            >
              {LETTINGS_NEGATIVE_LABELS[demoNegativeKey]}
            </div>
          </div>
        </fieldset>

        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {L.landlordMessageLegend}
          </p>
          <div className="h-20 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900/40" />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{L.applyLegend}</legend>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 justify-center rounded-full border border-sky-600 bg-sky-600 px-4 py-3 text-center text-sm font-medium text-white dark:border-sky-500 dark:bg-sky-600">
              {L.applyYes}
            </div>
            <div className="flex flex-1 justify-center rounded-full border border-zinc-300 bg-white px-4 py-3 text-center text-sm font-medium dark:border-zinc-600 dark:bg-zinc-950">
              {L.applyNo}
            </div>
          </div>
        </fieldset>

        <div className="border-t border-zinc-200 pt-10 dark:border-zinc-700">
          <div className="w-full rounded-lg bg-sky-600 py-3 text-center text-base font-semibold text-white dark:bg-sky-600">
            {L.submitLabel}
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-zinc-500 dark:text-zinc-500">
        Sample tenant &amp; property. &quot;What stood out&quot; / &quot;concerned&quot; chip texts stay
        in English; your custom copy applies to titles, intros, stars, rent, move-in, pets, income, and
        buttons.
      </p>
    </div>
  );
}

export function LettingsFeedbackFormSettingsPreview({
  mergedCopy,
}: {
  mergedCopy: LettingsFeedbackFormCopyResolved;
}) {
  const [previewCopy, setPreviewCopy] = useState<LettingsFeedbackFormCopyResolved>(mergedCopy);

  useEffect(() => {
    setPreviewCopy(mergedCopy);
  }, [mergedCopy]);

  function refreshFromForm() {
    const form = document.getElementById("lfc-settings-form");
    if (!form || !(form instanceof HTMLFormElement)) return;
    setPreviewCopy(resolvedLettingsFeedbackFormCopyFromFormData(new FormData(form)));
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/30">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Lettings buyer preview (sample data)
        </h3>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          See how your title, intro, subtitle, and labels look on the rental two-step feedback page.
          Refresh after editing fields (you don&apos;t need to save first).
        </p>
        <Button
          type="button"
          className="mt-3"
          variant="outline"
          size="sm"
          onClick={refreshFromForm}
        >
          Refresh preview
        </Button>
      </div>
      <div className="max-h-[min(85vh,720px)] overflow-y-auto p-4">
        <div className="min-h-[200px] rounded-lg bg-zinc-100 px-3 py-6 dark:bg-zinc-950/80 sm:px-5">
          <div className="mx-auto w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="text-center text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {previewCopy.pageTitle}
            </h2>
            <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
              {previewCopy.pageSubtitle}
            </p>
            {previewCopy.intro ? (
              <div className="mt-5 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm whitespace-pre-wrap text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
                {previewCopy.intro}
              </div>
            ) : null}
            <div className="mt-6">
              <LettingsBuyerFormVisualPreview copy={previewCopy} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
