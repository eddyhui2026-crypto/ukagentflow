import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/env/app-url";

export default function robots(): MetadataRoute.Robots {
  const base = getAppBaseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard/",
        "/properties/",
        "/settings/",
        "/reports/",
        "/feedback/",
        "/vendor/",
        "/prequal/",
        "/register",
        "/login",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
