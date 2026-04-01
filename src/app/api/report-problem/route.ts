import { auth } from "@/auth";
import { sendErrorReportEmail } from "@/lib/email/error-report";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MIN_LEN = 10;
const MAX_LEN = 4000;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email || !session.user.companyId || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const msg =
    typeof (body as { message?: unknown }).message === "string"
      ? (body as { message: string }).message.trim()
      : "";
  const pageUrlRaw =
    typeof (body as { pageUrl?: unknown }).pageUrl === "string"
      ? (body as { pageUrl: string }).pageUrl.trim()
      : "";

  if (msg.length < MIN_LEN) {
    return NextResponse.json(
      {
        error: `Please describe what went wrong (at least ${MIN_LEN} characters).`,
      },
      { status: 400 },
    );
  }
  if (msg.length > MAX_LEN) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const pageUrl =
    pageUrlRaw.length > 2000 ? pageUrlRaw.slice(0, 2000) : pageUrlRaw;

  const name =
    session.user.name?.trim() || session.user.email.split("@")[0] || "User";

  const result = await sendErrorReportEmail({
    reporterName: name,
    reporterEmail: session.user.email,
    companyId: session.user.companyId,
    message: msg,
    pageUrl: pageUrl || "(not provided)",
  });

  if (!result.sent) {
    console.error("[report-problem]", result.reason);
    return NextResponse.json(
      {
        error:
          "Could not send the report. Check RESEND_API_KEY / RESEND_FROM, or try again later.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
