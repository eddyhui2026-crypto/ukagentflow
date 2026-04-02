/** Tips shown in the signed-in header ticker (UK English; agent-facing). Order is shuffled per London calendar day. */
export const APP_HEADER_TICKER_TIPS: string[] = [
  "Something wrong or unclear? Use Report issue (amber button, top right) — we read every message.",
  "After a viewing, automatic buyer emails go out the next morning (~9:00 UK) if you chose Email buyers automatically.",
  "Need a link sooner? Use Copy email draft on the property page.",
  "Tune invite wording, logos and pre-view pages under Settings.",
  "Export viewing feedback from Reports — handy for vendor updates or your CRM.",
  "Each listing can share a read-only vendor link from the property page.",
  "Pre-view questionnaires and post-viewing feedback use different links — both live under Settings.",
  "Check the Dashboard for new feedback and pre-view submissions from the last day or so.",
];

/** YYYY-MM-DD in Europe/London (stable “day” for tip ordering). */
export function appHeaderTipsDayKeyLondon(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

/** Deterministic shuffle so tips feel fresh daily without random hydration issues. */
export function orderTipsForDay<T>(items: readonly T[], dayKey: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < dayKey.length; i++) {
    h ^= dayKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822519);
    const j = Math.abs(h + i * 17) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
