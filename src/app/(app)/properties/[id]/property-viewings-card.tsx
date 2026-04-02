import Link from "next/link";
import { Fragment } from "react";
import {
  listViewingBuyerInvitesForProperty,
  listViewingsForProperty,
  type ViewingBuyerInviteRow,
  type ViewingListRow,
} from "@/lib/viewings/queries";
import { CopyAgentEmailDraftButton } from "@/components/copy-agent-email-draft-button";
import { ResendAppInviteButton } from "@/components/resend-app-invite-button";
import { getCompanyFeedbackInviteTemplates } from "@/lib/companies/queries";
import { buildAgentCopyEmailDraft } from "@/lib/email/agent-copy-invite";
import { getAppBaseUrl } from "@/lib/env/app-url";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { buildBuyerFeedbackWhatsAppMessage, buildWhatsAppMeUrl, normalizePhoneToWhatsAppDigits } from "@/lib/whatsapp";
import { BuyerInviteStatus } from "@/components/buyer-invite-status";

function formatViewDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function inviteSummaryText(v: ViewingListRow) {
  if (!v.invite_emails_via_app) {
    return `Agent sharing · ${v.buyer_count} link${v.buyer_count === 1 ? "" : "s"}`;
  }
  return `${v.emails_sent_count} / ${v.buyer_count} emailed · auto-invites: day after viewing, ~9:00 UK`;
}

