export type LettingsFeedbackFormLabels = {
  ratingLegend: string;
  ratingStarSingular: string;
  ratingStarsPlural: string;
  interestLegend: string;
  interestHot: string;
  interestWarm: string;
  interestCold: string;
  rentLegend: string;
  rentGreatValue: string;
  rentFair: string;
  rentSlightlyHigh: string;
  rentTooExpensive: string;
  moveInLegend: string;
  occupantsLegend: string;
  petsLegend: string;
  petsUnspecified: string;
  petsNo: string;
  petsYes: string;
  petsSpecifyHint: string;
  incomeLegend: string;
  income25k: string;
  income35k: string;
  income50k: string;
  incomeUnspecified: string;
  highlightsLegend: string;
  negativesLegend: string;
  landlordMessageLegend: string;
  applyLegend: string;
  applyYes: string;
  applyNo: string;
  submitLabel: string;
  submitPendingLabel: string;
};

export type LettingsFeedbackFormConfigStored = {
  intro?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  labels?: Partial<LettingsFeedbackFormLabels>;
};

export type LettingsFeedbackFormCopyResolved = {
  intro: string | null;
  pageTitle: string;
  pageSubtitle: string;
  labels: LettingsFeedbackFormLabels;
};

export const DEFAULT_LETTINGS_PAGE_TITLE = "Your rental viewing feedback";

export const DEFAULT_LETTINGS_PAGE_SUBTITLE =
  "About 30 seconds. This helps the landlord choose the right tenant.";

export const DEFAULT_LETTINGS_FEEDBACK_FORM_LABELS: LettingsFeedbackFormLabels = {
  ratingLegend: "How would you rate the property?",
  ratingStarSingular: "star",
  ratingStarsPlural: "stars",
  interestLegend: "How interested are you in renting?",
  interestHot: "Very interested (ready to apply now)",
  interestWarm: "Maybe (have some questions)",
  interestCold: "Not interested (doesn't suit my needs)",
  rentLegend: "What do you think about the monthly rent?",
  rentGreatValue: "Great value",
  rentFair: "Fair price",
  rentSlightlyHigh: "Slightly high",
  rentTooExpensive: "Too expensive",
  moveInLegend: "Target move-in date? (optional)",
  occupantsLegend: "How many occupants?",
  petsLegend: "Any pets?",
  petsUnspecified: "Prefer not to say",
  petsNo: "No",
  petsYes: "Yes (please specify)",
  petsSpecifyHint: "Breed / type (optional)",
  incomeLegend: "Annual household income? (optional)",
  income25k: "£25k+",
  income35k: "£35k+",
  income50k: "£50k+",
  incomeUnspecified: "Prefer not to say",
  highlightsLegend: "What stood out positively? (pick any)",
  negativesLegend: "What concerned you? (pick any)",
  landlordMessageLegend: "Any special requests or questions for the landlord? (optional)",
  applyLegend: "Would you like to start the application process?",
  applyYes: "Yes",
  applyNo: "No",
  submitLabel: "Submit feedback",
  submitPendingLabel: "Sending…",
};

const LABEL_KEYS = Object.keys(
  DEFAULT_LETTINGS_FEEDBACK_FORM_LABELS,
) as (keyof LettingsFeedbackFormLabels)[];

export const LETTINGS_FEEDBACK_FORM_LABEL_KEYS = LABEL_KEYS;

export function lettingsFormFieldName(key: keyof LettingsFeedbackFormLabels): string {
  const snake = String(key).replace(/([A-Z])/g, "_$1").toLowerCase();
  return `lfc_${snake}`;
}

function trimField(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, max);
}

export const LETTINGS_FEEDBACK_FORM_CONFIG_LIMITS = {
  intro: 4000,
  pageTitle: 160,
  pageSubtitle: 400,
  label: 280,
} as const;

export function resolvedLettingsFeedbackFormCopyFromFormData(
  formData: FormData,
): LettingsFeedbackFormCopyResolved {
  const introFull = String(formData.get("lfc_intro") ?? "").trim();
  const intro =
    introFull.length > 0
      ? introFull.slice(0, LETTINGS_FEEDBACK_FORM_CONFIG_LIMITS.intro)
      : null;

  const pageTitleRaw = trimField(formData, "lfc_page_title", LETTINGS_FEEDBACK_FORM_CONFIG_LIMITS.pageTitle);
  const pageTitleFinal =
    pageTitleRaw.length > 0 ? pageTitleRaw : DEFAULT_LETTINGS_PAGE_TITLE;

  const pageSubtitleRaw = trimField(
    formData,
    "lfc_page_subtitle",
    LETTINGS_FEEDBACK_FORM_CONFIG_LIMITS.pageSubtitle,
  );
  const pageSubtitleFinal =
    pageSubtitleRaw.length > 0 ? pageSubtitleRaw : DEFAULT_LETTINGS_PAGE_SUBTITLE;

  const labels = { ...DEFAULT_LETTINGS_FEEDBACK_FORM_LABELS };
  for (const key of LABEL_KEYS) {
    const name = lettingsFormFieldName(key);
    const v = trimField(formData, name, LETTINGS_FEEDBACK_FORM_CONFIG_LIMITS.label);
    if (v.length > 0) {
      labels[key] = v;
    }
  }

  return {
    intro,
    pageTitle: pageTitleFinal,
    pageSubtitle: pageSubtitleFinal,
    labels,
  };
}

