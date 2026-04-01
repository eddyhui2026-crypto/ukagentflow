"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { savePrequalShareTemplatesSettingsAction } from "./actions";
import {
  DEFAULT_PREQUAL_SHARE_TEMPLATES,
  type PrequalListingKind,
} from "@/lib/prequal/share-outreach";
import { Button } from "@/components/ui/button";

const PLACEHOLDERS = "{{propertyLine}} and {{prequalLink}}";

const inputClass =
  "mt-1 w-full max-w-xl rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950";

const textareaClass =
  "mt-1 w-full max-w-xl rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950";

export function PrequalShareTemplatesForm({
  listing,
  initialWhatsapp,
  initialEmailSubject,
  initialEmailBody,
}: {
  listing: PrequalListingKind;
  initialWhatsapp: string;
  initialEmailSubject: string;
  initialEmailBody: string;
}) {
  const router = useRouter();
  const def = DEFAULT_PREQUAL_SHARE_TEMPLATES[listing];
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp);
  const [emailSubject, setEmailSubject] = useState(initialEmailSubject);
  const [emailBody, setEmailBody] = useState(initialEmailBody);

  const [state, formAction, isPending] = useActionState(
    savePrequalShareTemplatesSettingsAction,
    null,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
        Text copied from a property page: WhatsApp message and email draft (subject + body). Use
        placeholders: <code className="text-xs">{PLACEHOLDERS}</code>
      </p>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="listing" value={listing} />
        <div>
          <label
            htmlFor={`prequal-share-wa-${listing}`}
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            WhatsApp message
          </label>
          <textarea
            id={`prequal-share-wa-${listing}`}
            name="whatsapp"
            className={`${textareaClass} min-h-[88px]`}
            value={whatsapp}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setWhatsapp(e.target.value)}
            placeholder={def.whatsapp}
          />
        </div>
        <div>
          <label
            htmlFor={`prequal-share-subj-${listing}`}
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Email subject
          </label>
          <input
            id={`prequal-share-subj-${listing}`}
            name="emailSubject"
            type="text"
            className={inputClass}
            value={emailSubject}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmailSubject(e.target.value)}
            placeholder={def.emailSubject}
          />
        </div>
        <div>
          <label
            htmlFor={`prequal-share-body-${listing}`}
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Email body
          </label>
          <textarea
            id={`prequal-share-body-${listing}`}
            name="emailBody"
            className={`${textareaClass} min-h-[120px]`}
            value={emailBody}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEmailBody(e.target.value)}
            placeholder={def.emailBody}
          />
        </div>
        {state && "error" in state ? (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        ) : null}
        {state && "ok" in state && state.ok ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">Saved.</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" name="intent" value="save" disabled={isPending}>
            Save share messages
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setWhatsapp(initialWhatsapp);
              setEmailSubject(initialEmailSubject);
              setEmailBody(initialEmailBody);
            }}
          >
            Revert unsaved
          </Button>
          <Button type="submit" name="intent" value="reset" variant="secondary" disabled={isPending}>
            Clear custom copy (use built‑ins)
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setWhatsapp(def.whatsapp);
              setEmailSubject(def.emailSubject);
              setEmailBody(def.emailBody);
            }}
          >
            Fill with built‑ins (edit before save)
          </Button>
        </div>
      </form>
    </div>
  );
}
