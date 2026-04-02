import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getMetadataBaseUrl } from "@/lib/env/app-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadataBase = getMetadataBaseUrl();
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const viewport: Viewport = {
  themeColor: "#0284c7",
};

export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),
  title: "UKAgentFlow",
  description: "Estate agent viewing feedback (UK)",
  appleWebApp: {
    capable: true,
    title: "UKAgentFlow",
    statusBarStyle: "default",
  },
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