export function mergeLettingsFeedbackFormCopy(
  stored: LettingsFeedbackFormConfigStored | null | undefined,
): LettingsFeedbackFormCopyResolved {
  const s =
    stored && typeof stored === "object" && !Array.isArray(stored)
      ? stored
      : ({} as LettingsFeedbackFormConfigStored);

  const rawLabels =
    s.labels && typeof s.labels === "object" && !Array.isArray(s.labels)
      ? (s.labels as Partial<LettingsFeedbackFormLabels>)
      : {};

  const labels = { ...DEFAULT_LETTINGS_FEEDBACK_FORM_LABELS };
  for (const key of LABEL_KEYS) {
    const v = rawLabels[key];
    if (typeof v === "string" && v.trim()) {
      labels[key] = v.trim();
    }
  }

  const pageTitle =
    typeof s.pageTitle === "string" && s.pageTitle.trim()
      ? s.pageTitle.trim()
      : DEFAULT_LETTINGS_PAGE_TITLE;
  const pageSubtitle =
    typeof s.pageSubtitle === "string" && s.pageSubtitle.trim()
      ? s.pageSubtitle.trim()
      : DEFAULT_LETTINGS_PAGE_SUBTITLE;

  const intro =
    typeof s.intro === "string" && s.intro.trim() ? s.intro.trim() : null;

  return { intro, pageTitle, pageSubtitle, labels };
}

export function parseLettingsFeedbackFormConfigFromDb(
  raw: unknown,
): LettingsFeedbackFormConfigStored | null {
  if (raw == null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as LettingsFeedbackFormConfigStored;
}

export function diffLettingsFeedbackFormConfigForStorage(
  resolved: LettingsFeedbackFormCopyResolved,
): LettingsFeedbackFormConfigStored | null {
  const out: LettingsFeedbackFormConfigStored = {};
  if (resolved.intro) {
    out.intro = resolved.intro;
  }
  if (resolved.pageTitle !== DEFAULT_LETTINGS_PAGE_TITLE) {
    out.pageTitle = resolved.pageTitle;
  }
  if (resolved.pageSubtitle !== DEFAULT_LETTINGS_PAGE_SUBTITLE) {
    out.pageSubtitle = resolved.pageSubtitle;
  }
  const labels: Partial<LettingsFeedbackFormLabels> = {};
  for (const key of LABEL_KEYS) {
    if (resolved.labels[key] !== DEFAULT_LETTINGS_FEEDBACK_FORM_LABELS[key]) {
      labels[key] = resolved.labels[key];
    }
  }
  if (Object.keys(labels).length > 0) {
    out.labels = labels;
  }
  if (!out.intro && !out.pageTitle && !out.pageSubtitle && !out.labels) {
    return null;
  }
  return out;
}

/** Short hints for Settings UI */
export const LETTINGS_FEEDBACK_FORM_LABEL_HINTS: Record<keyof LettingsFeedbackFormLabels, string> = {
  ratingLegend: "Star rating — title",
  ratingStarSingular: 'After "1"',
  ratingStarsPlural: 'After "2–5"',
  interestLegend: "Renting interest — title",
  interestHot: "Hot option",
  interestWarm: "Warm option",
  interestCold: "Cold option",
  rentLegend: "Monthly rent — title",
  rentGreatValue: "Great value option",
  rentFair: "Fair option",
  rentSlightlyHigh: "Slightly high option",
  rentTooExpensive: "Too expensive option",
  moveInLegend: "Move-in date field label",
  occupantsLegend: "Occupants field label",
  petsLegend: "Pets field label",
  petsUnspecified: "Prefer not to say (pets)",
  petsNo: "No pets",
  petsYes: "Has pets",
  petsSpecifyHint: "Pets detail placeholder",
  incomeLegend: "Income — title",
  income25k: "£25k+ option",
  income35k: "£35k+ option",
  income50k: "£50k+ option",
  incomeUnspecified: "Prefer not to say (income)",
  highlightsLegend: "Positive picks — title (pick any)",
  negativesLegend: "Concerns — title (pick any)",
  landlordMessageLegend: "Open question to landlord",
  applyLegend: "Start application — title",
  applyYes: "Yes",
  applyNo: "No",
  submitLabel: "Submit button",
  submitPendingLabel: "Sending state",
};
