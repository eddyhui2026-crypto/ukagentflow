import type { Metadata } from "next";
import Link from "next/link";
import { Cookie, Info, ShieldCheck, Settings2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookies Policy — UKAgentFlow",
  description:
    "How UKAgentFlow uses cookies and similar technologies for sign-in, security, and the agent workspace.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "28 March 2026";

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 dark:bg-zinc-950 dark:text-zinc-200">
      <header className="border-b border-slate-100 bg-slate-50 px-6 py-14 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center space-x-3">
            <Cookie className="text-slate-900 dark:text-zinc-100" size={32} aria-hidden />
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-zinc-50">
              Cookies Policy
            </h1>
          </div>
          <p className="mb-4 font-medium text-slate-500 dark:text-zinc-400">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            <Link
              href="/"
              className="font-medium text-slate-900 hover:underline dark:text-zinc-200"
            >
              Home
            </Link>
            {" · "}
            <Link href="/privacy" className="font-medium hover:underline">
              Privacy
            </Link>
            {" · "}
            <Link href="/terms" className="font-medium hover:underline">
              Terms
            </Link>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 leading-relaxed">
        <section className="mb-12">
          <div className="mb-4 flex items-center space-x-3">
            <Info className="text-slate-900 dark:text-zinc-100" size={24} aria-hidden />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">
              1. What are cookies?
            </h2>
          </div>
          <p className="text-slate-600 dark:text-zinc-400">
            Cookies are small text files stored on your device when you visit a website. They can keep
            you signed in, protect against abuse, or remember choices. At{" "}
            <strong>UKAgentFlow</strong>, we use cookies and similar storage (for example{" "}
            <strong>local storage</strong> where your browser allows it) mainly so estate agents can
            use the workspace safely.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-zinc-50">
            2. How we use cookies
          </h2>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="mb-2 flex items-center space-x-2">
                <ShieldCheck className="text-slate-900 dark:text-zinc-100" size={20} aria-hidden />
                <h3 className="font-bold text-slate-900 dark:text-zinc-50">
                  Strictly necessary (authentication &amp; security)
                </h3>
              </div>
              <p className="mb-4 text-sm text-slate-600 dark:text-zinc-400">
                Required to log in, maintain your agent session, and secure requests (for example CSRF
                protection). Without these, dashboard and property pages will not work reliably.
              </p>
              <ul className="rounded-lg border border-slate-100 bg-white p-3 text-xs leading-relaxed text-slate-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                <li className="mb-2">
                  • <span className="font-mono text-slate-500 dark:text-zinc-500">Session / JWT</span>{" "}
                  cookies set by our authentication library (Auth.js / NextAuth). Exact names can vary
                  (e.g. names prefixed with <code className="text-slate-800 dark:text-zinc-300">authjs</code>{" "}
                  or secure variants on HTTPS).
                </li>
                <li>
                  • These cookies hold tokens or flags needed to recognise your logged-in session — not
                  your password.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-2 flex items-center space-x-2">
                <Settings2 className="text-slate-900 dark:text-zinc-100" size={20} aria-hidden />
                <h3 className="font-bold text-slate-900 dark:text-zinc-50">
                  Performance &amp; analytics
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                <strong>We do not currently use advertising cookies.</strong> We may introduce optional
                analytics (for example to understand aggregate traffic) in future. If we do, we will
                update this policy and, where required, seek consent before non-essential cookies are
                set.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-zinc-50">
            3. Controlling cookies
          </h2>
          <p className="mb-4 text-slate-600 dark:text-zinc-400">
            Browsers let you block or delete cookies. Blocking <strong>all</strong> cookies may stop you
            signing in or may sign you out unexpectedly.
          </p>
          <div className="rounded-2xl bg-slate-900 p-6 text-white dark:bg-zinc-800">
            <p className="text-sm italic">
              Note: Disabling strictly necessary authentication cookies will prevent you from using the
              agent dashboard and related features until you allow them again or use a fresh session.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-zinc-50">
            4. Third-party technologies
          </h2>
          <p className="text-slate-600 dark:text-zinc-400">
            Public feedback and vendor pages load from our app domain; buyer forms do not require buyers
            to create an account. Your hosting provider or CDN may process technical headers and similar
            data as part of delivering the site — see their documentation for details.
          </p>
          <p className="mt-4 text-slate-600 dark:text-zinc-400">
            <strong>Payments:</strong> the product does not currently take card payments in-app. If we
            add a payment provider later, their cookies or scripts may apply on checkout pages only; we
            will list them here when that launches.
          </p>
          <p className="mt-4 text-slate-600 dark:text-zinc-400">
            <strong>Google Analytics:</strong> we do not currently embed Google Analytics. This section
            will be updated if that changes.
          </p>
        </section>

        <section className="border-t border-slate-100 pt-12 text-center dark:border-zinc-800">
          <p className="mb-6 text-slate-500 dark:text-zinc-400">Questions about cookies?</p>
          <a
            href="mailto:support@ukagentflow.com"
            className="inline-block rounded-xl bg-slate-900 px-8 py-3 font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Contact support
          </a>
        </section>
      </main>

      <footer className="bg-slate-50 py-12 text-center text-xs text-slate-400 dark:bg-zinc-900/50 dark:text-zinc-500">
        <p>
          © {new Date().getFullYear()} UKAgentFlow.{" "}
          <Link href="/privacy" className="underline hover:text-slate-600 dark:hover:text-zinc-300">
            Privacy
          </Link>
          {" · "}
          <Link href="/terms" className="underline hover:text-slate-600 dark:hover:text-zinc-300">
            Terms
          </Link>
        </p>
      </footer>
    </div>
  );
}
