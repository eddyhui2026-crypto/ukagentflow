/** Company-level copy for pre-viewing pages + questionnaire labels (sale & to let). */

export const PREQUAL_PAGE_COPY_LIMITS = {
  pageTitle: 160,
  pageSubtitle: 400,
  intro: 4000,
} as const;

export const PREQUAL_LABEL_MAX = 280;

export const DEFAULT_SALE_PREQUAL_PAGE_TITLE = "Pre-viewing checks";

export const DEFAULT_SALE_PREQUAL_PAGE_SUBTITLE =
  "About a minute. This helps the agent prioritise serious buyers and brief the vendor.";

export const DEFAULT_LETTING_PREQUAL_PAGE_TITLE = "Pre-viewing qualification";

export const DEFAULT_LETTING_PREQUAL_PAGE_SUBTITLE =
  "Tell the agent a bit about your situation before a viewing. Your agent will use this to assess suitability for this rental.";

/* ─── Sale form labels (Pre-viewing checks) ─── */

export type SalePrequalFormLabels = {
  nameLabel: string;
  emailLabel: string;
  emailHint: string;
  phoneLabel: string;
  buyingPositionLabel: string;
  choosePlaceholder: string;
  buyingPositionFtb: string;
  buyingPositionNoDependentSale: string;
  buyingPositionSaleOnMarket: string;
  buyingPositionSaleNotOnMarket: string;
  buyingPositionSaleSoldStc: string;
  buyingPositionUnspecified: string;
  fundingLegend: string;
  fundingMortgage: string;
  fundingCash: string;
  dipLabel: string;
  dipHaveDip: string;
  dipPending: string;
  dipNotYet: string;
  dipHint: string;
  solicitorLabel: string;
  solicitorInstructed: string;
  solicitorArranging: string;
  solicitorNotYet: string;
  solicitorUnspecified: string;
  targetPurchaseLabel: string;
  targetAsap: string;
  target1_3Months: string;
  target3_6Months: string;
  target6PlusMonths: string;
  targetResearching: string;
  targetUnspecified: string;
  additionalNotesLabel: string;
  additionalNotesPlaceholder: string;
  propertyPrefix: string;
  submitLabel: string;
  submitPendingLabel: string;
};

export const DEFAULT_SALE_PREQUAL_FORM_LABELS: SalePrequalFormLabels = {
  nameLabel: "Full name",
  emailLabel: "Email",
  emailHint:
    "We use this to match your enquiry. If you submit again, we update your latest answers.",
  phoneLabel: "Phone",
  buyingPositionLabel: "Your buying position",
  choosePlaceholder: "Choose…",
  buyingPositionFtb: "First-time buyer",
  buyingPositionNoDependentSale:
    "No related sale (e.g. no chain, already completed elsewhere)",
  buyingPositionSaleOnMarket: "Selling — my property is on the market",
  buyingPositionSaleNotOnMarket: "Selling — not on the market yet",
  buyingPositionSaleSoldStc: "Sold subject to contract / under offer",
  buyingPositionUnspecified: "Prefer not to say",
  fundingLegend: "How will you fund the purchase?",
  fundingMortgage: "Mortgage (likely needs a loan)",
  fundingCash: "Cash buyer (no mortgage)",
  dipLabel: "Mortgage Decision in Principle (DIP / AIP)",
  dipHaveDip: "Yes — I have a DIP / AIP in place",
  dipPending: "Applied — waiting for a decision",
  dipNotYet: "Not yet",
  dipHint:
    "Agents often need evidence you can proceed before prioritising viewings on competitive listings.",
  solicitorLabel: "Solicitor / conveyancer",
  solicitorInstructed: "Yes — I have instructed a firm",
  solicitorArranging: "Arranging / shortlisting",
  solicitorNotYet: "Not yet",
  solicitorUnspecified: "Prefer not to say",
  targetPurchaseLabel: "When are you hoping to complete your purchase?",
  targetAsap: "As soon as possible",
  target1_3Months: "Within 1–3 months",
  target3_6Months: "Within 3–6 months",
  target6PlusMonths: "6 months or longer",
  targetResearching: "Just researching / no fixed date",
  targetUnspecified: "Prefer not to say",
  additionalNotesLabel: "Anything else the agent should know?",
  additionalNotesPlaceholder:
    "e.g. dependant sale milestones, preferred contact times, budget comfort vs asking price",
  propertyPrefix: "Property:",
  submitLabel: "Submit",
  submitPendingLabel: "Sending…",
};

