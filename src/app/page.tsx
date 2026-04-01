import type { Metadata } from "next";
import { auth } from "@/auth";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "UKAgentFlow — Viewing feedback for UK estate agents",
  description:
    "Collect buyer viewing feedback by email, WhatsApp, and QR codes. Dashboard for agents, vendor live link, CSV reports — built for the UK property market.",
  openGraph: {
    title: "UKAgentFlow — Viewing feedback for UK estate agents",
    description:
      "Structured feedback, vendor portal, and exports — without chasing buyers all day.",
  },
};

export default async function Home() {
  const session = await auth();
  return <LandingPage isAuthenticated={!!session?.user} />;
}
