"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveAgentCopyInviteTemplatesAction,
  type AgentCopyInviteTemplateState,
} from "./actions";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_AGENT_COPY_INVITE_BODY_TEMPLATE,
  DEFAULT_AGENT_COPY_INVITE_SUBJECT_TEMPLATE,
} from "@/lib/email/agent-copy-invite";

function FormActions() {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" name="intent" value="save" disabled={pending}>
        {pending ? "Saving…" : "Save templates"}
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

const inputClass =
  "mt-2 w-full max-w-xl rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950";

export function AgentCopyInviteTemplatesForm({
  initialSubject,
  initialBody,
  usingDefaults,
}: {
  initialSubject: string;
  initialBody: string;
  usingDefaults: boolean;
}) {
  const [state, formAction] = useActionState(saveAgentCopyInviteTemplatesAction, undefined);

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
            htmlFor="ac-invite-subject"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Subject line (inside copied draft)
          </label>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Placeholders:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{`{{buyerName}}`}</code>,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{`{{propertyLine}}`}</code>,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{`{{feedbackLink}}`}</code>,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{`{{buyerEmail}}`}</code>.
            Leave blank to use the built-in default (
            <span className="italic">{DEFAULT_AGENT_COPY_INVITE_SUBJECT_TEMPLATE}</span>).
          </p>
          <input
            id="ac-invite-subject"
            name="ac_subject"
            type="text"
            defaultValue={initialSubject}
            className={inputClass}
            placeholder={DEFAULT_AGENT_COPY_INVITE_SUBJECT_TEMPLATE}
            autoComplete="off"
          />
        </div>

        <div>
          <label
            htmlFor="ac-invite-body"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Email body (plain text)
          </label>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Same placeholders. <strong className="font-medium text-zinc-700 dark:text-zinc-300">Body must include {`{{feedbackLink}}`}</strong>. The clipboard will add{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">To:</code> and{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">Subject:</code> lines above this text.
          </p>
          <textarea
            id="ac-invite-body"
            name="ac_body"
            required
            rows={10}
            defaultValue={initialBody}
            className={`${inputClass} max-w-2xl font-mono`}
          />
        </div>

        <FormActions />
        {usingDefaults ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Nothing custom saved yet — fields show built-in copy-paste defaults.
          </p>
        ) : null}
      </form>

      <details className="rounded-md border border-zinc-200 bg-zinc-50 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
        <summary className="cursor-pointer select-none px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">
          Show built-in default body (reference)
        </summary>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap border-t border-zinc-200 px-4 py-3 font-mono text-[11px] leading-relaxed dark:border-zinc-800">
          {DEFAULT_AGENT_COPY_INVITE_BODY_TEMPLATE}
        </pre>
      </details>
    </div>
  );
}