const SALE_KEYS = Object.keys(DEFAULT_SALE_PREQUAL_FORM_LABELS) as (keyof SalePrequalFormLabels)[];

export const SALE_PREQUAL_LABEL_KEYS = SALE_KEYS;

export const SALE_PREQUAL_LABEL_HINTS: Record<keyof SalePrequalFormLabels, string> = {
  nameLabel: "Name field label (asterisk is added in the app)",
  emailLabel: "Email field label",
  emailHint: "Help text under email",
  phoneLabel: "Phone field label",
  buyingPositionLabel: "Buying position dropdown label",
  choosePlaceholder: 'Disabled first option in dropdowns (e.g. "Choose…")',
  buyingPositionFtb: "Option: FTB",
  buyingPositionNoDependentSale: "Option: no related sale",
  buyingPositionSaleOnMarket: "Option: sale on market",
  buyingPositionSaleNotOnMarket: "Option: sale not on market",
  buyingPositionSaleSoldStc: "Option: sold STC / under offer",
  buyingPositionUnspecified: "Option: prefer not to say (buying position)",
  fundingLegend: "Mortgage vs cash fieldset title",
  fundingMortgage: "Mortgage radio label",
  fundingCash: "Cash buyer radio label",
  dipLabel: "DIP / AIP dropdown label",
  dipHaveDip: "DIP option: have DIP",
  dipPending: "DIP option: pending",
  dipNotYet: "DIP option: not yet",
  dipHint: "Help text under DIP when funding is mortgage",
  solicitorLabel: "Solicitor dropdown label",
  solicitorInstructed: "Solicitor option: instructed",
  solicitorArranging: "Solicitor option: arranging",
  solicitorNotYet: "Solicitor option: not yet",
  solicitorUnspecified: "Solicitor option: prefer not to say",
  targetPurchaseLabel: "Purchase timescale dropdown label",
  targetAsap: "Timescale: ASAP",
  target1_3Months: "Timescale: 1–3 months",
  target3_6Months: "Timescale: 3–6 months",
  target6PlusMonths: "Timescale: 6+ months",
  targetResearching: "Timescale: just researching",
  targetUnspecified: "Timescale: prefer not to say",
  additionalNotesLabel: "Free-text notes label",
  additionalNotesPlaceholder: "Notes textarea placeholder",
  propertyPrefix: 'Line before address (e.g. "Property:")',
  submitLabel: "Submit button",
  submitPendingLabel: "Submit button while sending",
};

export function salePrequalLabelFieldName(key: keyof SalePrequalFormLabels): string {
  return (
    "spq_" +
    String(key)
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
  );
}

/* ─── Letting form labels (Pre-viewing qualification) ─── */

export type LettingPrequalFormLabels = {
  nameLabel: string;
  emailLabel: string;
  emailHint: string;
  phoneLabel: string;
  occupationLabel: string;
  occupationPlaceholder: string;
  incomeLabel: string;
  choosePlaceholder: string;
  income25k: string;
  income35k: string;
  income50k: string;
  incomeUnspecified: string;
  petsLegend: string;
  petsYes: string;
  petsNo: string;
  petsUnspecified: string;
  petsDetailPlaceholder: string;
  moveInLabel: string;
  visaLabel: string;
  visaPlaceholder: string;
  propertyPrefix: string;
  submitLabel: string;
  submitPendingLabel: string;
};

