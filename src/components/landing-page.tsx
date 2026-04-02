import Link from "next/link";
import {
  BarChart3,
  CalendarClock,
  CheckCircle,
  LayoutDashboard,
  Lock,
  MessageCircle,
  QrCode,
  Share2,
  Shield,
} from "lucide-react";
import { LandingHeroFeedbackMock, LandingProductSamples } from "@/components/landing-product-samples";
import { UkAgentFlowLogo } from "@/components/ukagentflow-logo";

type LandingPageProps = {
  isAuthenticated: boolean;
};

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* --- Navigation --- */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center" aria-label="UKAgentFlow home">
          <UkAgentFlowLogo variant="lockup" />
        </Link>
        <div className="hidden space-x-8 text-sm font-medium text-slate-600 md:flex dark:text-zinc-400">
          <a href="#how-it-works" className="transition hover:text-slate-900 dark:hover:text-zinc-50">
            How it works
          </a>
          <a href="#features" className="transition hover:text-slate-900 dark:hover:text-zinc-50">
            Features
          </a>
          <a href="#pricing" className="transition hover:text-slate-900 dark:hover:text-zinc-50">
            Pricing
          </a>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* --- Hero --- */}
      <section className="bg-slate-50 px-6 py-16 md:py-20 dark:bg-zinc-900/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="max-w-xl flex-1 text-center lg:text-left">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-500">
              Viewing feedback · built for England & Wales
            </p>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl dark:text-zinc-50">
              Stop chasing buyers for feedback.
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-lg text-slate-600 lg:mx-0 dark:text-zinc-400">
              Collect structured viewing feedback by{" "}
              <span className="font-semibold text-slate-900 dark:text-zinc-100">
                email, WhatsApp, and on-site QR
              </span>
              — then give vendors a calm, read-only live link so you spend less time on the phone.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              {isAuthenticated ? (
                <Link
                  href="/properties"
                  className="rounded-xl bg-slate-900 px-8 py-4 text-center font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Open properties
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="rounded-xl bg-slate-900 px-8 py-4 text-center font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Create your workspace
                </Link>
              )}
              <a
                href="#product-samples"
                className="rounded-xl border border-slate-200 bg-white px-8 py-4 text-center font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                See live layouts
              </a>
            </div>
            <p className="mt-6 text-sm font-medium text-slate-600 dark:text-zinc-400">
              14 days free trial + no credit card required.
            </p>
            <p className="mt-1 text-sm text-slate-400 dark:text-zinc-500">
              Subscribe any time in-app via Stripe; if you pay mid-trial, billing lines up so your{" "}
              <span className="font-medium text-slate-600 dark:text-zinc-400">first charge is after</span> your
              original trial end — you keep the days left on the clock.
            </p>
          </div>
          <div className="flex w-full max-w-md flex-1 flex-col lg:max-w-lg">
            <div className="w-full max-w-md">
              <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                Buyer feedback link — same form your invitations open
              </p>
              <LandingHeroFeedbackMock />
            </div>
          </div>
        </div>
      </section>

      <div id="product-samples">
        <LandingProductSamples />
      </div>

      {/* --- How it works --- */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900 dark:text-zinc-50">How it works</h2>
          <p className="text-slate-500 dark:text-zinc-400">Three steps from viewing to vendor-ready insight.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Schedule the viewing",
              body: "Add buyers in UKAgentFlow. Choose automatic invite emails (sent the morning after the viewing, ~9:00 UK) or copy a ready-made email draft.",
              icon: CalendarClock,
            },
            {
              step: "2",
              title: "Buyers respond in one tap",
              body: "Personal links, WhatsApp hand-off, or a QR code at the property — buyers confirm with the email you already hold, then complete your branded form.",
              icon: QrCode,
            },
            {
              step: "3",
              title: "Act & evidence",
              body: "Dashboard highlights hot interest and follow-up status. Export CSV for analysis; share an anonymised pack or a live vendor portal link when you need proof.",
              icon: LayoutDashboard,
            },
          ].map(({ step, title, body, icon: Icon }) => (
            <div
              key={step}
              className="relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                {step}
              </span>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-zinc-100">
                <Icon size={24} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-zinc-50">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Features --- */}
      <section id="features" className="border-t border-slate-100 px-6 py-24 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-zinc-50">
              Everything you need to manage vendors — calmly.
            </h2>
            <p className="text-slate-500 dark:text-zinc-400">
              Opinionated for UK estate agency: interest levels, price view, second viewings, and more.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-900 transition-colors group-hover:bg-slate-900 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900">
                <MessageCircle size={24} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-zinc-50">
                WhatsApp &amp; email
              </h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                One tap opens WhatsApp with a prefilled message and the buyer&apos;s unique link. Or
                copy a full email draft (To, subject, body) from the property screen.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-900 transition-colors group-hover:bg-slate-900 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900">
                <QrCode size={24} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-zinc-50">
                QR at the property
              </h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                Print a property QR for the hall or kitchen. Viewers enter the email you hold; we route
                them to the right feedback form — no app for buyers to install.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-900 transition-colors group-hover:bg-slate-900 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900">
                <Share2 size={24} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-zinc-50">
                Vendor live link
              </h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                Share a read-only snapshot so vendors see feedback without calling you. Names stay
                anonymised; you stay in control of the narrative on harder conversations.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-900 transition-colors group-hover:bg-slate-900 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900">
                <LayoutDashboard size={24} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-zinc-50">
                Agent dashboard
              </h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                Hot interest floats to the top. Mark rows as New, Called, or Followed up. See viewing
                date vs submitted time so you spot slow replies.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-900 transition-colors group-hover:bg-slate-900 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900">
                <BarChart3 size={24} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-zinc-50">
                Reports vendors respect
              </h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                CSV exports with price feedback labels (e.g. Too expensive / Fair price / Good value)
                for quick pivot tables — and an optional anonymised export for GDPR-conscious packs.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-900 transition-colors group-hover:bg-slate-900 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900">
                <Shield size={24} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-zinc-50">
                Sensible guardrails
              </h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                Token expiry, light rate limits on public forms, and invites you can schedule — less
                spam, fewer abandoned links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Pricing --- */}
      <section id="pricing" className="bg-slate-50 px-6 py-24 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-zinc-50">
            Simple, transparent pricing
          </h2>
          <p className="mb-12 text-slate-500 dark:text-zinc-400">
            <span className="font-medium text-slate-700 dark:text-zinc-300">
              14 days free trial + no credit card required.
            </span>{" "}
            Example prices for launch — confirm VAT before you go live.
          </p>

          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-10 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="absolute right-0 top-0 rounded-bl-lg bg-slate-900 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white dark:bg-zinc-100 dark:text-zinc-900">
              Example plan
            </div>
            <p className="mb-6 rounded-xl bg-slate-50 px-4 py-3 text-left text-sm text-slate-600 dark:bg-zinc-800/80 dark:text-zinc-300">
              Start on the trial with no card. If you subscribe early, Stripe is set so you still get your
              full trial window — you are not charged until the original trial end date.
            </p>
            <h3 className="mb-4 text-lg font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              Viewing feedback
            </h3>
            <div className="mb-2">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-zinc-50">£12</span>
              <span className="ml-2 text-slate-400 dark:text-zinc-500">/ month</span>
            </div>
            <p className="mb-8 text-base font-medium text-slate-700 dark:text-zinc-300">
              <span className="tabular-nums">£120</span> / year if you pay annually — save{" "}
              <span className="tabular-nums font-bold text-emerald-600 dark:text-emerald-400">£24</span> vs twelve
              monthly payments (<span className="tabular-nums">£144</span>).
            </p>
            <div className="mx-auto mb-10 max-w-sm space-y-4 text-left">
              {[
                "Properties & feedback at scale (fair-use)",
                "Email drafts + optional auto-invites (cron)",
                "WhatsApp hand-off + property QR",
                "Vendor portal + anonymised CSV",
                "Hot-first dashboard & follow-up statuses",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-slate-600 dark:text-zinc-300">
                  <CheckCircle size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <Link
              href="/register"
              className="block w-full rounded-xl bg-slate-900 py-4 text-center font-bold text-white shadow-lg transition hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Get started — <span className="tabular-nums">£12</span>/mo or <span className="tabular-nums">£120</span>
              /yr
            </Link>
            <p className="mt-4 text-xs text-slate-400 dark:text-zinc-500">
              Example figures for launch (yearly saves <span className="tabular-nums">£24</span> / ~17% vs monthly for a
              full year). Trial: 14 days, no card to register; paid checkout uses Stripe.
            </p>
          </div>
        </div>
      </section>

      {/* --- Roadmap --- */}
      <section className="mx-auto max-w-7xl border-t border-slate-100 px-6 py-20 dark:border-zinc-800">
        <div className="flex flex-col items-center justify-between gap-8 opacity-70 md:flex-row">
          <div>
            <h4 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              The future of UKAgentFlow
            </h4>
            <p className="text-slate-500 dark:text-zinc-400">A fuller toolkit for modern agents.</p>
          </div>
          <div className="grid grid-cols-2 gap-6 text-xs font-semibold text-slate-400 md:grid-cols-4 dark:text-zinc-500">
            <div className="flex items-center">
              <Lock size={12} className="mr-2 shrink-0" /> Offer tracker
            </div>
            <div className="flex items-center">
              <Lock size={12} className="mr-2 shrink-0" /> Open day manager
            </div>
            <div className="flex items-center">
              <Lock size={12} className="mr-2 shrink-0" /> Reputation monitor
            </div>
            <div className="flex items-center">
              <Lock size={12} className="mr-2 shrink-0" /> Doc checklist
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-50 px-6 py-12 text-center text-sm text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
        <p className="mb-4">© {new Date().getFullYear()} UKAgentFlow. Built for UK estate agents.</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/login" className="hover:text-slate-600 dark:hover:text-zinc-300">
            Log in
          </Link>
          <Link href="/register" className="hover:text-slate-600 dark:hover:text-zinc-300">
            Register
          </Link>
          <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-zinc-300">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-slate-600 dark:hover:text-zinc-300">
            Terms
          </Link>
          <Link href="/cookies" className="hover:text-slate-600 dark:hover:text-zinc-300">
            Cookies
          </Link>
        </div>
      </footer>
    </div>
  );
}
