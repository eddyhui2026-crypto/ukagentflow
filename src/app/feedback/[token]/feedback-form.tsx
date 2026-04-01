"use client";

import { useActionState, useState } from "react";
import { Info } from "lucide-react";
import { submitFeedbackAction, type FeedbackFormState } from "./actions";
import { Button } from "@/components/ui/button";
import type { FeedbackFormCopyResolved } from "@/lib/feedback/form-config";
import {
  HIGHLIGHT_KEYS,
  HIGHLIGHT_LABELS,
  NEGATIVE_KEYS,
  NEGATIVE_LABELS,
} from "@/lib/feedback/extended-fields";
import { cn } from "@/lib/utils";

const initial: FeedbackFormState = undefined;

const PRIVACY_HINT =
  "This helps the agent prioritize your offer if you decide to move forward.";

type Props = {
  token: string;
  buyerName: string;
  propertyAddress: string;
  propertyPostcode: string;
  propertyImageUrl: string | null;
  copy: FeedbackFormCopyResolved;
};

export function FeedbackForm({
  token,
  buyerName,
  propertyAddress,
  propertyPostcode,
  propertyImageUrl,
  copy,
}: Props) {
  const L = copy.labels;
  const [state, formAction, pending] = useActionState(submitFeedbackAction, initial);
  const [step, setStep] = useState<1 | 2>(1);
  const [rating, setRating] = useState<number | null>(null);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  const isGlowing = rating === 5;

  function goStep2() {
    setStep1Error(null);
    if (rating == null || rating < 1 || rating > 5) {
      setStep1Error("Please rate the property with the stars.");
      return;
    }
    const form = document.getElementById("buyer-feedback-form") as HTMLFormElement | null;
    if (!form) return;
    const interest = form.querySelector<HTMLInputElement>('input[name="interest_level"]:checked');
    const price = (form.querySelector("#price_opinion") as HTMLSelectElement | null)?.value;
    if (!interest) {
      setStep1Error("Please say how interested you are.");
      return;
    }
    if (!price) {
      setStep1Error("Please choose what you think about the price.");
      return;
    }
    setStep(2);
  }

  return (
    <form
      id="buyer-feedback-form"
      action={formAction}
      className="space-y-6 text-left"
      onSubmit={(e) => {
        if (step !== 2) e.preventDefault();
      }}
    >
      <input type="hidden" name="feedback_token" value={token} />
      <input type="hidden" name="rating" value={rating ?? ""} required={step === 2} />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-700 dark:text-zinc-300">Step {step} of 2</span>
          <span>{step === 1 ? "Quick questions" : "Your notes"}</span>
        </div>
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={2}
        >
          <div
            className="h-full rounded-full bg-sky-600 transition-all duration-300 ease-out"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-white dark:bg-zinc-950/40",
          propertyImageUrl
            ? "border-zinc-200 dark:border-zinc-800"
            : "border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900/50",
        )}
      >
        <div
          className={cn(
            "flex gap-4 p-4",
            !propertyImageUrl && "flex-col items-center text-center",
            propertyImageUrl && "sm:items-center",
          )}
        >
          {propertyImageUrl ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={propertyImageUrl}
                alt=""
                className="h-full w-full object-cover"
                width={96}
                height={96}
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {propertyAddress}
            </p>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{propertyPostcode}</p>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">Hi {buyerName}</p>
          </div>
        </div>
      </div>

      <div className={cn("space-y-6", step !== 1 && "hidden")} aria-hidden={step !== 1}>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {L.ratingLegend}
          </legend>
          <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-label={L.ratingLegend}>
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <button
                key={n}
                type="button"
                className="rounded-md p-0.5 transition-transform active:scale-95"
                aria-pressed={rating === n}
                aria-label={`${n} ${n === 1 ? L.ratingStarSingular : L.ratingStarsPlural}`}
                onClick={() => setRating(n)}
              >
                <span
                  className={cn(
                    "block text-[2.25rem] leading-none transition-colors select-none sm:text-[2.5rem]",
                    rating != null && n <= rating
                      ? "text-amber-400 drop-shadow-[0_1px_0_rgba(0,0,0,0.08)]"
                      : "text-zinc-200 dark:text-zinc-700",
                  )}
                >
                  ★
                </span>
              </button>
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
                { v: "hot" as const, label: L.interestHot },
                { v: "warm" as const, label: L.interestWarm },
                { v: "cold" as const, label: L.interestCold },
              ] as const
            ).map(({ v, label }) => (
              <label
                key={v}
                className={cn(
                  "flex cursor-pointer justify-center rounded-full border px-4 py-2.5 text-center text-sm font-medium transition-colors",
                  "has-[:checked]:border-sky-600 has-[:checked]:bg-sky-600 has-[:checked]:text-white",
                  "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950",
                  "dark:has-[:checked]:border-sky-500 dark:has-[:checked]:bg-sky-600",
                )}
              >
                <input
                  type="radio"
                  name="interest_level"
                  value={v}
                  required
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <label
            htmlFor="price_opinion"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            {L.priceLegend}
          </label>
          <select
            id="price_opinion"
            name="price_opinion"
            required
            defaultValue=""
            className="w-full rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-zinc-600 dark:bg-zinc-950"
          >
            <option value="" disabled>
              Select one…
            </option>
            <option value="too_high">{L.priceTooHigh}</option>
            <option value="fair">{L.priceFair}</option>
            <option value="good_value">{L.priceGoodValue}</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="buyer_position"
              className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Your buying position{" "}
              <span className="font-normal text-zinc-500">(optional)</span>
            </label>
            <span
              className="inline-flex text-zinc-400 dark:text-zinc-500"
              title={PRIVACY_HINT}
            >
              <Info className="size-4" aria-hidden />
              <span className="sr-only">{PRIVACY_HINT}</span>
            </span>
          </div>
          <select
            id="buyer_position"
            name="buyer_position"
            defaultValue="unspecified"
            className="w-full rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-zinc-600 dark:bg-zinc-950"
          >
            <option value="unspecified">Prefer not to say</option>
            <option value="first_time_buyer">First-time buyer</option>
            <option value="chain_free">Chain-free (nothing to sell)</option>
            <option value="cash_buyer">Cash buyer</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <label htmlFor="has_aip" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Mortgage agreement in principle (AIP)?{" "}
              <span className="font-normal text-zinc-500">(optional)</span>
            </label>
            <span
              className="inline-flex text-zinc-400 dark:text-zinc-500"
              title={PRIVACY_HINT}
            >
              <Info className="size-4" aria-hidden />
              <span className="sr-only">{PRIVACY_HINT}</span>
            </span>
          </div>
          <select
            id="has_aip"
            name="has_aip"
            defaultValue="unspecified"
            className="w-full rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-zinc-600 dark:bg-zinc-950"
          >
            <option value="unspecified">Prefer not to say</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div className="border-t border-zinc-200 pt-10 dark:border-zinc-700">
          {step1Error ? (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="status">
              {step1Error}
            </p>
          ) : null}
          <Button
            type="button"
            className="w-full bg-sky-600 text-[15px] font-semibold text-white hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500"
            size="lg"
            onClick={goStep2}
          >
            Continue
          </Button>
        </div>
      </div>

      {/* Step 2 */}
      <div className={cn("space-y-6", step !== 2 && "hidden")} aria-hidden={step !== 2}>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            What stood out positively?{" "}
            <span className="font-normal text-zinc-500">(pick any)</span>
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {HIGHLIGHT_KEYS.map((key) => (
              <label
                key={key}
                className={cn(
                  "flex min-h-[44px] cursor-pointer items-center justify-center rounded-full border px-3 py-2.5 text-center text-sm font-medium transition-colors",
                  "has-[:checked]:border-sky-600 has-[:checked]:bg-sky-50 has-[:checked]:text-sky-900",
                  "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950",
                  "dark:has-[:checked]:border-sky-500 dark:has-[:checked]:bg-sky-950/45 dark:has-[:checked]:text-sky-100",
                )}
              >
                <input
                  type="checkbox"
                  name="property_highlights"
                  value={key}
                  className="sr-only"
                />
                <span>{HIGHLIGHT_LABELS[key]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {!isGlowing ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              What concerned you?{" "}
              <span className="font-normal text-zinc-500">(pick any)</span>
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {NEGATIVE_KEYS.map((key) => (
                <label
                  key={key}
                  className={cn(
                    "flex min-h-[44px] cursor-pointer items-center justify-center rounded-full border px-3 py-2.5 text-center text-sm font-medium transition-colors",
                    "has-[:checked]:border-sky-600 has-[:checked]:bg-sky-50 has-[:checked]:text-sky-900",
                    "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950",
                    "dark:has-[:checked]:border-sky-500 dark:has-[:checked]:bg-sky-950/45 dark:has-[:checked]:text-sky-100",
                  )}
                >
                  <input
                    type="checkbox"
                    name="negative_feedback_tags"
                    value={key}
                    className="sr-only"
                  />
                  <span>{NEGATIVE_LABELS[key]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="liked" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {L.likedLabel}
          </label>
          <textarea
            id="liked"
            name="liked_text"
            rows={3}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-zinc-600 dark:bg-zinc-950"
          />
        </div>

        {!isGlowing ? (
          <div className="space-y-2">
            <label
              htmlFor="disliked"
              className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              {L.dislikedLabel}
            </label>
            <textarea
              id="disliked"
              name="disliked_text"
              rows={3}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
        ) : null}

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {L.secondViewingLegend}
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row">
            {(
              [
                { v: "yes" as const, label: L.secondViewingYes },
                { v: "no" as const, label: L.secondViewingNo },
              ] as const
            ).map(({ v, label }) => (
              <label
                key={v}
                className={cn(
                  "flex flex-1 cursor-pointer justify-center rounded-full border px-4 py-3 text-center text-sm font-medium",
                  "has-[:checked]:border-sky-600 has-[:checked]:bg-sky-600 has-[:checked]:text-white",
                  "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950",
                  "dark:has-[:checked]:border-sky-500 dark:has-[:checked]:bg-sky-600",
                )}
              >
                <input
                  type="radio"
                  name="wants_second_viewing"
                  value={v}
                  required
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {state && "error" in state ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="border-t border-zinc-200 pt-10 dark:border-zinc-700">
          <div className="flex flex-col gap-4 sm:flex-row-reverse sm:gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={pending}
              className="min-h-12 w-full flex-1 bg-sky-600 px-8 text-base font-semibold text-white hover:bg-sky-700 sm:min-w-[12rem] dark:bg-sky-600 dark:hover:bg-sky-500"
            >
              {pending ? L.submitPendingLabel : L.submitLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              disabled={pending}
              onClick={() => {
                setStep(1);
                setStep1Error(null);
              }}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