export const DEFAULT_LETTING_PREQUAL_FORM_LABELS: LettingPrequalFormLabels = {
  nameLabel: "Full name",
  emailLabel: "Email",
  emailHint:
    "We use this to match your enquiry. If you submit again, we update your latest answers.",
  phoneLabel: "Phone",
  occupationLabel: "Occupation / employment",
  occupationPlaceholder: "e.g. Teacher, self-employed",
  incomeLabel: "Household gross income (annual)",
  choosePlaceholder: "Choose…",
  income25k: "£25,000 or more",
  income35k: "£35,000 or more",
  income50k: "£50,000 or more",
  incomeUnspecified: "Prefer not to say",
  petsLegend: "Pets",
  petsYes: "Yes",
  petsNo: "No",
  petsUnspecified: "Prefer not to say",
  petsDetailPlaceholder: "If yes: type and number of pets",
  moveInLabel: "Target move-in date",
  visaLabel: "Visa / right to rent (free text)",
  visaPlaceholder: "e.g. British citizen, settled status, skilled worker visa",
  propertyPrefix: "Property:",
  submitLabel: "Submit",
  submitPendingLabel: "Sending…",
};

const LETTING_KEYS = Object.keys(
  DEFAULT_LETTING_PREQUAL_FORM_LABELS,
) as (keyof LettingPrequalFormLabels)[];

export const LETTING_PREQUAL_LABEL_KEYS = LETTING_KEYS;

export const LETTING_PREQUAL_LABEL_HINTS: Record<keyof LettingPrequalFormLabels, string> = {
  nameLabel: "Name field label",
  emailLabel: "Email field label",
  emailHint: "Help text under email",
  phoneLabel: "Phone field label",
  occupationLabel: "Occupation label",
  occupationPlaceholder: "Occupation input placeholder",
  incomeLabel: "Annual income dropdown label",
  choosePlaceholder: "First disabled dropdown option",
  income25k: "Income band £25k+",
  income35k: "Income band £35k+",
  income50k: "Income band £50k+",
  incomeUnspecified: "Income: prefer not to say",
  petsLegend: "Pets fieldset title",
  petsYes: "Pets: Yes",
  petsNo: "Pets: No",
  petsUnspecified: "Pets: prefer not to say",
  petsDetailPlaceholder: "Pets detail placeholder",
  moveInLabel: "Move-in date label",
  visaLabel: "Visa / right to rent label",
  visaPlaceholder: "Visa textarea placeholder",
  propertyPrefix: 'Line before address (e.g. "Property:")',
  submitLabel: "Submit button",
  submitPendingLabel: "Submit button while sending",
};

export function lettingPrequalLabelFieldName(key: keyof LettingPrequalFormLabels): string {
  return (
    "lpq_" +
    String(key)
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
  );
}

/* ─── Stored / merged shapes ─── */

export type SalePrequalFormConfigStored = {
  pageTitle?: string;
  pageSubtitle?: string;
  intro?: string;
  labels?: Partial<SalePrequalFormLabels>;
};

export type LettingPrequalFormConfigStored = {
  pageTitle?: string;
  pageSubtitle?: string;
  intro?: string;
  labels?: Partial<LettingPrequalFormLabels>;
};

export type SalePrequalPageCopyResolved = {
  pageTitle: string;
  pageSubtitle: string;
  intro: string | null;
};

export type LettingPrequalPageCopyResolved = {
  pageTitle: string;
  pageSubtitle: string;
  intro: string | null;
};

export type SalePrequalSettingsResolved = {
  page: SalePrequalPageCopyResolved;
  labels: SalePrequalFormLabels;
};

export type LettingPrequalSettingsResolved = {
  page: LettingPrequalPageCopyResolved;
  labels: LettingPrequalFormLabels;
};

function parseLabelsPartialSale(raw: unknown): Partial<SalePrequalFormLabels> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const labels = o.labels;
  if (!labels || typeof labels !== "object" || Array.isArray(labels)) return {};
  const lg = labels as Record<string, unknown>;
  const out: Partial<SalePrequalFormLabels> = {};
  for (const key of SALE_KEYS) {
    const v = lg[key as string];
    if (typeof v === "string") out[key] = v;
  }
  return out;
}

