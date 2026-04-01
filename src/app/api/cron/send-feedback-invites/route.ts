import { sendDueFeedbackInvites } from "@/lib/viewings/send-scheduled-invites";

export const dynamic = "force-dynamic";

function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return new Response("CRON_SECRET not configured", { status: 503 });
  }
  const auth = request.headers.get("authorization")?.trim();
  if (auth !== `Bearer ${secret}`) {
    return unauthorized();
  }

  const result = await sendDueFeedbackInvites();
  return Response.json(result);
}

export async function POST(request: Request) {
  return GET(request);
}
