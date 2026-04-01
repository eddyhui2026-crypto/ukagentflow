import Link from "next/link";
import { isPasswordResetTokenFormat } from "@/lib/auth/password-reset-token";
import { ResetPasswordForm } from "./ui/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token?.trim() ?? "";
  const valid = isPasswordResetTokenFormat(token);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Set a new password
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Choose a password at least 8 characters long.
          </p>
        </div>
        {valid ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            This reset link is missing or invalid. Open the link from your email, or{" "}
            <Link href="/forgot-password" className="font-medium underline">
              request a new one
            </Link>
            .
          </p>
        )}
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
