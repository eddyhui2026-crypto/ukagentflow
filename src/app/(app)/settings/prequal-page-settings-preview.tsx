"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  resolvedLettingPrequalSettingsFromFormData,
  resolvedSalePrequalSettingsFromFormData,
  type LettingPrequalSettingsResolved,
  type SalePrequalSettingsResolved,
} from "@/lib/prequal/page-copy-config";

const SAMPLE_ADDRESS = "12 Sample Street, London";
const SAMPLE_POSTCODE = "SW1A 1AA";

const inputRo =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";

function SaleQuestionnaireFieldsPreview({ settings }: { settings: SalePrequalSettingsResolved }) {
  const [funding, setFunding] = useState<"mortgage" | "cash">("mortgage");
  const L = settings.labels;

  return (
    <div
      className="pointer-events-none select-none space-y-5 text-left [&_input]:cursor-default [&_select]:cursor-default"
      aria-hidden
    >
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.nameLabel} <span className="text-red-600">*</span>
        </label>
        <div className={`${inputRo} h-9 bg-zinc-50 dark:bg-zinc-900/50`} />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.emailLabel} <span className="text-red-600">*</span>
        </label>
        <div className={`${inputRo} h-9 bg-zinc-50 dark:bg-zinc-900/50`} />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{L.emailHint}</p>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{L.phoneLabel}</label>
        <div className={`${inputRo} h-9 bg-zinc-50 dark:bg-zinc-900/50`} />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.buyingPositionLabel} <span className="text-red-600">*</span>
        </label>
        <div className={`${inputRo} flex h-9 items-center px-3 text-sm text-zinc-500`}>
          {L.choosePlaceholder}
        </div>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.fundingLegend} <span className="text-red-600">*</span>
        </legend>
        {/* allow radio visual toggle for preview only */}
        <div
          className="pointer-events-auto flex flex-wrap gap-4 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              checked={funding === "mortgage"}
              onChange={() => setFunding("mortgage")}
            />
            {L.fundingMortgage}
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="radio"
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
          <div className={`${inputRo} flex h-9 items-center px-3 text-sm text-zinc-500`}>
            {L.choosePlaceholder}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{L.dipHint}</p>
        </div>
      ) : null}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.solicitorLabel} <span className="text-red-600">*</span>
        </label>
        <div className={`${inputRo} flex h-9 items-center px-3 text-sm text-zinc-500`}>
          {L.choosePlaceholder}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.targetPurchaseLabel} <span className="text-red-600">*</span>
        </label>
        <div className={`${inputRo} flex h-9 items-center px-3 text-sm text-zinc-500`}>
          {L.choosePlaceholder}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.additionalNotesLabel}
        </label>
        <div className={`${inputRo} h-20 bg-zinc-50 dark:bg-zinc-900/50`} />
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {L.propertyPrefix} {SAMPLE_ADDRESS}, {SAMPLE_POSTCODE}
      </p>
      <div className="rounded-md bg-sky-600 px-4 py-2 text-center text-sm font-medium text-white">
        {L.submitLabel}
      </div>
    </div>
  );
}

function LettingQuestionnaireFieldsPreview({ settings }: { settings: LettingPrequalSettingsResolved }) {
  const L = settings.labels;

  return (
    <div
      className="pointer-events-none select-none space-y-5 text-left [&_input]:cursor-default"
      aria-hidden
    >
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.nameLabel} <span className="text-red-600">*</span>
        </label>
        <div className={`${inputRo} h-9 bg-zinc-50 dark:bg-zinc-900/50`} />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.emailLabel} <span className="text-red-600">*</span>
        </label>
        <div className={`${inputRo} h-9 bg-zinc-50 dark:bg-zinc-900/50`} />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{L.emailHint}</p>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{L.phoneLabel}</label>
        <div className={`${inputRo} h-9 bg-zinc-50 dark:bg-zinc-900/50`} />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.occupationLabel}
        </label>
        <div className={`${inputRo} flex h-9 items-center px-3 text-sm text-zinc-400`}>
          {L.occupationPlaceholder}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.incomeLabel} <span className="text-red-600">*</span>
        </label>
        <div className={`${inputRo} flex h-9 items-center px-3 text-sm text-zinc-500`}>
          {L.choosePlaceholder}
        </div>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {L.petsLegend} <span className="text-red-600">*</span>
        </legend>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-700 dark:text-zinc-300">
          <span>{L.petsYes}</span>
          <span>{L.petsNo}</span>
          <span>{L.petsUnspecified}</span>
        </div>
        <div className={`${inputRo} flex h-9 items-center px-3 text-sm text-zinc-400`}>
          {L.petsDetailPlaceholder}
        </div>
      </fieldset>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{L.moveInLabel}</label>
        <div className={`${inputRo} h-9 bg-zinc-50 dark:bg-zinc-900/50`} />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{L.visaLabel}</label>
        <div className={`${inputRo} h-16 bg-zinc-50 dark:bg-zinc-900/50`} />
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {L.propertyPrefix} {SAMPLE_ADDRESS}, {SAMPLE_POSTCODE}
      </p>
      <div className="rounded-md bg-sky-600 px-4 py-2 text-center text-sm font-medium text-white">
        {L.submitLabel}
      </div>
    </div>
  );
}