function parseLabelsPartialLetting(raw: unknown): Partial<LettingPrequalFormLabels> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const labels = o.labels;
  if (!labels || typeof labels !== "object" || Array.isArray(labels)) return {};
  const lg = labels as Record<string, unknown>;
  const out: Partial<LettingPrequalFormLabels> = {};
  for (const key of LETTING_KEYS) {
    const v = lg[key as string];
    if (typeof v === "string") out[key] = v;
  }
  return out;
}

export function parseSalePrequalFormConfigFromDb(raw: unknown): SalePrequalFormConfigStored {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const labels = parseLabelsPartialSale(raw);
  return {
    pageTitle: typeof o.pageTitle === "string" ? o.pageTitle : undefined,
    pageSubtitle: typeof o.pageSubtitle === "string" ? o.pageSubtitle : undefined,
    intro: typeof o.intro === "string" ? o.intro : undefined,
    labels: Object.keys(labels).length > 0 ? labels : undefined,
  };
}

export function parseLettingPrequalFormConfigFromDb(raw: unknown): LettingPrequalFormConfigStored {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const labels = parseLabelsPartialLetting(raw);
  return {
    pageTitle: typeof o.pageTitle === "string" ? o.pageTitle : undefined,
    pageSubtitle: typeof o.pageSubtitle === "string" ? o.pageSubtitle : undefined,
    intro: typeof o.intro === "string" ? o.intro : undefined,
    labels: Object.keys(labels).length > 0 ? labels : undefined,
  };
}

function mergePageSale(stored: SalePrequalFormConfigStored): SalePrequalPageCopyResolved {
  const title =
    stored.pageTitle?.trim().slice(0, PREQUAL_PAGE_COPY_LIMITS.pageTitle) ?? "";
  const sub =
    stored.pageSubtitle?.trim().slice(0, PREQUAL_PAGE_COPY_LIMITS.pageSubtitle) ?? "";
  const introFull = stored.intro?.trim() ?? "";
  const intro =
    introFull.length > 0
      ? introFull.slice(0, PREQUAL_PAGE_COPY_LIMITS.intro)
      : null;
  return {
    pageTitle: title.length > 0 ? title : DEFAULT_SALE_PREQUAL_PAGE_TITLE,
    pageSubtitle: sub.length > 0 ? sub : DEFAULT_SALE_PREQUAL_PAGE_SUBTITLE,
    intro,
  };
}

function mergePageLetting(stored: LettingPrequalFormConfigStored): LettingPrequalPageCopyResolved {
  const title =
    stored.pageTitle?.trim().slice(0, PREQUAL_PAGE_COPY_LIMITS.pageTitle) ?? "";
  const sub =
    stored.pageSubtitle?.trim().slice(0, PREQUAL_PAGE_COPY_LIMITS.pageSubtitle) ?? "";
  const introFull = stored.intro?.trim() ?? "";
  const intro =
    introFull.length > 0
      ? introFull.slice(0, PREQUAL_PAGE_COPY_LIMITS.intro)
      : null;
  return {
    pageTitle: title.length > 0 ? title : DEFAULT_LETTING_PREQUAL_PAGE_TITLE,
    pageSubtitle: sub.length > 0 ? sub : DEFAULT_LETTING_PREQUAL_PAGE_SUBTITLE,
    intro,
  };
}

function mergeSaleLabels(stored: Partial<SalePrequalFormLabels>): SalePrequalFormLabels {
  const labels = { ...DEFAULT_SALE_PREQUAL_FORM_LABELS };
  for (const key of SALE_KEYS) {
    const s = stored[key]?.trim();
    if (s && s.length > 0) {
      labels[key] = s.slice(0, PREQUAL_LABEL_MAX);
    }
  }
  return labels;
}

