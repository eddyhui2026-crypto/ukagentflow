"use client";

import { useActionState, useState } from "react";
import { Info } from "lucide-react";
import { submitLettingsFeedbackAction, type LettingsFeedbackFormState } from "./lettings-actions";
import { Button } from "@/components/ui/button";
import type { LettingsFeedbackFormCopyResolved } from "@/lib/feedback/lettings-form-config";
import {
  LETTINGS_HIGHLIGHT_KEYS,
  LETTINGS_HIGHLIGHT_LABELS,
  LETTINGS_NEGATIVE_KEYS,
  LETTINGS_NEGATIVE_LABELS,
} from "@/lib/feedback/lettings-extended-fields";
import { cn } from "@/lib/utils";

const initial: LettingsFeedbackFormState = undefined;

const INCOME_HINT =
  "Many landlords look for roughly 30× the monthly rent in gross household income — optional here.";

type Props = {
  token: string;
  buyerName: string;
  propertyAddress: string;
  propertyPostcode: string;
  propertyImageUrl: string | null;
  copy: LettingsFeedbackFormCopyResolved;
};

export function LettingsFeedbackForm({
  token,
  buyerName,
  propertyAddress,
  propertyPostcode,
  propertyImageUrl,
  copy,
}: Props) {
  const L = copy.labels;
  const [state, formAction, pending] = useActionState(submitLettingsFeedbackAction, initial);
  const [step, setStep] = useState<1 | 2>(1);
  const [rating, setRating] = useState<number | null>(null);
  const [petsChoice, setPetsChoice] = useState<"unspecified" | "no" | "yes">("unspecified");
  const [step1Error, setStep1Error] = useState<string | null>(null);

  const isGlowing = rating === 5;

  function goStep2() {
    setStep1Error(null);
    if (rating == null || rating < 1 || rating > 5) {
      setStep1Error("Please rate the property with the stars.");
      return;
    }
    const form = document.getElementById("lettings-feedback-form") as HTMLFormElement | null;
    if (!form) return;
    const interest = form.querySelector<HTMLInputElement>('input[name="interest_level"]:checked');
    const price = (form.querySelector("#rent_opinion") as HTMLSelectElement | null)?.value;
    if (!interest) {
      setStep1Error("Please say how interested you are in renting.");
      return;
    }
    if (!price) {
      setStep1Error("Please choose what you think about the rent.");
      return;
    }
    setStep(2);
  }

  return (
    <form
      id="lettings-feedback-form"
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
          <span>{step === 1 ? "Quick answers" : "Your notes"}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
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
          <label htmlFor="rent_opinion" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {L.rentLegend}
          </label>
          <select
            id="rent_opinion"
            name="rent_opinion"
            required
            defaultValue=""
            className="w-full rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-zinc-600 dark:bg-zinc-950"
          >
            <option value="" disabled>
              Select one…
            </option>
            <option value="great_value">{L.rentGreatValue}</option>
            <option value="fair">{L.rentFair}</option>
            <option value="slightly_high">{L.rentSlightlyHigh}</option>
            <option value="too_high">{L.rentTooExpensive}</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="target_move_in" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {L.moveInLegend}
          </label>
          <input
            id="target_move_in"
            name="target_move_in_date"
            type="date"
            className="w-full rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-zinc-600 dark:bg-zinc-950"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="occupant_count" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {L.occupantsLegend}
          </label>
          <select
            id="occupant_count"
            name="occupant_count"
            defaultValue=""
            className="w-full rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-zinc-600 dark:bg-zinc-950"
          >
            <option value="">Prefer not to say</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4_plus">4+</option>
          </select>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{L.petsLegend}</legend>
          <div className="flex flex-col gap-2">
            {(
              [
                { v: "unspecified" as const, label: L.petsUnspecified },
                { v: "no" as const, label: L.petsNo },
                { v: "yes" as const, label: L.petsYes },
              ] as const
            ).map(({ v, label }) => (
              <label
                key={v}
                className={cn(
                  "flex cursor-pointer justify-center rounded-full border px-4 py-2.5 text-center text-sm font-medium",
                  "has-[:checked]:border-sky-600 has-[:checked]:bg-sky-600 has-[:checked]:text-white",
                  "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950",
                )}
              >
                <input
                  type="radio"
                  name="has_pets"
                  value={v}
                  checked={petsChoice === v}
                  className="sr-only"
                  onChange={() => setPetsChoice(v)}
                />
                {label}
              </label>
            ))}
          </div>
          {petsChoice === "yes" ? (
            <input
              name="pets_detail"
              type="text"
              placeholder={L.petsSpecifyHint}
              className="mt-2 w-full rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-zinc-600 dark:bg-zinc-950"
            />
          ) : null}
        </fieldset>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <label htmlFor="household_income" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {L.incomeLegend}
            </label>
            <span className="inline-flex text-zinc-400 dark:text-zinc-500" title={INCOME_HINT}>
              <Info className="size-4" aria-hidden />
              <span className="sr-only">{INCOME_HINT}</span>
            </span>
          </div>
          <select
            id="household_income"
            name="household_income_band"
            defaultValue="unspecified"
            className="w-full rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-zinc-600 dark:bg-zinc-950"
          >
            <option value="unspecified">{L.incomeUnspecified}</option>
            <option value="25k_plus">{L.income25k}</option>
            <option value="35k_plus">{L.income35k}</option>
            <option value="50k_plus">{L.income50k}</option>
          </select>
        </div>

        {step1Error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="status">
            {step1Error}
          </p>
        ) : null}

        <div className="border-t border-zinc-200 pt-10 dark:border-zinc-700">
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

      <div className={cn("space-y-6", step !== 2 && "hidden")} aria-hidden={step !== 2}>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {L.highlightsLegend}
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {LETTINGS_HIGHLIGHT_KEYS.map((key) => (
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
                  name="lettings_property_highlights"
                  value={key}
                  className="sr-only"
                />
                <span>{LETTINGS_HIGHLIGHT_LABELS[key]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {!isGlowing ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {L.negativesLegend}
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {LETTINGS_NEGATIVE_KEYS.map((key) => (
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
                    name="lettings_negative_tags"
                    value={key}
                    className="sr-only"
                  />
                  <span>{LETTINGS_NEGATIVE_LABELS[key]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="landlord_msg" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {L.landlordMessageLegend}
          </label>
          <textarea
            id="landlord_msg"
            name="comment"
            rows={4}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-zinc-600 dark:bg-zinc-950"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{L.applyLegend}</legend>
          <div className="flex flex-col gap-2 sm:flex-row">
            {(
              [
                { v: "yes" as const, label: L.applyYes },
                { v: "no" as const, label: L.applyNo },
              ] as const
            ).map(({ v, label }) => (
              <label
                key={v}
                className={cn(
                  "flex flex-1 cursor-pointer justify-center rounded-full border px-4 py-3 text-center text-sm font-medium",
                  "has-[:checked]:border-sky-600 has-[:checked]:bg-sky-600 has-[:checked]:text-white",
                  "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950",
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
