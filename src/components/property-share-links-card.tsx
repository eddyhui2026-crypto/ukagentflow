import QRCode from "qrcode";
import { CopyPlainButton } from "@/components/copy-plain-button";
import { PreViewingOutreachCopy } from "@/components/pre-viewing-outreach-copy";
import { QrPngDownloadButton } from "@/components/qr-download-button";
import { getAppBaseUrl } from "@/lib/env/app-url";
import {
  buildPreViewingEmailDraft,
  buildPreViewingWhatsAppText,
  type PrequalShareTemplatesInput,
} from "@/lib/prequal/share-outreach";

export async function PropertyShareLinksCard({
  vendorPortalToken,
  buyerQrToken,
  lettingPrequalShareToken,
  salePrequalShareToken,
  listingType,
  propertyLine,
  prequalShareTemplates,
}: {
  vendorPortalToken: string;
  buyerQrToken: string;
  lettingPrequalShareToken: string;
  salePrequalShareToken: string;
  listingType: "sale" | "letting";
  propertyLine: string;
  prequalShareTemplates: PrequalShareTemplatesInput;
}) {
  const base = getAppBaseUrl().replace(/\/$/, "");
  const vendorUrl = `${base}/vendor/${vendorPortalToken}`;
  const quickUrl = `${base}/feedback/quick/${buyerQrToken}`;
  const prequalUrl =
    listingType === "letting"
      ? `${base}/prequal/${lettingPrequalShareToken}`
      : listingType === "sale"
        ? `${base}/prequal/sale/${salePrequalShareToken}`
        : null;
  const prequalTitle =
    listingType === "letting" ? "Pre-viewing qualification (to let)" : "Pre-viewing checks (for sale)";
  const prequalBody =
    listingType === "letting"
      ? "Share before viewings so applicants confirm income, pets, move-in and visa status."
      : "Share before viewings: chain position, mortgage DIP / cash buyer, solicitor and timescale.";

  const prequalWhatsAppText =
    prequalUrl && (listingType === "sale" || listingType === "letting")
      ? buildPreViewingWhatsAppText({
          templates: prequalShareTemplates,
          propertyLine,
          prequalUrl,
        })
      : "";
  const prequalEmailDraft =
    prequalUrl && (listingType === "sale" || listingType === "letting")
      ? buildPreViewingEmailDraft({
          templates: prequalShareTemplates,
          propertyLine,
          prequalUrl,
        })
      : "";

  /** High resolution for download and sharp display when scaled down. */
  let qrDataUrl: string;
  try {
    qrDataUrl = await QRCode.toDataURL(quickUrl, {
      width: 640,
      margin: 2,
      color: { dark: "#18181bff", light: "#ffffffff" },
    });
  } catch {
    qrDataUrl = "";
  }

  const qrFileSafe =
    propertyLine
      .replace(/[^\w\s-]/g, "")
      .trim()
      .slice(0, 40)
      .replace(/\s+/g, "-")
      .toLowerCase() || "property";
  const qrPersonWord = listingType === "letting" ? "viewers" : "buyers";
  const qrDownloadName =
    listingType === "letting"
      ? `ukagentflow-viewing-qr-${qrFileSafe}.png`
      : `ukagentflow-buyer-qr-${qrFileSafe}.png`;
  const cardTitle =
    listingType === "letting" ? "Vendor portal & viewing QR" : "Vendor portal & buyer QR";
  const qrColumnTitle =
    listingType === "letting" ? "Viewing feedback QR (email check)" : "Buyer QR (email check)";
  const qrColumnBlurb =
    listingType === "letting"
      ? "Scanning opens a short page: the viewer enters the same email you used to register them, then goes to their personal feedback link."
      : "Scanning opens a short page: the buyer enters the same email you used to register them, then goes to their personal feedback link.";

  return (
    <div className="mt-8 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{cardTitle}</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Share the <strong className="font-medium">live link</strong> with your vendor (read-only,
          anonymised {qrPersonWord}). Print or display the <strong className="font-medium">QR code</strong>{" "}
          at the property so {qrPersonWord} can open the form with the email address your CRM holds for them.
          Use{" "}
          <strong className="font-medium">Download PNG</strong> for a print-ready image (high resolution).
          Treat these URLs like passwords — anyone with the link can open them.
        </p>
      </div>
      <div
        className={`grid gap-6 p-4 sm:p-6 ${prequalUrl ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}
      >
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            Vendor live link
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {propertyLine} — rolling buyer feedback snapshot (no log-in).
          </p>
          <p className="break-all font-mono text-[11px] text-zinc-800 dark:text-zinc-200">{vendorUrl}</p>
          <CopyPlainButton text={vendorUrl} label="Copy vendor link" />
        </div>
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            {qrColumnTitle}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{qrColumnBlurb}</p>
          {qrDataUrl ? (
            <>
              <div className="flex justify-center rounded-md bg-white p-3 dark:bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Scan to leave viewing feedback"
                  width={220}
                  height={220}
                  className="max-h-[220px] max-w-[220px] object-contain"
                />
              </div>
              <QrPngDownloadButton dataUrl={qrDataUrl} fileName={qrDownloadName} />
            </>
          ) : null}
          <p className="break-all font-mono text-[11px] text-zinc-800 dark:text-zinc-200">{quickUrl}</p>
          <CopyPlainButton text={quickUrl} label="Copy QR page URL" />
        </div>
        {prequalUrl ? (
          <div
            className={`space-y-3 rounded-lg border p-4 dark:bg-zinc-950/30 ${
              listingType === "letting"
                ? "border-violet-200 bg-violet-50/40 dark:border-violet-900 dark:bg-violet-950/30"
                : "border-sky-200 bg-sky-50/50 dark:border-sky-900 dark:bg-sky-950/25"
            }`}
          >
            <h3
              className={`text-xs font-semibold uppercase tracking-wide ${
                listingType === "letting"
                  ? "text-violet-800 dark:text-violet-200"
                  : "text-sky-900 dark:text-sky-200"
              }`}
            >
              {prequalTitle}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {prequalBody} One link per instruction; resubmissions from the same email update the
              row.
            </p>
            {prequalUrl ? (
              <PreViewingOutreachCopy
                whatsappText={prequalWhatsAppText}
                emailDraft={prequalEmailDraft}
                linkUrl={prequalUrl}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
