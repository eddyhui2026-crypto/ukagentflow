export type TourTrackId = "sale" | "letting" | "reports" | "settings";

export type TourStepCopy = {
  title: string;
  body: string;
  desktopSelector: string;
  mobileSelector: string;
};

function isPropertyDetailPath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 2 && parts[0] === "properties" && parts[1] !== "new";
}

function isViewingsNewPath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  return (
    parts.length === 4 &&
    parts[0] === "properties" &&
    parts[2] === "viewings" &&
    parts[3] === "new"
  );
}

function stepFromSaleOrLetting(
  pathname: string,
  sp: URLSearchParams,
  listingKey: "sale" | "letting",
): number {
  const match =
    listingKey === "letting"
      ? sp.get("listing") === "letting"
      : sp.get("listing") !== "letting";
  if (isViewingsNewPath(pathname)) return 5;
  if (isPropertyDetailPath(pathname)) return 4;
  if (pathname === "/properties/new") return 3;
  if (pathname === "/properties" && match) return 2;
  return 1;
}

function stepFromPathReports(pathname: string): number {
  if (pathname === "/reports" || pathname.startsWith("/reports/")) return 2;
  return 1;
}

function stepFromPathSettings(pathname: string): number {
  if (pathname === "/settings" || pathname.startsWith("/settings/")) return 2;
  return 1;
}

export type TourTrackDefinition = {
  id: TourTrackId;
  menuLabel: string;
  menuBlurb: string;
  /** Last spotlight step index (inclusive). */
  lastContentStep: number;
  /** Full-screen “Done” step = lastContentStep + 1 */
  doneStep: number;
  steps: Record<number, TourStepCopy>;
  stepFromPath: (pathname: string, sp: URLSearchParams) => number;
};

const pipelineSteps = (listingWord: "sale" | "letting"): Record<number, TourStepCopy> => {
  const isLet = listingWord === "letting";
  return {
    1: {
      title: isLet ? "Open your lettings list" : "Open your sales listings",
      desktopSelector: isLet
        ? '[data-tour="onboarding-nav-letting"]'
        : '[data-tour="onboarding-nav-for-sale"]',
      mobileSelector: '[data-tour="onboarding-mobile-menu"]',
      body: isLet
        ? "Under **Properties**, click **To let**. On your phone, open the menu (☰) first, then tap **To let**."
        : "Under **Properties**, click **For sale**. On your phone, open the menu (☰) first, then tap **For sale**.",
    },
    2: {
      title: "Add a property",
      desktopSelector: '[data-tour="onboarding-add-property"]',
      mobileSelector: '[data-tour="onboarding-add-property"]',
      body: "Click **+ Add property** to create an instruction. You’ll enter address, postcode, vendor, and whether it’s for sale or to let.",
    },
    3: {
      title: "Fill in the instruction",
      desktopSelector: '[data-tour="onboarding-property-form"]',
      mobileSelector: '[data-tour="onboarding-property-form"]',
      body: "Complete the form and save. You’ll land on the property page — that’s where viewings and feedback links live.",
    },
    4: {
      title: "Book a viewing",
      desktopSelector: '[data-tour="onboarding-schedule-viewing"]',
      mobileSelector: '[data-tour="onboarding-schedule-viewing"]',
      body: "Click **+ Schedule viewing** to add a date, buyers, and choose automatic invite emails or your own copy-paste drafts.",
    },
    5: {
      title: "Send feedback links",
      desktopSelector: '[data-tour="onboarding-viewing-form"]',
      mobileSelector: '[data-tour="onboarding-viewing-form"]',
      body: "Add buyer names and emails, pick how links are delivered, then save. Buyers get personal links to leave structured feedback after the viewing.",
    },
  };
};

export const GUIDED_TOUR_TRACKS: Record<TourTrackId, TourTrackDefinition> = {
  sale: {
    id: "sale",
    menuLabel: "Sales: property & viewings",
    menuBlurb: "List a sale instruction, book a viewing, send buyer feedback links.",
    lastContentStep: 5,
    doneStep: 6,
    steps: pipelineSteps("sale"),
    stepFromPath: (pathname, sp) => stepFromSaleOrLetting(pathname, sp, "sale"),
  },
  letting: {
    id: "letting",
    menuLabel: "Lettings: property & viewings",
    menuBlurb: "List a rental instruction, book a viewing, send applicant feedback links.",
    lastContentStep: 5,
    doneStep: 6,
    steps: pipelineSteps("letting"),
    stepFromPath: (pathname, sp) => stepFromSaleOrLetting(pathname, sp, "letting"),
  },
  reports: {
    id: "reports",
    menuLabel: "Reports: export feedback",
    menuBlurb: "Download CSV feedback for analysis or vendor packs.",
    lastContentStep: 2,
    doneStep: 3,
    steps: {
      1: {
        title: "Open Reports",
        desktopSelector: '[data-tour="onboarding-nav-reports"]',
        mobileSelector: '[data-tour="onboarding-mobile-menu"]',
        body: "Click **Reports** in the sidebar. On your phone, open the menu (☰), then tap **Reports**.",
      },
      2: {
        title: "Export CSV",
        desktopSelector: '[data-tour="onboarding-reports-form"]',
        mobileSelector: '[data-tour="onboarding-reports-form"]',
        body: "Choose optional filters, tick **Export for vendor (anonymised)** if you need a GDPR-friendlier pack, then **Download CSV**.",
      },
    },
    stepFromPath: stepFromPathReports,
  },
  settings: {
    id: "settings",
    menuLabel: "Settings: wording & invites",
    menuBlurb: "Customise automated emails, feedback forms, and pre-view pages.",
    lastContentStep: 2,
    doneStep: 3,
    steps: {
      1: {
        title: "Open Settings",
        desktopSelector: '[data-tour="onboarding-nav-settings"]',
        mobileSelector: '[data-tour="onboarding-mobile-menu"]',
        body: "Click **Settings** in the sidebar (menu on your phone). Company-wide templates live here.",
      },
      2: {
        title: "Tabs & templates",
        desktopSelector: '[data-tour="onboarding-settings-shell"]',
        mobileSelector: '[data-tour="onboarding-settings-shell"]',
        body: "Use the tabs: **Auto invite**, **Copy-paste** drafts, **Feedback forms**, **Pre-view** pages, **Pre-view share**, and **Account** branding.",
      },
    },
    stepFromPath: stepFromPathSettings,
  },
};

export const GUIDED_TOUR_TRACK_ORDER: TourTrackId[] = ["sale", "letting", "reports", "settings"];
