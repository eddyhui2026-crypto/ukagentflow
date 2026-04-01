import { auth } from "@/auth";
import {
  buildFeedbackCsv,
  listFeedbackForCsvExport,
  parseExportFilters,
} from "@/lib/reports/feedback-export";

export const dynamic = "force-dynamic";

function filenameForDownload(vendor: boolean) {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const suffix = vendor ? "vendor-anonymised" : "feedback";
  return `ukagentflow-${suffix}-${y}-${m}-${day}.csv`;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.companyId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filters = parseExportFilters(searchParams);

  if (filters.from && filters.to && filters.from > filters.to) {
    return new Response("Invalid range: from must be before or equal to to.", {
      status: 400,
    });
  }

  const rows = await listFeedbackForCsvExport(session.user.companyId, filters);
  const csv = buildFeedbackCsv(rows, { vendorAnonymised: filters.vendorAnonymised });

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filenameForDownload(filters.vendorAnonymised)}"`,
      "Cache-Control": "no-store",
    },
  });
}
