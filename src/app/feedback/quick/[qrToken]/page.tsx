import { ClosePublicFormButton } from "@/components/close-public-form-button";
import { getSql } from "@/lib/db/neon";
import { QuickClaimForm } from "./quick-claim-form";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Viewing feedback",
    robots: { index: false, follow: false },
  };
}

export default async function QuickFeedbackEntryPage({
  params,
}: {
  params: Promise<{ qrToken: string }>;
}) {
  const { qrToken: raw } = await params;
  const qrToken = decodeURIComponent(raw ?? "").trim();

  if (!qrToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Invalid link.</p>
      </div>
    );
  }

  const sql = getSql();
  const rows = await sql`
    SELECT address, postcode
    FROM properties
    WHERE buyer_qr_token = ${qrToken}
    LIMIT 1
  `;
  const prop = rows[0] as { address: string; postcode: string } | undefined;

  if (!prop) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <main className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Link not found</h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            This QR code or URL isn&apos;t valid. Ask your estate agent for an updated code.
          </p>
          <ClosePublicFormButton />
        </main>
      </div>
    );
  }

  const line = `${prop.address}, ${prop.postcode}`;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h1 className="text-center text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Thanks for viewing
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">{line}</p>
        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Enter the <strong className="font-medium text-zinc-800 dark:text-zinc-200">same email</strong> your
          agent used when they registered you for the viewing. We&apos;ll take you to your personal
          feedback form.
        </p>
        <QuickClaimForm qrToken={qrToken} />
      </main>
    </div>
  );
}
