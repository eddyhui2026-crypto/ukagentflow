import { auth } from "@/auth";
import { AppChrome } from "@/components/app-chrome";
import { countFeedbackSinceForCompany, countPrequalSinceForCompany } from "@/lib/dashboard/queries";
import { dashboardRollingRecentSince } from "@/lib/dashboard/recent-window";
import { getUserOnboardingIntroDismissed } from "@/lib/users/onboarding";
import { getUserInteractiveOnboardingCompleted } from "@/lib/users/interactive-onboarding";
import { isInternalMarketingOutreachAllowed } from "@/lib/internal/marketing-outreach-allowlist";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.companyId) {
    redirect("/login");
  }

  const since24h = dashboardRollingRecentSince();
  const [fb, pq] = await Promise.all([
    countFeedbackSinceForCompany(session.user.companyId, since24h),
    countPrequalSinceForCompany(session.user.companyId, since24h),
  ]);
  const sidebarRecent24hCount = fb.sale + fb.letting + pq.sale + pq.letting;

  const introDismissed = await getUserOnboardingIntroDismissed(session.user.id);
  const isFirstAuthSession = session.user.previousLoginAt == null;
  const interactiveDone = await getUserInteractiveOnboardingCompleted(session.user.id);
  const showInteractiveOnboarding = !interactiveDone;
  const showIntroHint = interactiveDone && isFirstAuthSession && !introDismissed;
  const showInternalMarketingNav = isInternalMarketingOutreachAllowed(session.user.email);

  return (
    <AppChrome
      session={session}
      sidebarRecent24hCount={sidebarRecent24hCount}
      showIntroHint={showIntroHint}
      showInteractiveOnboarding={showInteractiveOnboarding}
      showInternalMarketingNav={showInternalMarketingNav}
    >
      {children}
    </AppChrome>
  );
}
