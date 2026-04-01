import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UkAgentFlowLogo } from "@/components/ukagentflow-logo";
import {
  DEFAULT_FEEDBACK_FORM_LABELS,
  DEFAULT_PAGE_SUBTITLE,
  DEFAULT_PAGE_TITLE,
} from "@/lib/feedback/form-config";
import { cn } from "@/lib/utils";
import { INVITE_EMAIL_PREVIEW_SAMPLE_PROPERTY_IMAGE_URL } from "@/lib/email/invite-preview-samples";

const EMAIL_BG = "#f1f5f9";
const BTN = "#0284c7";
const TEXT = "#0f172a";
const MUTED = "#64748b";

const L = DEFAULT_FEEDBACK_FORM_LABELS;

/** Same listing-style photo as Settings → invite preview (`invite-preview-samples.ts`). */
const LANDING_SAMPLE_PROPERTY_PHOTO = INVITE_EMAIL_PREVIEW_SAMPLE_PROPERTY_IMAGE_URL;

/** Very light drop shadow so Email / Dashboard / Vendor tiles read slightly “lifted” off the page. */
const LANDING_SAMPLE_TILE_SHADOW =
  "shadow-[0_1px_3px_rgba(15,23,42,0.04),0_10px_32px_-12px_rgba(15,23,42,0.09)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.22),0_12px_36px_-12px_rgba(0,0,0,0.38)]";

type InviteEmailMockVariant = "hero" | "square";

function InviteEmailMock({ variant }: { variant: InviteEmailMockVariant }) {
  const hero = variant === "hero";

  const inner = (
    <>
      {/* Minimal invite: centred header — mark then company name line (matches live minimal invite HTML). */}
      <div className={cn("flex w-full flex-col items-center", hero ? "mb-4" : "mb-3")}>
        <div className="flex w-full justify-center">
          <UkAgentFlowLogo
            variant="lockup"
            className={cn("mx-auto justify-center", hero ? "scale-100 sm:scale-105" : "scale-[0.78]")}
          />
        </div>
        <p
          className={cn(
            "mt-2 max-w-[18rem] px-2 text-center font-medium leading-snug",
            hero ? "text-[9px] sm:text-[10px]" : "text-[8px]",
          )}
          style={{ color: MUTED }}
        >
          Your logo &amp; name · centred in live invites
        </p>
      </div>
      <p
        className={cn("mb-2 text-center leading-snug", hero ? "text-sm sm:text-[15px]" : "text-[13px]")}
        style={{ color: TEXT }}
      >
        Hi <span className="font-semibold">Jordan</span>,
      </p>
      <div
        className={cn(
          "mx-auto mb-2 w-full rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-zinc-600 dark:bg-zinc-800",
          hero ? "max-w-[280px]" : "max-w-[240px]",
        )}
        style={{ borderColor: "#e2e8f0" }}
      >
        <div className="flex gap-2">
          <Image
            src={LANDING_SAMPLE_PROPERTY_PHOTO}
            alt=""
            width={hero ? 80 : 72}
            height={hero ? 80 : 72}
            className={cn(
              "shrink-0 rounded-xl object-cover",
              hero ? "size-20 sm:size-[80px]" : "size-[72px]",
            )}
          />
          <div className="min-w-0 text-left">
            <p
              className={cn("font-bold leading-tight", hero ? "text-xs sm:text-[13px]" : "text-[11px]")}
              style={{ color: TEXT }}
            >
              12 High Street, Camden
            </p>
            <p
              className={cn("mt-0.5 font-medium", hero ? "text-[11px] sm:text-xs" : "text-[10px]")}
              style={{ color: MUTED }}
            >
              NW1 0AA
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <span
          className={cn(
            "inline-block rounded-lg px-4 py-2 text-center font-semibold text-white shadow-sm",
            hero ? "text-xs sm:text-[13px]" : "text-[11px]",
          )}
          style={{ backgroundColor: BTN }}
        >
          Leave feedback
        </span>
      </div>
      <div className={cn("mt-auto shrink-0 space-y-1 text-center", hero ? "pt-4" : "pt-3")}>
        <div className="flex justify-center">
          <Image
            src="/brand/sample-agent-uk-female.png"
            alt="Example agent profile photo (optional in invite footer)"
            width={hero ? 52 : 44}
            height={hero ? 52 : 44}
            className={cn(
              "rounded-full border-2 border-white object-cover shadow-sm dark:border-zinc-600",
              hero ? "size-[52px] sm:size-14" : "size-11",
            )}
          />
        </div>
        <p
          className={cn("leading-relaxed", hero ? "text-[10px] sm:text-[11px]" : "text-[9px]")}
          style={{ color: MUTED }}
        >
          Sarah Mitchell · Your estate agency
        </p>
        <p
          className={cn("leading-none opacity-80", hero ? "text-[8px] sm:text-[9px]" : "text-[7px]")}
          style={{ color: "#94a3b8" }}
        >
          Optional agent photo · as in live invites
        </p>
        <p
          className={cn("leading-snug opacity-90", hero ? "text-[9px] sm:text-[10px]" : "text-[8px]")}
          style={{ color: "#94a3b8" }}
        >
          Your data is processed under UK GDPR…
        </p>
      </div>
    </>
  );

  if (hero) {
    return (
      <div
        className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 shadow-xl dark:border-zinc-700"
        style={{ backgroundColor: EMAIL_BG }}
      >
        <div className="flex min-h-0 flex-col px-4 pb-4 pt-5 sm:px-5 sm:pb-5 sm:pt-6">{inner}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-square flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-700",
        LANDING_SAMPLE_TILE_SHADOW,
      )}
      style={{ backgroundColor: EMAIL_BG }}
    >
      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-4 sm:px-4">{inner}</div>
    </div>
  );
}

