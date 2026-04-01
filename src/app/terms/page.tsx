import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, CreditCard, Scale, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — UKAgentFlow",
  description:
    "Terms governing use of UKAgentFlow for UK estate agents. Governing law: England and Wales.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "28 March 2026";

export default function TermsOfServicePage() {
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
              href="/privacy"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Privacy Policy
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
            Terms of Service
          </h1>
          <p className="font-medium text-slate-500 dark:text-zinc-400">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 leading-relaxed">
        <section className="mb-12">
          <div className="mb-4 flex items-center space-x-3">
            <Scale className="text-slate-900 dark:text-zinc-100" size={24} aria-hidden />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">
              1. Acceptance of terms
            </h2>
          </div>
          <p className="mb-4 text-slate-700 dark:text-zinc-300">
            By accessing or using <strong>UKAgentFlow</strong>, you agree to these Terms of Service. If
            you use the service on behalf of a business (for example an estate agency), you represent
            that you have authority to bind that organisation.
          </p>
          <p className="text-slate-700 dark:text-zinc-300">
            If you do not agree, do not use the service. We may update these terms from time to time;
            the &quot;Last updated&quot; date above will change and continued use after changes constitutes
            acceptance where the law allows.
          </p>
        </section>

        <section className="mb-12 rounded-2xl border border-slate-100 bg-slate-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mb-4 flex items-center space-x-3">
            <CreditCard className="text-slate-900 dark:text-zinc-100" size={20} aria-hidden />
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-50">
              2. Plans, fees &amp; billing
            </h2>
          </div>
          <ul className="space-y-4 text-sm text-slate-600 dark:text-zinc-400">
            <li>
              <span className="font-bold text-slate-900 dark:text-zinc-100">Current access:</span>{" "}
              Self-serve registration may be available without payment while we refine the product.
              Commercial pricing and payment methods (for example card billing via a third party) will be
              presented in-app or in an order form before you are charged.
            </li>
            <li>
              <span className="font-bold text-slate-900 dark:text-zinc-100">Illustrative fees:</span>{" "}
              Materials such as the marketing site may mention example prices (e.g. monthly or annual
              plans). <strong>They are not binding</strong> until confirmed at checkout or in a signed
              agreement.
            </li>
            <li>
              <span className="font-bold text-slate-900 dark:text-zinc-100">Renewals:</span> Where you
              subscribe for a paid term, renewal and cancellation will be controlled through the billing
              flow we provide (or your contract), unless we notify you otherwise.
            </li>
            <li>
              <span className="font-bold text-slate-900 dark:text-zinc-100">Refunds:</span> Unless a
              mandatory consumer right applies, fees are generally non-refundable once a billing period
              has started. Statutory rights for consumers in the UK are not affected.
            </li>
            <li>
              <span className="font-bold text-slate-900 dark:text-zinc-100">Add-ons:</span> Future modules
              may be offered separately. If so, we will describe fees and terms at the point of purchase.
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <div className="mb-4 flex items-center space-x-3">
            <AlertCircle className="text-slate-900 dark:text-zinc-100" size={24} aria-hidden />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">
              3. Your responsibilities
            </h2>
          </div>
          <p className="mb-4 text-slate-700 dark:text-zinc-300">
            UKAgentFlow is software to help you collect and organise viewing feedback. You remain
            solely responsible for your professional conduct and compliance, including:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-slate-600 dark:text-zinc-400">
            <li>Accuracy of property, vendor, and buyer details you enter.</li>
            <li>
              Your obligations under applicable law and regulation, and any rules that apply to you
              (for example requirements of your redress scheme, trade body, or regulator where
              relevant — e.g. Property Ombudsman / RICS rules may apply to your firm).
            </li>
            <li>
              Lawful basis and transparency when contacting buyers (including feedback invites by
              email, WhatsApp, or QR flows), and honouring opt-outs where required.
            </li>
            <li>
              Keeping account credentials secure and notifying us promptly of suspected unauthorised
              use.
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-zinc-50">
            4. Intellectual property &amp; data
          </h2>
          <p className="mb-4 text-slate-600 dark:text-zinc-400">
            You retain rights in the business data you upload (for example property addresses, buyer
            contact details, and feedback responses). Subject to the agreement and law, you grant us a
            licence to host, process, and display that data solely to operate the service for you.
          </p>
          <p className="mb-4 text-slate-600 dark:text-zinc-400">
            UKAgentFlow owns the service, its branding, and the underlying software (excluding your
            data).
          </p>
          <p className="text-slate-600 dark:text-zinc-400">
            We may use <strong>aggregated or de-identified</strong> information to improve reliability
            and security, and to understand usage at a statistical level. We will not sell personal
            data about your buyers as a business model; see our{" "}
            <Link href="/privacy" className="font-medium text-slate-900 underline dark:text-zinc-200">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="mb-12">
          <div className="mb-4 flex items-center space-x-3">
            <ShieldAlert className="text-slate-900 dark:text-zinc-100" size={24} aria-hidden />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">
              5. Disclaimers &amp; limitation of liability
            </h2>
          </div>
          <p className="mb-4 text-slate-600 dark:text-zinc-400">
            The service is provided <strong>as is</strong> and <strong>as available</strong>. We do not
            guarantee uninterrupted or error-free operation. To the fullest extent permitted by
            applicable law:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-sm text-slate-600 dark:text-zinc-400">
            <li>
              We are not liable for any indirect, consequential, or punitive loss, or loss of profit,
              revenue, goodwill, or data, except where such exclusion is not allowed by law.
            </li>
            <li>
              We are not responsible for the accuracy or completeness of third-party buyer feedback,
              nor for decisions you or vendors make based on it.
            </li>
            <li>
              We are not liable for failures of third-party networks or providers (including email,
              messaging apps, DNS, or hosting), except where our agreement with you states otherwise.
            </li>
          </ul>
          <p className="mt-4 text-sm text-slate-500 dark:text-zinc-500">
            Nothing in these terms excludes or limits liability for death or personal injury caused by
            negligence, fraud, or other liability that cannot be excluded under English law.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 mb-4">
            6. Suspension &amp; termination
          </h2>
          <p className="text-slate-600 dark:text-zinc-400">
            We may suspend or terminate access if you materially breach these terms, if required by law,
            or if necessary to protect the service or other users. Where reasonable, we will give notice.
            You may stop using the service at any time. On termination, your ability to access stored
            data may end; we will describe export and retention in your plan materials or the Privacy
            Policy. Until we publish a different policy, you should export data you need while your
            account remains active.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 mb-4">
            7. Governing law &amp; disputes
          </h2>
          <p className="text-slate-600 dark:text-zinc-400">
            These terms are governed by the law of <strong>England and Wales</strong>. The courts of
            England and Wales have exclusive jurisdiction, subject to mandatory rights you may have as
            a consumer in your home country.
          </p>
        </section>

        <section className="border-t border-slate-100 pt-12 text-center dark:border-zinc-800">
          <p className="mb-6 text-slate-500 dark:text-zinc-400">Questions about these terms?</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:space-x-4">
            <a
              href="mailto:legal@ukagentflow.com"
              className="inline-block rounded-xl bg-slate-900 px-8 py-3 font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Contact legal
            </a>
            <Link
              href="/"
              className="inline-block rounded-xl border border-slate-200 bg-white px-8 py-3 font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Back to home
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 py-12 text-center text-xs text-slate-400 dark:bg-zinc-900/50 dark:text-zinc-500">
        <p>
          © {new Date().getFullYear()} UKAgentFlow. Governing law: England and Wales.{" "}
          <Link href="/privacy" className="underline hover:text-slate-600 dark:hover:text-zinc-300">
            Privacy
          </Link>
          {" · "}
          <Link href="/cookies" className="underline hover:text-slate-600 dark:hover:text-zinc-300">
            Cookies
          </Link>
        </p>
      </footer>
    </div>
  );
}
