"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  applyPublicFooterTemplate,
  DEFAULT_PUBLIC_FOOTER_TEMPLATE,
  PUBLIC_FORM_GDPR_NOTICE_EN,
} from "@/lib/branding/public-footer-template";
import { savePublicFooterTemplateAction } from "./actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "mt-2 w-full max-w-xl rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950";

export function PublicFooterTemplateSettingsForm({
  initialStoredTemplate,
  initialShowAgentPhoto,
  initialInviteIncludeFooter,
  previewAgentName,
  previewCompanyName,
  previewProfilePhotoUrl,
}: {
  initialStoredTemplate: string | null;
  initialShowAgentPhoto: boolean;
  initialInviteIncludeFooter: boolean;
  previewAgentName: string;
  previewCompanyName: string;
  previewProfilePhotoUrl: string | null;
}) {
  const router = useRouter();
  const [text, setText] = useState(initialStoredTemplate ?? "");
  const [showPhotoPreview, setShowPhotoPreview] = useState(initialShowAgentPhoto);
  const includeFooter = initialInviteIncludeFooter;

  const [state, formAction, pending] = useActionState(savePublicFooterTemplateAction, undefined);

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.refresh();
    }
  }, [state, router]);

  const samplePropertyLine = "12 Example Road, AB1 2CD";
  const previewVars = useMemo(
    () => ({
      agentName: previewAgentName,
      companyName: previewCompanyName,
      propertyLine: samplePropertyLine,
    }),
    [previewAgentName, previewCompanyName],
  );

  const appliedText = useMemo(
    () =>
      applyPublicFooterTemplate(
        text.trim() ? text : null,
        previewVars,
      ),
    [text, previewVars],
  );

  if (!includeFooter) {
    return null;
  }

  return (
    <div className="mt-10 max-w-xl space-y-6">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Feedback invite email footer
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Edit the signature that appears under the main invite (optional agent headshot and a short GDPR line).
        Turn off <strong className="font-medium text-zinc-800 dark:text-zinc-200">Include footer on automated invites</strong>{" "}
        above to hide this whole block.
      </p>

      <form action={formAction} className="space-y-4">
        <input
          type="hidden"
          name="public_footer_show_agent_photo"
          value={showPhotoPreview ? "on" : "off"}
        />

        <div>
          <label
            htmlFor="public_footer_template"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Footer template
          </label>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Placeholders:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{"{{agentName}}"}</code>,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{"{{companyName}}"}</code>,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{"{{propertyLine}}"}</code>. Leave
            blank to use the built-in default:
          </p>
          <pre className="mt-2 max-w-xl overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs whitespace-pre-wrap text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
            {DEFAULT_PUBLIC_FOOTER_TEMPLATE}
          </pre>
          <textarea
            id="public_footer_template"
            name="public_footer_template"
            className={`${inputClass} min-h-[120px] font-mono text-sm`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Leave empty to use the built-in default above."
            disabled={pending}
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            id="public_footer_show_agent_photo"
            type="checkbox"
            checked={showPhotoPreview}
            onChange={(e) => setShowPhotoPreview(e.target.checked)}
            className="mt-1 rounded border-zinc-300"
            disabled={pending}
          />
          <label htmlFor="public_footer_show_agent_photo" className="text-sm text-zinc-700 dark:text-zinc-300">
            Show the viewing agent&apos;s profile photo in the invite footer (upload your headshot under{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">Account</strong>).
          </label>
        </div>

        {state && "error" in state ? (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        ) : null}
        {state && "success" in state && state.message ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">{state.message}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" name="intent" value="save" disabled={pending}>
            Save footer
          </Button>
          <Button type="submit" name="intent" value="reset" variant="outline" disabled={pending}>
            Reset to built-in default
          </Button>
        </div>
      </form>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Preview — below the invite body (sample property line)
        </p>
        <div className="mt-3 max-w-xl">
          {showPhotoPreview ? (
            <div className="mb-3 flex justify-center">
              {previewProfilePhotoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewProfilePhotoUrl}
                    alt=""
                    className="size-14 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-600"
                  />
                </>
              ) : (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">No profile photo uploaded yet.</p>
              )}
            </div>
          ) : null}
          <div className="text-center text-sm leading-relaxed whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {appliedText}
          </div>
          <p className="mt-3 text-center text-xs leading-snug text-zinc-500 dark:text-zinc-400">
            {PUBLIC_FORM_GDPR_NOTICE_EN}
          </p>
        </div>
      </div>
    </div>
  );
}
