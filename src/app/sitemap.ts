import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/env/app-url";

/** Indexable marketing & legal URLs only — app routes require auth or are noindex elsewhere. */
const PUBLIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }[] =
  [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.5 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.5 },
    { path: "/cookies", changeFrequency: "yearly", priority: 0.5 },
  ];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppBaseUrl();
  const lastModified = new Date();
  return PUBLIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? `${base}/` : `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
