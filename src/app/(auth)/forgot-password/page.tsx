import Link from "next/link";
import { ForgotPasswordForm } from "./ui/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Forgot password
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            We will email you a one-time link to choose a new password.
          </p>
        </div>
        <ForgotPasswordForm />
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
