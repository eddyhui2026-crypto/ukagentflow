"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  submitLettingPrequalAction,
  type PrequalFormState,
} from "@/app/prequal/[token]/actions";
import type { LettingPrequalFormLabels } from "@/lib/prequal/page-copy-config";

const initial: PrequalFormState = undefined;

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-950";

type Props = {
  token: string;
  address: string;
  postcode: string;
  labels: LettingPrequalFormLabels;
};

export function LettingPrequalForm({ token, address, postcode, labels: L }: Props) {
  const [state, formAction, pending] = useActionState(submitLettingPrequalAction, initial);

  return (
    <form action={formAction} className="space-y-5 text-left">
      <input type="hidden" name="prequal_url_token" value={token} />
      {state?.error ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.nameLabel} <span className="text-red-600">*</span>
        </label>
        <input
          name="name"
          required
          maxLength={200}
          autoComplete="name"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.emailLabel} <span className="text-red-600">*</span>
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{L.emailHint}</p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{L.phoneLabel}</label>
        <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.occupationLabel}
        </label>
        <input
          name="occupation"
          maxLength={200}
          placeholder={L.occupationPlaceholder}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.incomeLabel} <span className="text-red-600">*</span>
        </label>
        <select name="annual_income_band" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            {L.choosePlaceholder}
          </option>
          <option value="25k_plus">{L.income25k}</option>
          <option value="35k_plus">{L.income35k}</option>
          <option value="50k_plus">{L.income50k}</option>
          <option value="unspecified">{L.incomeUnspecified}</option>
        </select>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.petsLegend} <span className="text-red-600">*</span>
        </legend>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="has_pets" value="yes" required />
            {L.petsYes}
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="has_pets" value="no" />
            {L.petsNo}
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="has_pets" value="unspecified" />
            {L.petsUnspecified}
          </label>
        </div>
        <input
          name="pets_detail"
          maxLength={500}
          placeholder={L.petsDetailPlaceholder}
          className={inputClass}
        />
      </fieldset>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{L.moveInLabel}</label>
        <input name="target_move_in_date" type="date" className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{L.visaLabel}</label>
        <textarea
          name="visa_immigration_status"
          rows={3}
          maxLength={2000}
          placeholder={L.visaPlaceholder}
          className={inputClass}
        />
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {L.propertyPrefix} {address}, {postcode}
      </p>

      <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
        {pending ? L.submitPendingLabel : L.submitLabel}
      </Button>
    </form>
  );
}