function formatScheduledLondon(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function PropertyViewingsCard({
  propertyId,
  companyId,
  propertyLine,
}: {
  propertyId: string;
  companyId: string;
  propertyLine: string;
}) {
  const [viewings, inviteRows, tpl] = await Promise.all([
    listViewingsForProperty(propertyId, companyId),
    listViewingBuyerInvitesForProperty(propertyId, companyId),
    getCompanyFeedbackInviteTemplates(companyId),
  ]);
  const baseUrl = getAppBaseUrl();
  const origin = baseUrl.replace(/\/$/, "");

  const buyersByViewing = new Map<string, ViewingBuyerInviteRow[]>();
  for (const r of inviteRows) {
    const list = buyersByViewing.get(r.viewing_id) ?? [];
    list.push(r);
    buyersByViewing.set(r.viewing_id, list);
  }

  const viewingMeta = new Map(viewings.map((v) => [v.id, v]));

  return (
    <div className="mt-8 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Viewings</h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            App emails go out the morning after the viewing (~9:00 Europe/London) unless you chose
            manual copy. Use <strong className="font-medium">Copy email draft</strong> anytime. Buyers can
            submit feedback until 90&nbsp;days after the viewing (London calendar), with gentle rate limits on
            the public form to reduce abuse.
          </p>
        </div>
        <Link
          href={`/properties/${propertyId}/viewings/new`}
          data-tour="onboarding-schedule-viewing"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + Schedule viewing
        </Link>
      </div>
      {viewings.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
          No viewings yet. Schedule one to add buyers and collect feedback.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Buyers</th>
                <th className="px-4 py-3">Feedback invites</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {viewings.map((v) => {
                const buyers = buyersByViewing.get(v.id) ?? [];
                return (
                  <Fragment key={v.id}>
                    <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        {formatViewDate(v.viewing_date)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                        {v.buyer_count}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {inviteSummaryText(v)}
                      </td>
                    </tr>
                    <tr className="bg-zinc-50/90 dark:bg-zinc-950/50">
                      <td colSpan={3} className="px-4 py-3">
                        {buyers.length === 0 ? (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">No buyers linked.</p>
                        ) : (
                          <div className="overflow-x-auto rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                            <table className="w-full min-w-[880px] text-left text-xs">
                              <thead>
                                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                                  <th className="px-3 py-2 font-medium text-zinc-600 dark:text-zinc-400">
                                    Buyer
                                  </th>
                                  <th className="px-3 py-2 font-medium text-zinc-600 dark:text-zinc-400">
                                    Email
                                  </th>
                                  <th className="px-3 py-2 font-medium text-zinc-600 dark:text-zinc-400">
                                    Status
                                  </th>
                                  <th className="px-3 py-2 font-medium text-zinc-600 dark:text-zinc-400">
                                    App resend
                                  </th>
                                  <th className="px-3 py-2 font-medium text-zinc-600 dark:text-zinc-400">
                                    WhatsApp
                                  </th>
                                  <th className="px-3 py-2 font-medium text-zinc-600 dark:text-zinc-400">
                                    Clipboard
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {buyers.map((b) => {
                                  const meta = viewingMeta.get(b.viewing_id);
                                  const viaApp = meta?.invite_emails_via_app ?? true;
                                  const canAppResend =
                                    viaApp &&
                                    !b.token_invalidated_at &&
                                    !b.invite_link_expired;
                                  return (
                                    <tr key={`${b.viewing_id}-${b.feedback_token}`}>
                                      <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                                        {b.buyer_name}
                                      </td>
                                      <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                                        {b.buyer_email}
                                      </td>
                                      <td className="px-3 py-2">
                                        <BuyerInviteStatus
                                          viaApp={viaApp}
                                          emailSent={b.email_sent}
                                          scheduledAt={b.feedback_invite_scheduled_at}
                                        />
                                        {!viaApp ? (
                                          <span className="mt-1 block text-[11px] text-zinc-500 dark:text-zinc-500">
                                            Use <strong className="font-medium">Copy email draft</strong> — paste
                                            into your email app. Customise wording under Settings → Copy-paste
                                            email.
                                          </span>
                                        ) : b.email_sent ? (
                                          <span className="mt-1 block text-[11px] text-zinc-500 dark:text-zinc-500">
                                            You can still copy the same draft if you need the text again.
                                          </span>
                                        ) : b.feedback_invite_scheduled_at ? (
                                          new Date(b.feedback_invite_scheduled_at).getTime() > Date.now() ? (
                                            <span className="mt-1 block text-[11px] text-zinc-500 dark:text-zinc-500">
                                              UKAgentFlow will email at{" "}
                                              {formatScheduledLondon(b.feedback_invite_scheduled_at)} (London), or
                                              copy the draft if you need it sooner.
                                            </span>
                                          ) : (
                                            <span className="mt-1 block text-[11px] text-zinc-500 dark:text-zinc-500">
                                              Past the automatic send time — it should go out soon. If you need it
                                              straight away, use <strong className="font-medium">Copy email draft</strong>.
                                            </span>
                                          )
                                        ) : (
                                          <span className="mt-1 block text-[11px] text-zinc-500 dark:text-zinc-500">
                                            No send time on file — use <strong className="font-medium">Copy email draft</strong>{" "}
                                            for now.
                                          </span>
                                        )}
                                        {viaApp && b.invite_link_expired ? (
                                          <span className="mt-1 block text-[11px] text-amber-800 dark:text-amber-200">
                                            Feedback window ended — form won&apos;t accept new replies.
                                          </span>
                                        ) : null}
                                        {viaApp && b.token_invalidated_at ? (
                                          <span className="mt-1 block text-[11px] text-amber-800 dark:text-amber-200">
                                            Link revoked — app resend disabled.
                                          </span>
                                        ) : null}
                                      </td>
                                      <td className="px-3 py-2 align-top">
                                        {canAppResend ? (
                                          <ResendAppInviteButton
                                            viewingBuyerId={b.id}
                                            propertyId={propertyId}
                                          />
                                        ) : (
                                          <span className="inline-block text-[11px] text-zinc-400 dark:text-zinc-600">
                                            —
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 align-top">
                                        {(() => {
                                          const digits = normalizePhoneToWhatsAppDigits(b.buyer_phone);
                                          const feedbackUrl = `${origin}/feedback/${b.feedback_token}`;
                                          const msg = buildBuyerFeedbackWhatsAppMessage({
                                            buyerName: b.buyer_name,
                                            propertyLine,
                                            feedbackUrl,
                                          });
                                          const href = digits
                                            ? buildWhatsAppMeUrl(digits, msg)
                                            : null;
                                          return href ? (
                                            <a
                                              href={href}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={cn(
                                                buttonVariants({ variant: "outline", size: "sm" }),
                                                "inline-flex h-8 shrink-0 items-center justify-center px-3 text-xs",
                                              )}
                                            >
                                              Send via WhatsApp
                                            </a>
                                          ) : (
                                            <span
                                              className="inline-block text-[11px] text-zinc-400 dark:text-zinc-500"
                                              title="Add a mobile number to this buyer to use WhatsApp"
                                            >
                                              —
                                            </span>
                                          );
                                        })()}
                                      </td>
                                      <td className="px-3 py-2 align-top">
                                        <CopyAgentEmailDraftButton
                                          draftText={buildAgentCopyEmailDraft({
                                            buyerEmail: b.buyer_email,
                                            buyerName: b.buyer_name,
                                            propertyLine,
                                            feedbackToken: b.feedback_token,
                                            baseUrl,
                                            subjectTemplate: tpl?.agent_copy_invite_subject_template,
                                            bodyTemplate: tpl?.agent_copy_invite_body_template,
                                          })}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
