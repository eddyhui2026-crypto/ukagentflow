import { Suspense } from "react";
import { auth } from "@/auth";
import {
  getCompanyFeedbackFormConfig,
  getCompanyFeedbackInviteTemplates,
  getCompanyLettingsFeedbackFormConfig,
  getCompanyPrequalFormConfigs,
  getCompanyPrequalShareTemplates,
  getSettingsBranding,
} from "@/lib/companies/queries";
import { getCompanyBilling } from "@/lib/companies/billing";
import {
  diffFeedbackFormConfigForStorage,
  mergeFeedbackFormCopy,
  parseFeedbackFormConfigFromDb,
} from "@/lib/feedback/form-config";
import {
  diffLettingsFeedbackFormConfigForStorage,
  mergeLettingsFeedbackFormCopy,
  parseLettingsFeedbackFormConfigFromDb,
} from "@/lib/feedback/lettings-form-config";
import {
  diffLettingPrequalSettingsForStorage,
  diffSalePrequalSettingsForStorage,
  mergeLettingPrequalSettings,
  mergeSalePrequalSettings,
  parseLettingPrequalFormConfigFromDb,
  parseSalePrequalFormConfigFromDb,
} from "@/lib/prequal/page-copy-config";
import { DEFAULT_AGENT_COPY_INVITE_BODY_TEMPLATE } from "@/lib/email/agent-copy-invite";
import { DEFAULT_FEEDBACK_INVITE_BODY_TEMPLATE } from "@/lib/email/feedback-invite";
import { AgentCopyInviteTemplatesForm } from "./agent-copy-invite-templates-form";
import { FeedbackFormSettingsForm } from "./feedback-form-settings-form";
import { LettingPrequalSettingsForm } from "./letting-prequal-settings-form";
import { LettingsFeedbackFormSettingsForm } from "./lettings-feedback-form-settings-form";
import { InviteAutoSettingsPanel } from "./invite-auto-settings-panel";
import { SalePrequalSettingsForm } from "./sale-prequal-settings-form";
import { BrandingUrlsForm } from "./branding-urls-form";
import { ChangePasswordForm } from "./change-password-form";
import { PrequalShareTemplatesForm } from "./prequal-share-templates-form";
import { SettingsListingSplitShell } from "./settings-listing-split-shell";
import { BillingSettingsPanel } from "./billing-settings-panel";
import { SettingsSectionTabs } from "./settings-section-tabs";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.companyId || !session.user.id) {
    return null;
  }

  const [row, formRaw, lettingsFormRaw, prequalRaw, branding, prequalShareRow, billingRow] =
    await Promise.all([
      getCompanyFeedbackInviteTemplates(session.user.companyId),
      getCompanyFeedbackFormConfig(session.user.companyId),
      getCompanyLettingsFeedbackFormConfig(session.user.companyId),
      getCompanyPrequalFormConfigs(session.user.companyId),
      getSettingsBranding(session.user.id, session.user.companyId),
      getCompanyPrequalShareTemplates(session.user.companyId),
      getCompanyBilling(session.user.companyId),
    ]);

  const yearlyPriceConfigured = Boolean(process.env.STRIPE_PRICE_YEARLY?.trim());
  const stripeConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() && process.env.STRIPE_PRICE_MONTHLY?.trim(),
  );

  const saleShareWa = prequalShareRow?.sale_prequal_share_whatsapp_template?.trim() ?? "";
  const saleShareSubj = prequalShareRow?.sale_prequal_share_email_subject_template?.trim() ?? "";
  const saleShareBody = prequalShareRow?.sale_prequal_share_email_body_template?.trim() ?? "";
  const lettingShareWa = prequalShareRow?.letting_prequal_share_whatsapp_template?.trim() ?? "";
  const lettingShareSubj = prequalShareRow?.letting_prequal_share_email_subject_template?.trim() ?? "";
  const lettingShareBody = prequalShareRow?.letting_prequal_share_email_body_template?.trim() ?? "";

  const usingInviteDefaults =
    !row?.feedback_invite_subject_template?.trim() &&
    !row?.feedback_invite_body_template?.trim();

  const initialSubject = row?.feedback_invite_subject_template?.trim() ?? "";
  const initialBody =
    row?.feedback_invite_body_template?.trim() ?? DEFAULT_FEEDBACK_INVITE_BODY_TEMPLATE;

  const initialInviteShowPropertyPhoto = row?.invite_show_property_photo ?? true;
  const initialInviteIncludeFooter = row?.invite_use_system_footer ?? true;

  const usingAgentCopyDefaults =
    !row?.agent_copy_invite_subject_template?.trim() &&
    !row?.agent_copy_invite_body_template?.trim();
  const initialAcSubject = row?.agent_copy_invite_subject_template?.trim() ?? "";
  const initialAcBody =
    row?.agent_copy_invite_body_template?.trim() ?? DEFAULT_AGENT_COPY_INVITE_BODY_TEMPLATE;

  const storedForm = parseFeedbackFormConfigFromDb(formRaw);
  const mergedFormCopy = mergeFeedbackFormCopy(storedForm);
  const usingFormDefaults = diffFeedbackFormConfigForStorage(mergedFormCopy) === null;

  const storedLettingsForm = parseLettingsFeedbackFormConfigFromDb(lettingsFormRaw);
  const mergedLettingsFormCopy = mergeLettingsFeedbackFormCopy(storedLettingsForm);
  const usingLettingsDefaults =
    diffLettingsFeedbackFormConfigForStorage(mergedLettingsFormCopy) === null;

  const storedSalePrequal = parseSalePrequalFormConfigFromDb(prequalRaw.sale_raw);
  const mergedSalePrequal = mergeSalePrequalSettings(storedSalePrequal);
  const usingSalePrequalDefaults =
    diffSalePrequalSettingsForStorage(mergedSalePrequal) === null;

  const storedLettingPrequal = parseLettingPrequalFormConfigFromDb(prequalRaw.letting_raw);
  const mergedLettingPrequal = mergeLettingPrequalSettings(storedLettingPrequal);
  const usingLettingPrequalDefaults =
    diffLettingPrequalSettingsForStorage(mergedLettingPrequal) === null;

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Company-wide wording: email invites, copy-paste drafts, feedback forms, then{" "}
          <strong className="font-medium text-zinc-800 dark:text-zinc-200">pre-view share</strong> (WhatsApp &
          email from the property page) and{" "}
          <strong className="font-medium text-zinc-800 dark:text-zinc-200">pre-view pages</strong> (the public
          questionnaire). Sale vs to-let sections each use a{" "}
          <strong className="font-medium text-zinc-800 dark:text-zinc-200">For sale</strong> /{" "}
          <strong className="font-medium text-zinc-800 dark:text-zinc-200">To let</strong> toggle. The URL{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">?tab=</code> and{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">?side=letting</code> remember your
          place.
        </p>

        <Suspense
          fallback={
            <div
              className="mt-10 h-40 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60"
              aria-hidden
            />
          }
        >
          <div data-tour="onboarding-settings-shell">
            <SettingsSectionTabs
              panels={{
              invite: (
                <div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    When you schedule a viewing with &quot;Email buyers automatically&quot;, each invite is
                    sent{" "}
                    <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                      the day after the viewing
                    </strong>{" "}
                    at about{" "}
                    <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                      9:00 Europe/London
                    </strong>{" "}
                    — not the moment you save. The subject and body below use the same placeholders when those
                    emails go out.
                  </p>
                  <div className="mt-6">
                    <InviteAutoSettingsPanel
                      initialSubject={initialSubject}
                      initialBody={initialBody}
                      initialInviteShowPropertyPhoto={initialInviteShowPropertyPhoto}
                      initialInviteIncludeFooter={initialInviteIncludeFooter}
                      usingDefaults={usingInviteDefaults}
                      branding={branding}
                    />
                  </div>
                </div>
              ),
              copy: (
                <div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    If you choose &quot;I&apos;ll copy links myself&quot; when scheduling a viewing, use{" "}
                    <strong className="font-medium text-zinc-700 dark:text-zinc-300">Copy email draft</strong>{" "}
                    on the property page. One click copies <strong className="font-medium">To</strong>,{" "}
                    <strong className="font-medium">Subject</strong>, and the message body — paste into Gmail
                    or Outlook, then send from your own address.
                  </p>
                  <div className="mt-6">
                    <AgentCopyInviteTemplatesForm
                      initialSubject={initialAcSubject}
                      initialBody={initialAcBody}
                      usingDefaults={usingAgentCopyDefaults}
                    />
                  </div>
                </div>
              ),
              feedback_forms: (
                <SettingsListingSplitShell
                  tabId="feedback_forms"
                  sale={
                    <div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Used after a viewing when the listing is{" "}
                        <strong className="font-medium text-zinc-800 dark:text-zinc-200">for sale</strong>.
                        Customise titles, intros, and labels — question structure and stored fields stay the
                        same.
                      </p>
                      <div className="mt-6">
                        <FeedbackFormSettingsForm
                          mergedCopy={mergedFormCopy}
                          usingDefaults={usingFormDefaults}
                        />
                      </div>
                    </div>
                  }
                  letting={
                    <div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Used after a viewing when the listing is{" "}
                        <strong className="font-medium text-zinc-800 dark:text-zinc-200">to let</strong>.
                        Customise titles, intros, and labels — field storage stays aligned with the rental flow.
                      </p>
                      <div className="mt-6">
                        <LettingsFeedbackFormSettingsForm
                          mergedCopy={mergedLettingsFormCopy}
                          usingDefaults={usingLettingsDefaults}
                        />
                      </div>
                    </div>
                  }
                />
              ),
              prequal_share: (
                <SettingsListingSplitShell
                  tabId="prequal_share"
                  sale={
                    <div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        WhatsApp message and email draft (subject + body) copied from each{" "}
                        <strong className="font-medium text-zinc-800 dark:text-zinc-200">for sale</strong>{" "}
                        property’s pre-viewing block. Leave fields blank and save empty to use the built-in
                        wording, or set custom copy with{" "}
                        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
                          {"{{propertyLine}}"}
                        </code>{" "}
                        and{" "}
                        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
                          {"{{prequalLink}}"}
                        </code>
                        .
                      </p>
                      <div className="mt-6">
                        <PrequalShareTemplatesForm
                          key={`sale-share-${saleShareWa}-${saleShareSubj}-${saleShareBody}`}
                          listing="sale"
                          initialWhatsapp={saleShareWa}
                          initialEmailSubject={saleShareSubj}
                          initialEmailBody={saleShareBody}
                        />
                      </div>
                    </div>
                  }
                  letting={
                    <div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Same as sale, for{" "}
                        <strong className="font-medium text-zinc-800 dark:text-zinc-200">to let</strong>{" "}
                        listings — the text agents copy when sharing the rental pre-viewing link.
                      </p>
                      <div className="mt-6">
                        <PrequalShareTemplatesForm
                          key={`letting-share-${lettingShareWa}-${lettingShareSubj}-${lettingShareBody}`}
                          listing="letting"
                          initialWhatsapp={lettingShareWa}
                          initialEmailSubject={lettingShareSubj}
                          initialEmailBody={lettingShareBody}
                        />
                      </div>
                    </div>
                  }
                />
              ),
              prequal: (
                <SettingsListingSplitShell
                  tabId="prequal"
                  sale={
                    <div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        The <strong className="font-medium text-zinc-800 dark:text-zinc-200">for sale</strong>{" "}
                        pre-viewing link on each property page. Customise the heading, subtitle, and optional
                        intro. Answers are stored per{" "}
                        <strong className="font-medium text-zinc-700 dark:text-zinc-300">property + email</strong>{" "}
                        (same email re-submits update that row for that address only). They are{" "}
                        <strong className="font-medium text-zinc-700 dark:text-zinc-300">not</strong>{" "}
                        auto-filled into the post-viewing feedback form — each viewing gets its own feedback link
                        afterwards.
                      </p>
                      <div className="mt-6">
                        <SalePrequalSettingsForm
                          merged={mergedSalePrequal}
                          usingDefaults={usingSalePrequalDefaults}
                        />
                      </div>
                    </div>
                  }
                  letting={
                    <div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        The <strong className="font-medium text-zinc-800 dark:text-zinc-200">to let</strong>{" "}
                        pre-viewing link per rental. Copy is heading, subtitle, and optional intro. Storage is
                        per{" "}
                        <strong className="font-medium text-zinc-700 dark:text-zinc-300">property + email</strong>{" "}
                        like sale. Lettings viewing feedback is a separate flow and link — nothing from here is
                        pasted into that form automatically.
                      </p>
                      <div className="mt-6">
                        <LettingPrequalSettingsForm
                          merged={mergedLettingPrequal}
                          usingDefaults={usingLettingPrequalDefaults}
                        />
                      </div>
                    </div>
                  }
                />
              ),
              billing: (
                <div>
                  {billingRow ? (
                    <BillingSettingsPanel
                      trialStartedAtIso={new Date(billingRow.trial_started_at).toISOString()}
                      trialEndsAtIso={new Date(billingRow.trial_ends_at).toISOString()}
                      subscriptionStatus={billingRow.subscription_status}
                      stripeSubscriptionId={billingRow.stripe_subscription_id}
                      yearlyPriceConfigured={yearlyPriceConfigured}
                      stripeConfigured={stripeConfigured}
                    />
                  ) : (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      Could not load billing for this workspace.
                    </p>
                  )}
                </div>
              ),
              account: (
                <div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Optional <strong className="font-medium">company logo</strong> for automated buyer invites:
                    centred at the top with your <strong className="font-medium">company trading name</strong> on the
                    next line when both are set — same header layout as the homepage &quot;Automated invite email&quot;
                    sample. Without a logo, the name appears alone, centred. Your{" "}
                    <strong className="font-medium">profile photo</strong> is used in the footer of those same invites
                    when you enable it under{" "}
                    <strong className="font-medium text-zinc-800 dark:text-zinc-200">Auto invite</strong>. Upload listing
                    photos on each property page for invite property cards.
                  </p>
                  <div className="mt-6">
                    {branding ? (
                      <BrandingUrlsForm
                        initialLogoUrl={branding.brand_logo_url}
                        initialProfilePhotoUrl={branding.profile_photo_url}
                        companyNamePreview={branding.company_name}
                        agentNamePreview={branding.agent_name}
                      />
                    ) : null}
                  </div>
                  <h3 className="mt-10 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    Password
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Change the password you use to sign in. This invalidates any password reset links we have
                    emailed you.
                  </p>
                  <div className="mt-6">
                    <ChangePasswordForm />
                  </div>
                </div>
              ),
            }}
          />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
