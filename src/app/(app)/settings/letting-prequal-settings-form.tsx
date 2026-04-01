"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveLettingPrequalPageCopyAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_LETTING_PREQUAL_FORM_LABELS,
  DEFAULT_LETTING_PREQUAL_PAGE_SUBTITLE,
  DEFAULT_LETTING_PREQUAL_PAGE_TITLE,
  LETTING_PREQUAL_LABEL_HINTS,
  LETTING_PREQUAL_LABEL_KEYS,
  lettingPrequalLabelFieldName,
  type LettingPrequalSettingsResolved,
} from "@/lib/prequal/page-copy-config";
import { LettingPrequalPageSettingsPreview } from "./prequal-page-settings-preview";

function FormActions() {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap gap-3">
      <Button type="submit" name="intent" value="save" disabled={pending}>
        {pending ? "Saving…" : "Save pre-viewing page"}
      </Button>
      <Button
        type="submit"
        name="intent"
        value="reset"
        variant="outline"
        disabled={pending}
        formNoValidate
      >
        Reset to defaults
      </Button>
    </div>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950";

export function LettingPrequalSettingsForm({
  merged,
  usingDefaults,
}: {
  merged: LettingPrequalSettingsResolved;
  usingDefaults: boolean;
}) {
  const [state, formAction] = useActionState(saveLettingPrequalPageCopyAction, undefined);
  const { page: mergedPage, labels: L } = merged;

  return (
    <div className="space-y-6 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/20">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Pre-viewing qualification (to let)
        </h3>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Same fields as the public rental link. Customise all visible strings; option values sent to the
          server stay the same.
        </p>
      </div>

      {state && "error" in state ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {state.error}
        </p>
      ) : null}
      {state && "success" in state && state.message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          {state.message}
        </p>
      ) : null}

      <form id="lpq-settings-form" action={formAction} className="space-y-6">
        <div className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Page shell</h4>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="lpq_page_title" className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Page title
              </label>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Default: <span className="italic">{DEFAULT_LETTING_PREQUAL_PAGE_TITLE}</span>
              </p>
              <input
                id="lpq_page_title"
                name="lpq_page_title"
                type="text"
                defaultValue={
                  mergedPage.pageTitle === DEFAULT_LETTING_PREQUAL_PAGE_TITLE
                    ? ""
                    : mergedPage.pageTitle
                }
                className={inputClass}
                placeholder={DEFAULT_LETTING_PREQUAL_PAGE_TITLE}
              />
            </div>
            <div>
              <label
                htmlFor="lpq_page_subtitle"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                Page subtitle
              </label>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Default: <span className="italic">{DEFAULT_LETTING_PREQUAL_PAGE_SUBTITLE}</span>
              </p>
              <input
                id="lpq_page_subtitle"
                name="lpq_page_subtitle"
                type="text"
                defaultValue={
                  mergedPage.pageSubtitle === DEFAULT_LETTING_PREQUAL_PAGE_SUBTITLE
                    ? ""
                    : mergedPage.pageSubtitle
                }
                className={inputClass}
                placeholder={DEFAULT_LETTING_PREQUAL_PAGE_SUBTITLE}
              />
            </div>
            <div>
              <label htmlFor="lpq_intro" className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Intro (optional)
              </label>
              <textarea
                id="lpq_intro"
                name="lpq_intro"
                rows={3}
                defaultValue={mergedPage.intro ?? ""}
                className={`${inputClass} font-sans`}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Form copy</h4>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Blank means keep built-in English for that line.
          </p>
          <div className="mt-4 max-h-[min(70vh,480px)] space-y-4 overflow-y-auto pr-1">
            {LETTING_PREQUAL_LABEL_KEYS.map((key) => {
              const def = DEFAULT_LETTING_PREQUAL_FORM_LABELS[key];
              const val = L[key];
              return (
                <div key={key}>
                  <label
                    htmlFor={lettingPrequalLabelFieldName(key)}
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    {LETTING_PREQUAL_LABEL_HINTS[key]}
                  </label>
                  <input
                    id={lettingPrequalLabelFieldName(key)}
                    name={lettingPrequalLabelFieldName(key)}
                    type="text"
                    defaultValue={val === def ? "" : val}
                    className={inputClass}
                    placeholder={def}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <LettingPrequalPageSettingsPreview merged={merged} />

        <FormActions />
        {usingDefaults ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Nothing custom saved yet — all built-in copy.
          </p>
        ) : null}
      </form>
    </div>
  );
}
