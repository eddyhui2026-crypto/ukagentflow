"use client";

import { useActionState, useEffect, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  saveFeedbackInviteTemplatesAction,
  type FeedbackInviteTemplateState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { DEFAULT_FEEDBACK_INVITE_SUBJECT_TEMPLATE } from "@/lib/email/feedback-invite";

function FormActions() {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" name="intent" value="save" disabled={pending}>
        {pending ? "Saving…" : "Save template"}
      </Button>
      <Button
        type="submit"
        name="intent"
        value="reset"
        variant="outline"
        disabled={pending}
        formNoValidate
      >
        Reset to built-in defaults
      </Button>
    </div>
  );
}

export function FeedbackInviteTemplatesForm({
  subjectRef,
  bodyRef,
  showPhotoRef,
  includeFooterRef,
  initialSubject,
  initialBody,
  initialInviteShowPropertyPhoto,
  initialInviteIncludeFooter,
  usingDefaults,
}: {
  subjectRef: RefObject<HTMLInputElement | null>;
  bodyRef: RefObject<HTMLTextAreaElement | null>;
  showPhotoRef: RefObject<HTMLInputElement | null>;
  includeFooterRef: RefObject<HTMLInputElement | null>;
  initialSubject: string;
  initialBody: string;
  initialInviteShowPropertyPhoto: boolean;
  initialInviteIncludeFooter: boolean;
  usingDefaults: boolean;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveFeedbackInviteTemplatesAction, undefined);

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="space-y-6">
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

      <form action={formAction} className="space-y-5">
        <div>
          <label
            htmlFor="invite-subject"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Email subject
          </label>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Placeholders:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              {`{{buyerName}}`}
            </code>
            ,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              {`{{propertyLine}}`}
            </code>
            ,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              {`{{feedbackLink}}`}
            </code>
            . Leave subject blank to use the built-in default (
            <span className="italic">{DEFAULT_FEEDBACK_INVITE_SUBJECT_TEMPLATE}</span>).
          </p>
          <input
            id="invite-subject"
            ref={subjectRef}
            name="subject"
            type="text"
            defaultValue={initialSubject}
            className="mt-2 w-full max-w-xl rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
            placeholder={DEFAULT_FEEDBACK_INVITE_SUBJECT_TEMPLATE}
            autoComplete="off"
          />
        </div>

        <div>
          <label
            htmlFor="invite-body"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Email body (plain text)
          </label>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Same placeholders. Use a blank line between paragraphs. The HTML email is generated
            from this text;{" "}
            <strong className="font-medium text-zinc-700 dark:text-zinc-300">
              you must keep {`{{feedbackLink}}`}
            </strong>{" "}
            in the body.
          </p>
          <textarea
            id="invite-body"
            ref={bodyRef}
            name="body"
            required
            rows={9}
            defaultValue={initialBody}
            className="mt-2 w-full max-w-2xl rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Minimal invite layout
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Buyer emails use a clean, property-first design. These options only change what appears around
            your subject and body text — the main button always opens the feedback form.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-800 dark:text-zinc-200">
            <li className="flex gap-2">
              <input
                id="invite-show-photo"
                ref={showPhotoRef}
                type="checkbox"
                name="invite_show_property_photo"
                value="on"
                defaultChecked={initialInviteShowPropertyPhoto}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-sky-600 dark:border-zinc-600"
              />
              <label htmlFor="invite-show-photo" className="cursor-pointer select-none">
                <span className="font-medium">Show listing photo</span>
                <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                  When off, the property block uses a simple text layout so the email stays tidy even without
                  an image.
                </span>
              </label>
            </li>
            <li className="flex gap-2">
              <input
                id="invite-include-footer"
                ref={includeFooterRef}
                type="checkbox"
                name="invite_include_footer"
                value="on"
                defaultChecked={initialInviteIncludeFooter}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-sky-600 dark:border-zinc-600"
              />
              <label htmlFor="invite-include-footer" className="cursor-pointer select-none">
                <span className="font-medium">Include footer on automated invites</span>
                <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                  On: show the footer template section below (page stays short when off). Use{" "}
                  <strong className="font-medium text-zinc-600 dark:text-zinc-300">Save template</strong> so sends
                  match. Off: emails have no signature block; your draft wording is kept for next time.
                </span>
              </label>
            </li>
          </ul>
        </div>

        <FormActions />
        {usingDefaults ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Nothing custom saved yet — showing built-in default text in the fields.
          </p>
        ) : null}
      </form>
    </div>
  );
}
