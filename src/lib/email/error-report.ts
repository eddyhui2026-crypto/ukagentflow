import { Resend } from "resend";
import { getAppBaseUrl } from "@/lib/env/app-url";

export type SendErrorReportParams = {
  /** Logged-in agent reporting from the app */
  reporterName: string;
  reporterEmail: string;
  companyId: string;
  message: string;
  pageUrl: string;
};

export type ErrorReportSendResult =
  | { sent: true }
  | { sent: false; reason: string };

/** In-app issue reports from agents. */
export async function sendErrorReportEmail(
  params: SendErrorReportParams,
): Promise<ErrorReportSendResult> {
  const to =
    process.env.ERROR_REPORT_EMAIL?.trim() || "eddyhui2026@gmail.com";

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();

  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY not set" };
  }
  if (!from) {
    return { sent: false, reason: "RESEND_FROM not set" };
  }

  const appUrl = getAppBaseUrl();
  const subject = `[UKAgentFlow] Issue report from ${params.reporterName}`;

  const text = `An issue was reported from the UKAgentFlow web app.

Reporter: ${params.reporterName} <${params.reporterEmail}>
Company ID: ${params.companyId}
Page / URL: ${params.pageUrl}
App base URL: ${appUrl}

---

${params.message}

---

(This message was sent via the in-app Report issue button.)`;

  const html = `<p>An issue was reported from the UKAgentFlow web app.</p>
<ul>
<li><strong>Reporter:</strong> ${escapeHtml(params.reporterName)} &lt;${escapeHtml(params.reporterEmail)}&gt;</li>
<li><strong>Company ID:</strong> <code>${escapeHtml(params.companyId)}</code></li>
<li><strong>Page / URL:</strong> ${escapeHtml(params.pageUrl)}</li>
<li><strong>App base URL:</strong> ${escapeHtml(appUrl)}</li>
</ul>
<hr />
<pre style="white-space:pre-wrap;font-family:system-ui,sans-serif">${escapeHtml(params.message)}</pre>
<p style="color:#666;font-size:13px">Sent via the in-app Report issue button.</p>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    html,
    replyTo: params.reporterEmail,
  });

  if (error) {
    return { sent: false, reason: error.message ?? "Resend error" };
  }
  return { sent: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