function salePrequalSettingsSerializedKey(m: SalePrequalSettingsResolved): string {
  return JSON.stringify(m);
}

export function SalePrequalPageSettingsPreview({ merged }: { merged: SalePrequalSettingsResolved }) {
  return (
    <SalePrequalPageSettingsPreviewInner key={salePrequalSettingsSerializedKey(merged)} merged={merged} />
  );
}

function SalePrequalPageSettingsPreviewInner({ merged }: { merged: SalePrequalSettingsResolved }) {
  const [preview, setPreview] = useState(merged);

  function refreshFromForm() {
    const form = document.getElementById("spq-settings-form");
    if (!form || !(form instanceof HTMLFormElement)) return;
    setPreview(resolvedSalePrequalSettingsFromFormData(new FormData(form)));
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/30">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Live layout preview — Pre-viewing checks
        </h3>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          White card on sky gradient, same structure as the public link. You can switch mortgage / cash
          radios to preview the DIP block. Refresh picks up unsaved edits in the form above.
        </p>
        <Button type="button" className="mt-3" variant="outline" size="sm" onClick={refreshFromForm}>
          Refresh preview
        </Button>
      </div>
      <div className="max-h-[min(85vh,720px)] overflow-y-auto p-4">
        <div className="rounded-lg bg-gradient-to-b from-sky-50 to-zinc-50 px-3 py-8 dark:from-zinc-950 dark:to-zinc-950 sm:px-5">
          <div className="mx-auto w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {preview.page.pageTitle}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{preview.page.pageSubtitle}</p>
            {preview.page.intro ? (
              <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm whitespace-pre-wrap text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
                {preview.page.intro}
              </div>
            ) : null}
            <div className="mt-6">
              <SaleQuestionnaireFieldsPreview settings={preview} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function lettingPrequalSettingsSerializedKey(m: LettingPrequalSettingsResolved): string {
  return JSON.stringify(m);
}

export function LettingPrequalPageSettingsPreview({ merged }: { merged: LettingPrequalSettingsResolved }) {
  return (
    <LettingPrequalPageSettingsPreviewInner
      key={lettingPrequalSettingsSerializedKey(merged)}
      merged={merged}
    />
  );
}

function LettingPrequalPageSettingsPreviewInner({ merged }: { merged: LettingPrequalSettingsResolved }) {
  const [preview, setPreview] = useState(merged);

  function refreshFromForm() {
    const form = document.getElementById("lpq-settings-form");
    if (!form || !(form instanceof HTMLFormElement)) return;
    setPreview(resolvedLettingPrequalSettingsFromFormData(new FormData(form)));
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/30">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Live layout preview — Pre-viewing qualification
        </h3>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Violet gradient shell like the rental link. Refresh after editing fields above.
        </p>
        <Button type="button" className="mt-3" variant="outline" size="sm" onClick={refreshFromForm}>
          Refresh preview
        </Button>
      </div>
      <div className="max-h-[min(85vh,720px)] overflow-y-auto p-4">
        <div className="rounded-lg bg-gradient-to-b from-violet-50 to-zinc-50 px-3 py-8 dark:from-zinc-950 dark:to-zinc-950 sm:px-5">
          <div className="mx-auto w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {preview.page.pageTitle}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{preview.page.pageSubtitle}</p>
            {preview.page.intro ? (
              <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm whitespace-pre-wrap text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
                {preview.page.intro}
              </div>
            ) : null}
            <div className="mt-6">
              <LettingQuestionnaireFieldsPreview settings={preview} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
