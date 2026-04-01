import { PreViewingOutreachCopy } from "@/components/pre-viewing-outreach-copy";
import { getAppBaseUrl } from "@/lib/env/app-url";
import {
  buildPreViewingEmailDraft,
  buildPreViewingWhatsAppText,
  type PrequalShareTemplatesInput,
} from "@/lib/prequal/share-outreach";
import { listLettingPrequalForProperty } from "@/lib/lettings/prequal-queries";

function incomeLabel(band: string) {
  switch (band) {
    case "25k_plus":
      return "£25k+";
    case "35k_plus":
      return "£35k+";
    case "50k_plus":
      return "£50k+";
    case "unspecified":
      return "Not stated";
    default:
      return band;
  }
}

function petsLabel(has: boolean | null) {
  if (has === true) return "Yes";
  if (has === false) return "No";
  return "Not stated";
}

export async function PropertyLettingPrequalCard({
  propertyId,
  companyId,
  prequalShareToken,
  propertyLine,
  prequalShareTemplates,
}: {
  propertyId: string;
  companyId: string;
  prequalShareToken: string;
  propertyLine: string;
  prequalShareTemplates: PrequalShareTemplatesInput;
}) {
  const rows = await listLettingPrequalForProperty(propertyId, companyId);
  const base = getAppBaseUrl().replace(/\/$/, "");
  const url = `${base}/prequal/${prequalShareToken}`;
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
          Pre-viewing applicants
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
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="py-2 pr-4">Submitted</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Income</th>
                <th className="py-2 pr-4">Pets</th>
                <th className="py-2 pr-4">Move-in</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-zinc-100 dark:border-zinc-800/80"
                >
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
                    {incomeLabel(r.annual_income_band)}
                  </td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                    {petsLabel(r.has_pets)}
                    {r.has_pets && r.pets_detail ? (
                      <span className="block text-xs text-zinc-500">({r.pets_detail})</span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                    {r.target_move_in_date ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
