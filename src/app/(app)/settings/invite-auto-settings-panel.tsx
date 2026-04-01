"use client";

import { useRef } from "react";
import type { SettingsBrandingRow } from "@/lib/companies/queries";
import { AutoInviteTemplatePreview } from "./email-template-preview";
import { FeedbackInviteTemplatesForm } from "./feedback-invite-templates-form";
import { PublicFooterTemplateSettingsForm } from "./public-footer-template-settings-form";

export function InviteAutoSettingsPanel({
  initialSubject,
  initialBody,
  initialInviteShowPropertyPhoto,
  initialInviteIncludeFooter,
  usingDefaults,
  branding,
}: {
  initialSubject: string;
  initialBody: string;
  initialInviteShowPropertyPhoto: boolean;
  initialInviteIncludeFooter: boolean;
  usingDefaults: boolean;
  branding: SettingsBrandingRow | null;
}) {
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const showPhotoRef = useRef<HTMLInputElement>(null);
  const includeFooterRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <FeedbackInviteTemplatesForm
        subjectRef={subjectRef}
        bodyRef={bodyRef}
        showPhotoRef={showPhotoRef}
        includeFooterRef={includeFooterRef}
        initialSubject={initialSubject}
        initialBody={initialBody}
        initialInviteShowPropertyPhoto={initialInviteShowPropertyPhoto}
        initialInviteIncludeFooter={initialInviteIncludeFooter}
        usingDefaults={usingDefaults}
      />
      {branding ? (
        <PublicFooterTemplateSettingsForm
          key={`${branding.public_footer_template ?? ""}\0${branding.public_footer_show_agent_photo}`}
          initialStoredTemplate={branding.public_footer_template}
          initialShowAgentPhoto={branding.public_footer_show_agent_photo}
          initialInviteIncludeFooter={branding.invite_use_system_footer}
          previewAgentName={branding.agent_name}
          previewCompanyName={branding.company_name}
          previewProfilePhotoUrl={branding.profile_photo_url}
        />
      ) : null}

      <AutoInviteTemplatePreview
        subjectRef={subjectRef}
        bodyRef={bodyRef}
        showPhotoRef={showPhotoRef}
        includeFooterRef={includeFooterRef}
      />
    </div>
  );
}
