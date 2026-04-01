import { auth } from "@/auth";
import { AppChrome } from "@/components/app-chrome";
import { countFeedbackSinceForCompany, countPrequalSinceForCompany } from "@/lib/dashboard/queries";
import { dashboardRollingRecentSince } from "@/lib/dashboard/recent-window";
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

  return (
    <AppChrome session={session} sidebarRecent24hCount={sidebarRecent24hCount}>
      {children}
    </AppChrome>
  );
}