function mergeLettingLabels(stored: Partial<LettingPrequalFormLabels>): LettingPrequalFormLabels {
  const labels = { ...DEFAULT_LETTING_PREQUAL_FORM_LABELS };
  for (const key of LETTING_KEYS) {
    const s = stored[key]?.trim();
    if (s && s.length > 0) {
      labels[key] = s.slice(0, PREQUAL_LABEL_MAX);
    }
  }
  return labels;
}

export function mergeSalePrequalSettings(stored: SalePrequalFormConfigStored): SalePrequalSettingsResolved {
  return {
    page: mergePageSale(stored),
    labels: mergeSaleLabels(stored.labels ?? {}),
  };
}

export function mergeLettingPrequalSettings(
  stored: LettingPrequalFormConfigStored,
): LettingPrequalSettingsResolved {
  return {
    page: mergePageLetting(stored),
    labels: mergeLettingLabels(stored.labels ?? {}),
  };
}

/** @deprecated Use mergeSalePrequalSettings().page */
export function mergeSalePrequalPageCopy(stored: SalePrequalFormConfigStored): SalePrequalPageCopyResolved {
  return mergePageSale(stored);
}

/** @deprecated Use mergeLettingPrequalSettings().page */
export function mergeLettingPrequalPageCopy(
  stored: LettingPrequalFormConfigStored,
): LettingPrequalPageCopyResolved {
  return mergePageLetting(stored);
}

function diffPageSale(page: SalePrequalPageCopyResolved): Pick<
  SalePrequalFormConfigStored,
  "pageTitle" | "pageSubtitle" | "intro"
> {
  const out: SalePrequalFormConfigStored = {};
  if (page.pageTitle !== DEFAULT_SALE_PREQUAL_PAGE_TITLE) out.pageTitle = page.pageTitle;
  if (page.pageSubtitle !== DEFAULT_SALE_PREQUAL_PAGE_SUBTITLE) {
    out.pageSubtitle = page.pageSubtitle;
  }
  if (page.intro) out.intro = page.intro;
  return out;
}

function diffPageLetting(page: LettingPrequalPageCopyResolved): Pick<
  LettingPrequalFormConfigStored,
  "pageTitle" | "pageSubtitle" | "intro"
> {
  const out: LettingPrequalFormConfigStored = {};
  if (page.pageTitle !== DEFAULT_LETTING_PREQUAL_PAGE_TITLE) out.pageTitle = page.pageTitle;
  if (page.pageSubtitle !== DEFAULT_LETTING_PREQUAL_PAGE_SUBTITLE) {
    out.pageSubtitle = page.pageSubtitle;
  }
  if (page.intro) out.intro = page.intro;
  return out;
}

export function diffSalePrequalSettingsForStorage(
  resolved: SalePrequalSettingsResolved,
): SalePrequalFormConfigStored | null {
  const out: SalePrequalFormConfigStored = { ...diffPageSale(resolved.page) };
  const labelDiff: Partial<SalePrequalFormLabels> = {};
  for (const key of SALE_KEYS) {
    if (resolved.labels[key] !== DEFAULT_SALE_PREQUAL_FORM_LABELS[key]) {
      labelDiff[key] = resolved.labels[key];
    }
  }
  if (Object.keys(labelDiff).length > 0) {
    out.labels = labelDiff;
  }
  if (!out.pageTitle && !out.pageSubtitle && !out.intro && !out.labels) {
    return null;
  }
  return out;
}

export function diffLettingPrequalSettingsForStorage(
  resolved: LettingPrequalSettingsResolved,
): LettingPrequalFormConfigStored | null {
  const out: LettingPrequalFormConfigStored = { ...diffPageLetting(resolved.page) };
  const labelDiff: Partial<LettingPrequalFormLabels> = {};
  for (const key of LETTING_KEYS) {
    if (resolved.labels[key] !== DEFAULT_LETTING_PREQUAL_FORM_LABELS[key]) {
      labelDiff[key] = resolved.labels[key];
    }
  }
  if (Object.keys(labelDiff).length > 0) {
    out.labels = labelDiff;
  }
  if (!out.pageTitle && !out.pageSubtitle && !out.intro && !out.labels) {
    return null;
  }
  return out;
}