/** Hero visual: mirrors `feedback-form.tsx` step 1 (public page chrome from `feedback/[token]/page.tsx`). */
export function LandingHeroFeedbackMock() {
  return (
    <div
      className="pointer-events-none w-full max-w-md select-none rounded-2xl border border-zinc-200/90 bg-zinc-50 p-4 shadow-2xl ring-1 ring-black/5 dark:border-zinc-700 dark:bg-zinc-900/50 dark:ring-white/10 sm:p-5"
      aria-hidden
    >
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <h2 className="text-center text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {DEFAULT_PAGE_TITLE}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">{DEFAULT_PAGE_SUBTITLE}</p>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="text-zinc-700 dark:text-zinc-300">Step 1 of 2</span>
            <span>Quick questions</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full w-1/2 rounded-full bg-sky-600 transition-all duration-300" />
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="flex gap-4 p-4 sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={LANDING_SAMPLE_PROPERTY_PHOTO}
                alt=""
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                12 High Street, Camden
              </p>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">NW1 0AA</p>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">Hi Jordan</p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{L.ratingLegend}</legend>
            <div className="flex flex-wrap items-center gap-1" role="presentation">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <span
                  key={n}
                  className={cn(
                    "block p-0.5 text-[2.25rem] leading-none select-none sm:text-[2.5rem]",
                    n <= 4
                      ? "text-amber-400 drop-shadow-[0_1px_0_rgba(0,0,0,0.08)]"
                      : "text-zinc-200 dark:text-zinc-700",
                  )}
                  aria-hidden
                >
                  ★
                </span>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{L.interestLegend}</legend>
            <div className="flex flex-col gap-2">
              {(
                [
                  { active: true, label: L.interestHot },
                  { active: false, label: L.interestWarm },
                  { active: false, label: L.interestCold },
                ] as const
              ).map(({ active, label }) => (
                <div
                  key={label}
                  className={cn(
                    "flex justify-center rounded-full border px-4 py-2.5 text-center text-sm font-medium",
                    active
                      ? "border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-600"
                      : "border-zinc-300 bg-white text-zinc-800 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200",
                  )}
                >
                  {label}
                </div>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{L.priceLegend}</p>
            <div className="w-full rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100">
              {L.priceFair}
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
            <div className="w-full rounded-lg bg-sky-600 py-3 text-center text-[15px] font-semibold text-white dark:bg-sky-600">
              Continue
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Wider invite mock for grids / optional use (scheme A colours). */
export function LandingHeroEmailMock() {
  return <InviteEmailMock variant="hero" />;
}

function DashboardActivityMock() {
  return (
    <div
      className={cn(
        "flex aspect-square flex-col overflow-hidden rounded-2xl border-2 border-sky-200 bg-white dark:border-sky-900/50 dark:bg-zinc-900",
        LANDING_SAMPLE_TILE_SHADOW,
      )}
    >
      <div className="border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
        <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-50">Feedback after viewings</p>
        <p className="mt-0.5 text-[9px] text-zinc-600 dark:text-zinc-400">For sale — newest submissions first</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-0.5 rounded-md border border-zinc-900 bg-zinc-900 px-2 py-1 text-[9px] font-medium text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
            <ChevronLeft className="size-3 opacity-70" aria-hidden />
            Feedback
            <span className="rounded bg-emerald-600 px-1 py-px text-[8px] font-semibold uppercase text-white">
              New
            </span>
          </span>
          <span className="inline-flex items-center gap-0.5 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[9px] font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            Pre-qual checks
            <ChevronRight className="size-3 opacity-70" aria-hidden />
          </span>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden p-2">
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="grid grid-cols-[auto_1fr_auto] gap-1 border-b border-zinc-100 bg-zinc-50 px-2 py-1.5 text-[8px] font-bold uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400">
            <span className="w-7" />
            <span>Property</span>
            <span className="text-right">Interest</span>
          </div>
          <div className="flex items-center gap-2 border-b border-zinc-100 px-2 py-2 dark:border-zinc-800">
            <Image
              src={LANDING_SAMPLE_PROPERTY_PHOTO}
              alt=""
              width={28}
              height={28}
              className="size-7 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-medium text-zinc-900 dark:text-zinc-100">12 High Street</p>
              <p className="text-[9px] text-zinc-500 dark:text-zinc-400">NW1 0AA</p>
            </div>
            <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-semibold capitalize text-rose-800 dark:bg-rose-950 dark:text-rose-200">
              Hot
            </span>
          </div>
          <div className="flex items-center gap-2 px-2 py-2 opacity-[0.72]">
            <span className="size-7 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-medium text-zinc-700 dark:text-zinc-300">4 Example Road</p>
              <p className="text-[9px] text-zinc-500">SW1A 1AA</p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium capitalize text-amber-900 dark:bg-amber-950 dark:text-amber-100">
              Warm
            </span>
          </div>
        </div>
      </div>
      <p className="px-2 pb-2 text-center text-[9px] text-zinc-400 dark:text-zinc-500">
        Same panel as your signed-in dashboard — tabs, table, and follow-up tools.
      </p>
    </div>
  );
}

function PropertyShareCardMock() {
  return (
    <div
      className={cn(
        "flex aspect-square flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        LANDING_SAMPLE_TILE_SHADOW,
      )}
    >
      <div className="border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
        <h3 className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-50">Vendor portal &amp; buyer QR</h3>
        <p className="mt-1 text-[8px] leading-snug text-zinc-500 dark:text-zinc-400">
          Share the <strong className="font-medium text-zinc-700 dark:text-zinc-300">live link</strong> with your vendor;
          print the <strong className="font-medium text-zinc-700 dark:text-zinc-300">QR</strong> for buyers at the
          viewing.
        </p>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 p-2">
        <div className="flex flex-col rounded-lg border border-zinc-200 bg-zinc-50/80 p-2 dark:border-zinc-800 dark:bg-zinc-950/40">
          <p className="text-[8px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            Vendor live link
          </p>
          <p className="mt-1 line-clamp-2 text-[7px] leading-snug text-zinc-600 dark:text-zinc-400">
            12 High Street, NW1 — rolling snapshot.
          </p>
          <p className="mt-2 line-clamp-3 break-all font-mono text-[6.5px] text-zinc-800 dark:text-zinc-200">
            app.example/vendor/••••
          </p>
          <span className="mt-auto inline-block rounded-md border border-zinc-300 bg-white py-1 text-center text-[8px] font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100">
            Copy vendor link
          </span>
        </div>
        <div className="flex flex-col rounded-lg border border-zinc-200 bg-zinc-50/80 p-2 dark:border-zinc-800 dark:bg-zinc-950/40">
          <p className="text-[8px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            Buyer QR
          </p>
          <div className="mt-1 flex flex-1 items-center justify-center rounded-md border border-dashed border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800">
            <svg viewBox="0 0 24 24" className="size-12 text-zinc-800 dark:text-zinc-200" aria-hidden>
              <path
                fill="currentColor"
                d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 15h6v6H3v-6zm2 2v2h2v-2H5zm13-5h2v2h-2v-2zm-2-2h2v2h-2V9zm2 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 4h2v2h-2v-2zM15 3h2v2h-2V3zm0 14h2v2h-2v-2zM9 15h2v2H9v-2z"
              />
            </svg>
          </div>
          <span className="mt-1 text-center text-[7px] font-medium text-sky-700 dark:text-sky-300">Download PNG</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Marketing tiles aligned with live product: scheme A invite, dashboard panel, property share card.
 */
export function LandingProductSamples() {
  return (
    <section
      aria-labelledby="landing-samples-heading"
      className="mx-auto max-w-7xl px-6 py-16 md:py-20"
    >
      <div className="mb-10 text-center md:mb-12">
        <h2
          id="landing-samples-heading"
          className="mb-2 text-2xl font-bold text-slate-900 md:text-3xl dark:text-zinc-50"
        >
          Built from the same screens agents use
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-slate-600 dark:text-zinc-400">
          Invites, the public feedback form, dashboard tables, and property share tools — styled like the live app, not
          generic marketing mockups.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col">
          <p className="mb-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
            Automated invite email
          </p>
          <InviteEmailMock variant="square" />
        </div>

        <div className="flex flex-col">
          <p className="mb-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
            Dashboard — feedback tab
          </p>
          <DashboardActivityMock />
        </div>

        <div className="flex flex-col">
          <p className="mb-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
            Property — vendor &amp; QR
          </p>
          <PropertyShareCardMock />
        </div>
      </div>
    </section>
  );
}
