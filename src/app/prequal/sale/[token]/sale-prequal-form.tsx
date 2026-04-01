"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  submitSalePrequalAction,
  type SalePrequalFormState,
} from "@/app/prequal/sale/[token]/actions";
import type { SalePrequalFormLabels } from "@/lib/prequal/page-copy-config";

const initial: SalePrequalFormState = undefined;

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-950";

type Props = {
  token: string;
  address: string;
  postcode: string;
  labels: SalePrequalFormLabels;
};

export function SalePrequalForm({ token, address, postcode, labels: L }: Props) {
  const [state, formAction, pending] = useActionState(submitSalePrequalAction, initial);
  const [funding, setFunding] = useState<"mortgage" | "cash" | "">("");

  return (
    <form action={formAction} className="space-y-5 text-left">
      <input type="hidden" name="sale_prequal_url_token" value={token} />
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
          {L.buyingPositionLabel} <span className="text-red-600">*</span>
        </label>
        <select name="buying_position" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            {L.choosePlaceholder}
          </option>
          <option value="ftb">{L.buyingPositionFtb}</option>
          <option value="no_dependent_sale">{L.buyingPositionNoDependentSale}</option>
          <option value="sale_on_market">{L.buyingPositionSaleOnMarket}</option>
          <option value="sale_not_on_market">{L.buyingPositionSaleNotOnMarket}</option>
          <option value="sale_sold_stc">{L.buyingPositionSaleSoldStc}</option>
          <option value="unspecified">{L.buyingPositionUnspecified}</option>
        </select>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.fundingLegend} <span className="text-red-600">*</span>
        </legend>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="funding_type"
              value="mortgage"
              required
              checked={funding === "mortgage"}
              onChange={() => setFunding("mortgage")}
            />
            {L.fundingMortgage}
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="funding_type"
              value="cash"
              checked={funding === "cash"}
              onChange={() => setFunding("cash")}
            />
            {L.fundingCash}
          </label>
        </div>
      </fieldset>

      {funding === "mortgage" ? (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {L.dipLabel} <span className="text-red-600">*</span>
          </label>
          <select name="mortgage_dip_status" required className={inputClass}>
            <option value="" disabled>
              {L.choosePlaceholder}
            </option>
            <option value="have_dip">{L.dipHaveDip}</option>
            <option value="pending">{L.dipPending}</option>
            <option value="not_yet">{L.dipNotYet}</option>
          </select>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{L.dipHint}</p>
        </div>
      ) : null}
      {funding === "cash" ? (
        <input type="hidden" name="mortgage_dip_status" value="na" />
      ) : null}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.solicitorLabel} <span className="text-red-600">*</span>
        </label>
        <select name="solicitor_status" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            {L.choosePlaceholder}
          </option>
          <option value="instructed">{L.solicitorInstructed}</option>
          <option value="arranging">{L.solicitorArranging}</option>
          <option value="not_yet">{L.solicitorNotYet}</option>
          <option value="unspecified">{L.solicitorUnspecified}</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.targetPurchaseLabel} <span className="text-red-600">*</span>
        </label>
        <select name="target_purchase_band" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            {L.choosePlaceholder}
          </option>
          <option value="asap">{L.targetAsap}</option>
          <option value="1_3_months">{L.target1_3Months}</option>
          <option value="3_6_months">{L.target3_6Months}</option>
          <option value="6_plus_months">{L.target6PlusMonths}</option>
          <option value="researching">{L.targetResearching}</option>
          <option value="unspecified">{L.targetUnspecified}</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.additionalNotesLabel}
        </label>
        <textarea
          name="additional_notes"
          rows={4}
          maxLength={4000}
          placeholder={L.additionalNotesPlaceholder}
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