/** @deprecated Use diffSalePrequalSettingsForStorage */
export function diffSalePrequalFormConfigForStorage(
  page: SalePrequalPageCopyResolved,
): SalePrequalFormConfigStored | null {
  const onlyPage: SalePrequalSettingsResolved = {
    page,
    labels: { ...DEFAULT_SALE_PREQUAL_FORM_LABELS },
  };
  return diffSalePrequalSettingsForStorage(onlyPage);
}

/** @deprecated Use diffLettingPrequalSettingsForStorage */
export function diffLettingPrequalFormConfigForStorage(
  page: LettingPrequalPageCopyResolved,
): LettingPrequalFormConfigStored | null {
  const onlyPage: LettingPrequalSettingsResolved = {
    page,
    labels: { ...DEFAULT_LETTING_PREQUAL_FORM_LABELS },
  };
  return diffLettingPrequalSettingsForStorage(onlyPage);
}

function trimField(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, max);
}

function saleLabelsFromFormData(formData: FormData): Partial<SalePrequalFormLabels> {
  const partial: Partial<SalePrequalFormLabels> = {};
  for (const key of SALE_KEYS) {
    const raw = trimField(formData, salePrequalLabelFieldName(key), PREQUAL_LABEL_MAX);
    if (raw.length > 0) partial[key] = raw;
  }
  return partial;
}

function lettingLabelsFromFormData(formData: FormData): Partial<LettingPrequalFormLabels> {
  const partial: Partial<LettingPrequalFormLabels> = {};
  for (const key of LETTING_KEYS) {
    const raw = trimField(formData, lettingPrequalLabelFieldName(key), PREQUAL_LABEL_MAX);
    if (raw.length > 0) partial[key] = raw;
  }
  return partial;
}

export function resolvedSalePrequalSettingsFromFormData(formData: FormData): SalePrequalSettingsResolved {
  const titleRaw = trimField(formData, "spq_page_title", PREQUAL_PAGE_COPY_LIMITS.pageTitle);
  const subRaw = trimField(formData, "spq_page_subtitle", PREQUAL_PAGE_COPY_LIMITS.pageSubtitle);
  const introFull = String(formData.get("spq_intro") ?? "").trim();
  const labels = saleLabelsFromFormData(formData);
  return mergeSalePrequalSettings({
    pageTitle: titleRaw.length > 0 ? titleRaw : undefined,
    pageSubtitle: subRaw.length > 0 ? subRaw : undefined,
    intro: introFull.length > 0 ? introFull : undefined,
    labels: Object.keys(labels).length > 0 ? labels : undefined,
  });
}

export function resolvedLettingPrequalSettingsFromFormData(
  formData: FormData,
): LettingPrequalSettingsResolved {
  const titleRaw = trimField(formData, "lpq_page_title", PREQUAL_PAGE_COPY_LIMITS.pageTitle);
  const subRaw = trimField(formData, "lpq_page_subtitle", PREQUAL_PAGE_COPY_LIMITS.pageSubtitle);
  const introFull = String(formData.get("lpq_intro") ?? "").trim();
  const labels = lettingLabelsFromFormData(formData);
  return mergeLettingPrequalSettings({
    pageTitle: titleRaw.length > 0 ? titleRaw : undefined,
    pageSubtitle: subRaw.length > 0 ? subRaw : undefined,
    intro: introFull.length > 0 ? introFull : undefined,
    labels: Object.keys(labels).length > 0 ? labels : undefined,
  });
}

/** For preview: page-only from current form (legacy helper name kept for imports if any) */
export function resolvedSalePrequalPageCopyFromFormData(formData: FormData): SalePrequalPageCopyResolved {
  return resolvedSalePrequalSettingsFromFormData(formData).page;
}

export function resolvedLettingPrequalPageCopyFromFormData(
  formData: FormData,
): LettingPrequalPageCopyResolved {
  return resolvedLettingPrequalSettingsFromFormData(formData).page;
}
