import { PreViewingOutreachCopy } from "@/components/pre-viewing-outreach-copy";
import { getAppBaseUrl } from "@/lib/env/app-url";
import {
  buildPreViewingEmailDraft,
  buildPreViewingWhatsAppText,
  type PrequalShareTemplatesInput,
} from "@/lib/prequal/share-outreach";
import { listSalePrequalForProperty } from "@/lib/sales/prequal-queries";

function positionLabel(v: string) {
  switch (v) {
    case "ftb":
      return "FTB";
    case "no_dependent_sale":
      return "No related sale";
    case "sale_on_market":
      return "Sale on market";
    case "sale_not_on_market":
      return "Sale not on market yet";
    case "sale_sold_stc":
      return "Sold STC / under offer";
    case "unspecified":
      return "Not stated";
    default:
      return v;
  }
}

function fundingLabel(v: string) {
  switch (v) {
    case "mortgage":
      return "Mortgage";
    case "cash":
      return "Cash";
    default:
      return v;
  }
}

function dipLabel(v: string) {
  switch (v) {
    case "have_dip":
      return "Has DIP";
    case "pending":
      return "DIP pending";
    case "not_yet":
      return "No DIP yet";
    case "na":
      return "N/A (cash)";
    default:
      return v;
  }
}

function solicitorLabel(v: string) {
  switch (v) {
    case "instructed":
      return "Instructed";
    case "arranging":
      return "Arranging";
    case "not_yet":
      return "Not yet";
    case "unspecified":
      return "Not stated";
    default:
      return v;
  }
}

function timescaleLabel(v: string) {
  switch (v) {
    case "asap":
      return "ASAP";
    case "1_3_months":
      return "1–3 mo";
    case "3_6_months":
      return "3–6 mo";
    case "6_plus_months":
      return "6+ mo";
    case "researching":
      return "Researching";
    case "unspecified":
      return "Not stated";
    default:
      return v;
  }
}

export async function PropertySalePrequalCard({
  propertyId,
  companyId,
  salePrequalShareToken,
  propertyLine,
  prequalShareTemplates,
}: {
  propertyId: string;
  companyId: string;
  salePrequalShareToken: string;
  propertyLine: string;
  prequalShareTemplates: PrequalShareTemplatesInput;
}) {
  const rows = await listSalePrequalForProperty(propertyId, companyId);
  const base = getAppBaseUrl().replace(/\/$/, "");
  const url = `${base}/prequal/sale/${salePrequalShareToken}`;
  const whatsappText = buildPreViewingWhatsAppText({
    templates: prequalShareTemplates,
    propertyLine,
    prequalUrl: url,
  });
  const emailDraft = buildPreViewingEmailDraft({
    templates: prequalShareTemplates,
    propertyLine,
    prequalUrl: url,
  });

  return (
    <div className="mt-8 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Pre-viewing buyer checks
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Send the link by WhatsApp or email (message includes the URL), or copy the raw link below.
          Same email resubmitting updates the existing row.
        </p>
        <div className="mt-3">
          <PreViewingOutreachCopy
            whatsappText={whatsappText}
            emailDraft={emailDraft}
            linkUrl={url}
          />
        </div>
      </div>
      <div className="overflow-x-auto p-4 sm:p-6">
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No submissions yet.</p>
        ) : (
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="py-2 pr-4">Submitted</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Position</th>
                <th className="py-2 pr-4">Fund</th>
                <th className="py-2 pr-4">DIP</th>
                <th className="py-2 pr-4">Solicitor</th>
                <th className="py-2 pr-4">Timescale</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-800/80">
                  <td className="py-2 pr-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                    {new Date(r.submitted_at).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="py-2 pr-4 text-zinc-900 dark:text-zinc-100">{r.name}</td>
                  <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">{r.email}</td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                    {r.phone ?? "—"}
                  </td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                    {positionLabel(r.buying_position)}
                  </td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                    {fundingLabel(r.funding_type)}
                  </td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                    {dipLabel(r.mortgage_dip_status)}
                  </td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                    {solicitorLabel(r.solicitor_status)}
                  </td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                    {timescaleLabel(r.target_purchase_band)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {rows.some((r) => r.additional_notes) ? (
          <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Latest notes
            </p>
            {rows.filter((r) => r.additional_notes).map((r) => (
              <p key={`${r.id}-notes`} className="text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{r.email}:</span>{" "}
                {r.additional_notes}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
