"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveLettingsFeedbackFormConfigAction,
  type LettingsFeedbackFormSettingsState,
} from "./actions";
import { LettingsFeedbackFormSettingsPreview } from "./lettings-feedback-form-settings-preview";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_LETTINGS_PAGE_SUBTITLE,
  DEFAULT_LETTINGS_PAGE_TITLE,
  LETTINGS_FEEDBACK_FORM_LABEL_HINTS,
  LETTINGS_FEEDBACK_FORM_LABEL_KEYS,
  lettingsFormFieldName,
  type LettingsFeedbackFormCopyResolved,
} from "@/lib/feedback/lettings-form-config";

function LettingsFormActions() {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap gap-3">
      <Button type="submit" name="intent" value="save" disabled={pending}>
        {pending ? "Saving…" : "Save lettings form copy"}
      </Button>
      <Button
        type="submit"
        name="intent"
        value="reset"
        variant="outline"
        disabled={pending}
        formNoValidate
      >
        Reset lettings to defaults
      </Button>
    </div>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950";

export function LettingsFeedbackFormSettingsForm({
  mergedCopy,
  usingDefaults,
}: {
  mergedCopy: LettingsFeedbackFormCopyResolved;
  usingDefaults: boolean;
}) {
  const [state, formAction] = useActionState(saveLettingsFeedbackFormConfigAction, undefined);

  return (
    <div className="space-y-6 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/20">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Lettings (rental) feedback form
        </h3>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Used when a property is set to <strong className="font-medium">To let</strong>. Tenants
          see this copy on the public feedback link (move-in date, rent view, pets, etc.).
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

      <form id="lfc-settings-form" action={formAction} className="space-y-6">
        <div>
          <label htmlFor="lfc_intro" className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Intro (optional)
          </label>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Shown above the questions. Plain text; line breaks are preserved.
          </p>
          <textarea
            id="lfc_intro"
            name="lfc_intro"
            rows={4}
            defaultValue={mergedCopy.intro ?? ""}
            className={`${inputClass} font-sans`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="lfc_page_title" className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Page title
            </label>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Default: <span className="italic">{DEFAULT_LETTINGS_PAGE_TITLE}</span>
            </p>
            <input
              id="lfc_page_title"
              name="lfc_page_title"
              type="text"
              defaultValue={mergedCopy.pageTitle}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="lfc_page_subtitle" className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Page subtitle
            </label>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Default: <span className="italic">{DEFAULT_LETTINGS_PAGE_SUBTITLE}</span>
            </p>
            <input
              id="lfc_page_subtitle"
              name="lfc_page_subtitle"
              type="text"
              defaultValue={mergedCopy.pageSubtitle}
              className={inputClass}
            />
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Section headings &amp; option labels
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Chip texts for what stood out / concerns are fixed in English; you can change all titles
            and dropdown / button labels here.
          </p>
          <div className="mt-4 max-h-[min(60vh,480px)] space-y-4 overflow-y-auto pr-1">
            {LETTINGS_FEEDBACK_FORM_LABEL_KEYS.map((key) => (
              <div key={key}>
                <label
                  htmlFor={lettingsFormFieldName(key)}
                  className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
                >
                  {LETTINGS_FEEDBACK_FORM_LABEL_HINTS[key]}
                </label>
                <input
                  id={lettingsFormFieldName(key)}
                  name={lettingsFormFieldName(key)}
                  type="text"
                  defaultValue={mergedCopy.labels[key]}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        <LettingsFeedbackFormSettingsPreview mergedCopy={mergedCopy} />

        <LettingsFormActions />
        {usingDefaults ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Nothing custom saved for lettings yet — showing built-in English defaults.
          </p>
        ) : null}
      </form>
    </div>
  );
}
