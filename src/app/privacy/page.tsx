import type { Metadata } from "next";
import Link from "next/link";
import { Eye, FileText, Lock, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — UKAgentFlow",
  description:
    "How UKAgentFlow handles personal data for estate agents and property buyers under UK GDPR.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "28 March 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 dark:bg-zinc-950 dark:text-zinc-200">
      <header className="border-b border-slate-100 bg-slate-50 px-6 py-14 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              ← UKAgentFlow home
            </Link>
            {" · "}
            <Link
              href="/terms"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Terms of Service
            </Link>
            {" · "}
            <Link
              href="/cookies"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Cookies
            </Link>
          </p>
          <h1 className="mb-4 text-4xl font-extrabold text-slate-900 dark:text-zinc-50">
            Privacy Policy
          </h1>
          <p className="font-medium text-slate-500 dark:text-zinc-400">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 leading-relaxed">
        <section className="mb-12">
          <div className="mb-4 flex items-center space-x-3">
            <ShieldCheck className="text-slate-900 dark:text-zinc-100" size={24} aria-hidden />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">1. Introduction</h2>
          </div>
          <p className="mb-4">
            Welcome to <strong>UKAgentFlow</strong>. We are committed to protecting the personal data
            of our users (estate agents and their teams) and of property buyers who submit viewing
            feedback through links or forms you share.
          </p>
          <p>
            This policy describes how we handle data in line with the{" "}
            <strong>UK General Data Protection Regulation (UK GDPR)</strong> and the Data Protection
            Act 2018. It is a summary — if anything here conflicts with an agreement you sign with
            us, the agreement takes precedence.
          </p>
        </section>

        <section className="mb-12 rounded-2xl border border-slate-100 bg-slate-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-zinc-50">
            2. Our role in data protection
          </h2>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="min-w-[120px] font-bold text-slate-900 dark:text-zinc-100">
                Data controller:
              </span>
              <span className="text-slate-700 dark:text-zinc-300">
                For agent account data (e.g. name, company, work email, and credentials you choose),
                we act as a controller together with normal contractual obligations to you.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="min-w-[120px] font-bold text-slate-900 dark:text-zinc-100">
                Processor:
              </span>
              <span className="text-slate-700 dark:text-zinc-300">
                Buyer contact details and feedback you collect through the service are processed{" "}
                <strong>on your instructions</strong> as the agent handling the sale. You remain
                responsible for your own privacy notices to buyers and for lawful basis (e.g.
                legitimate interests or consent where required).
              </span>
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <div className="mb-6 flex items-center space-x-3">
            <Eye className="text-slate-900 dark:text-zinc-100" size={24} aria-hidden />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">3. Data we collect</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-700">
                  <th className="py-3 font-bold text-slate-900 dark:text-zinc-50">Category</th>
                  <th className="py-3 font-bold text-slate-900 dark:text-zinc-50">Types of data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                <tr>
                  <td className="py-4 font-semibold text-slate-900 dark:text-zinc-100">Account</td>
                  <td className="py-4 text-slate-600 dark:text-zinc-400">
                    Name, email, company linkage, password hash (not the plain password).
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-slate-900 dark:text-zinc-100">Instruction</td>
                  <td className="py-4 text-slate-600 dark:text-zinc-400">
                    Property address, vendor name as you enter them; viewing dates; invite settings.
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-slate-900 dark:text-zinc-100">Buyers</td>
                  <td className="py-4 text-slate-600 dark:text-zinc-400">
                    Name, email, optional phone when you add them for a viewing.
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-slate-900 dark:text-zinc-100">
                    Feedback
                  </td>
                  <td className="py-4 text-slate-600 dark:text-zinc-400">
                    Ratings, interest level, price opinion, free-text comments, second-viewing
                    preference, optional structured fields (e.g. buying position, mortgage AIP,
                    highlight tags). Submitted time and technical tokens that identify the feedback
                    link.
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-slate-900 dark:text-zinc-100">Usage / logs</td>
                  <td className="py-4 text-slate-600 dark:text-zinc-400">
                    IP address and similar technical data for security and abuse prevention (e.g.
                    rate limits on public feedback forms), and standard server logs from hosting
                    providers.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-4 flex items-center space-x-3">
            <Lock className="text-slate-900 dark:text-zinc-100" size={24} aria-hidden />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">
              4. Security, storage & subprocessors
            </h2>
          </div>
          <p className="mb-4 text-slate-700 dark:text-zinc-300">
            We use reputable cloud infrastructure. Our primary database is designed to be hosted in{" "}
            <strong>UK or EEA</strong> regions where offered by the provider. Traffic to the app
            should use HTTPS (TLS) in production.
          </p>
          <p className="mb-4 text-slate-700 dark:text-zinc-300">
            Operational email (e.g. scheduled invite delivery where you enable it) may be sent via a
            transactional email provider; message content is limited to what your templates require.
          </p>
          <p className="text-slate-700 dark:text-zinc-300">
            <strong>Payments:</strong> the current product is focused on account registration and
            feedback collection. If we introduce card billing, card details will be handled only by a
            recognised payment processor — we will not store full card numbers on UKAgentFlow
            servers. This policy will be updated when that launches.
          </p>
        </section>

        <section className="mb-12">
          <div className="mb-4 flex items-center space-x-3">
            <FileText className="text-slate-900 dark:text-zinc-100" size={24} aria-hidden />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">
              5. Your rights (UK GDPR)
            </h2>
          </div>
          <p className="mb-4 text-slate-700 dark:text-zinc-300">
            Subject to applicable law, individuals may have rights including:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-slate-600 dark:text-zinc-400">
            <li>Access to personal data we hold about you.</li>
            <li>Rectification of inaccurate data.</li>
            <li>Erasure in certain circumstances (&quot;right to be forgotten&quot;).</li>
            <li>Restriction or objection to processing where the law allows.</li>
            <li>Data portability where processing is based on contract or consent and is automated.</li>
            <li>
              Complaint to the{" "}
              <a
                href="https://ico.org.uk/"
                className="font-medium text-slate-900 underline hover:text-slate-700 dark:text-zinc-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                ICO
              </a>
              .
            </li>
          </ul>
          <p className="mt-4 text-sm text-slate-500 dark:text-zinc-500">
            Buyers who want to exercise rights over feedback should normally contact the estate
            agent first, since the agent determines why the viewing was arranged.
          </p>
        </section>

        <section className="border-t border-slate-100 pt-12 text-center dark:border-zinc-800">
          <p className="mb-4 text-slate-500 dark:text-zinc-400">Questions about this policy?</p>
          <a
            href="mailto:support@ukagentflow.com"
            className="inline-block rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Contact support
          </a>
        </section>
      </main>

      <footer className="bg-slate-50 py-12 text-center text-xs text-slate-400 dark:bg-zinc-900/50 dark:text-zinc-500">
        <p>
          © {new Date().getFullYear()} UKAgentFlow.{" "}
          <Link href="/cookies" className="underline hover:text-slate-600 dark:hover:text-zinc-300">
            Cookies
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
