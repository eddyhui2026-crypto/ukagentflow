export type FeedbackFormLabels = {
  ratingLegend: string;
  ratingStarSingular: string;
  ratingStarsPlural: string;
  interestLegend: string;
  interestHot: string;
  interestWarm: string;
  interestCold: string;
  priceLegend: string;
  priceTooHigh: string;
  priceFair: string;
  priceGoodValue: string;
  likedLabel: string;
  dislikedLabel: string;
  secondViewingLegend: string;
  secondViewingYes: string;
  secondViewingNo: string;
  submitLabel: string;
  submitPendingLabel: string;
};

export type FeedbackFormConfigStored = {
  intro?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  labels?: Partial<FeedbackFormLabels>;
};

export type FeedbackFormCopyResolved = {
  intro: string | null;
  pageTitle: string;
  pageSubtitle: string;
  labels: FeedbackFormLabels;
};

export const DEFAULT_PAGE_TITLE = "Your viewing feedback";
export const DEFAULT_PAGE_SUBTITLE =
  "About 30 seconds. Your agent uses this to help the seller.";

export const DEFAULT_FEEDBACK_FORM_LABELS: FeedbackFormLabels = {
  ratingLegend: "How would you rate the property?",
  ratingStarSingular: "star",
  ratingStarsPlural: "stars",
  interestLegend: "How interested are you?",
  interestHot: "Very interested",
  interestWarm: "Maybe",
  interestCold: "Not interested",
  priceLegend: "What do you think about the price?",
  priceTooHigh: "Too expensive",
  priceFair: "Fair price",
  priceGoodValue: "Good value",
  likedLabel: "What did you like?",
  dislikedLabel: "What did you not like? (optional)",
  secondViewingLegend: "Would you like a second viewing?",
  secondViewingYes: "Yes",
  secondViewingNo: "No",
  submitLabel: "Submit feedback",
  submitPendingLabel: "Sending…",
};

const LABEL_KEYS = Object.keys(DEFAULT_FEEDBACK_FORM_LABELS) as (keyof FeedbackFormLabels)[];

export const FEEDBACK_FORM_LABEL_KEYS = LABEL_KEYS;

export function feedbackFormFieldName(key: keyof FeedbackFormLabels): string {
  const snake = String(key).replace(/([A-Z])/g, "_$1").toLowerCase();
  return `ffc_${snake}`;
}

function trimField(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, max);
}

/** Read posted settings form (names from `feedbackFormFieldName` + ffc_intro / page fields). */
export function resolvedFeedbackFormCopyFromFormData(
  formData: FormData,
): FeedbackFormCopyResolved {
  const introFull = String(formData.get("ffc_intro") ?? "").trim();
  const intro =
    introFull.length > 0
      ? introFull.slice(0, FEEDBACK_FORM_CONFIG_LIMITS.intro)
      : null;

  const pageTitleRaw = trimField(
    formData,
    "ffc_page_title",
    FEEDBACK_FORM_CONFIG_LIMITS.pageTitle,
  );
  const pageTitleFinal = pageTitleRaw.length > 0 ? pageTitleRaw : DEFAULT_PAGE_TITLE;

  const pageSubtitleRaw = trimField(
    formData,
    "ffc_page_subtitle",
    FEEDBACK_FORM_CONFIG_LIMITS.pageSubtitle,
  );
  const pageSubtitleFinal =
    pageSubtitleRaw.length > 0 ? pageSubtitleRaw : DEFAULT_PAGE_SUBTITLE;

  const labels = { ...DEFAULT_FEEDBACK_FORM_LABELS };
  for (const key of LABEL_KEYS) {
    const name = feedbackFormFieldName(key);
    const v = trimField(formData, name, FEEDBACK_FORM_CONFIG_LIMITS.label);
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

export function mergeFeedbackFormCopy(
  stored: FeedbackFormConfigStored | null | undefined,
): FeedbackFormCopyResolved {
  const s =
    stored && typeof stored === "object" && !Array.isArray(stored)
      ? stored
      : ({} as FeedbackFormConfigStored);

  const rawLabels =
    s.labels && typeof s.labels === "object" && !Array.isArray(s.labels)
      ? (s.labels as Partial<FeedbackFormLabels>)
      : {};

  const labels = { ...DEFAULT_FEEDBACK_FORM_LABELS };
  for (const key of LABEL_KEYS) {
    const v = rawLabels[key];
    if (typeof v === "string" && v.trim()) {
      labels[key] = v.trim();
    }
  }

  const pageTitle =
    typeof s.pageTitle === "string" && s.pageTitle.trim()
      ? s.pageTitle.trim()
      : DEFAULT_PAGE_TITLE;
  const pageSubtitle =
    typeof s.pageSubtitle === "string" && s.pageSubtitle.trim()
      ? s.pageSubtitle.trim()
      : DEFAULT_PAGE_SUBTITLE;

  const intro =
    typeof s.intro === "string" && s.intro.trim() ? s.intro.trim() : null;

  return { intro, pageTitle, pageSubtitle, labels };
}

export function parseFeedbackFormConfigFromDb(raw: unknown): FeedbackFormConfigStored | null {
  if (raw == null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as FeedbackFormConfigStored;
}

/** Persist only fields that differ from built-in defaults (keeps JSON small). */
export function diffFeedbackFormConfigForStorage(
  resolved: FeedbackFormCopyResolved,
): FeedbackFormConfigStored | null {
  const out: FeedbackFormConfigStored = {};
  if (resolved.intro) {
    out.intro = resolved.intro;
  }
  if (resolved.pageTitle !== DEFAULT_PAGE_TITLE) {
    out.pageTitle = resolved.pageTitle;
  }
  if (resolved.pageSubtitle !== DEFAULT_PAGE_SUBTITLE) {
    out.pageSubtitle = resolved.pageSubtitle;
  }
  const labels: Partial<FeedbackFormLabels> = {};
  for (const key of LABEL_KEYS) {
    if (resolved.labels[key] !== DEFAULT_FEEDBACK_FORM_LABELS[key]) {
      labels[key] = resolved.labels[key];
    }
  }
  if (Object.keys(labels).length > 0) {
    out.labels = labels;
  }
  if (
    !out.intro &&
    !out.pageTitle &&
    !out.pageSubtitle &&
    !out.labels
  ) {
    return null;
  }
  return out;
}

export const FEEDBACK_FORM_CONFIG_LIMITS = {
  intro: 4000,
  pageTitle: 160,
  pageSubtitle: 400,
  label: 240,
} as const;

/** Short hints for the Settings UI. */
export const FEEDBACK_FORM_LABEL_HINTS: Record<keyof FeedbackFormLabels, string> = {
  ratingLegend: "Star rating — section title",
  ratingStarSingular: 'After "1" (e.g. star)',
  ratingStarsPlural: 'After "2–5" (e.g. stars)',
  interestLegend: "Interest level — section title",
  interestHot: "Hot option label",
  interestWarm: "Warm option label",
  interestCold: "Cold option label",
  priceLegend: "Price opinion — section title",
  priceTooHigh: "Too expensive option",
  priceFair: "Fair price option",
  priceGoodValue: "Good value option",
  likedLabel: "“What you liked” label",
  dislikedLabel: "“What you disliked” label",
  secondViewingLegend: "Second viewing — section title",
  secondViewingYes: "Yes",
  secondViewingNo: "No",
  submitLabel: "Submit button",
  submitPendingLabel: "Submit button while sending",
};
