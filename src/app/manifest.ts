import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UKAgentFlow",
    short_name: "UKAgentFlow",
    description: "Estate agent viewing feedback (UK)",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#0284c7",
    icons: [
      { src: "/icon/32", type: "image/png", sizes: "32x32", purpose: "any" },
      { src: "/icon/192", type: "image/png", sizes: "192x192", purpose: "any" },
      { src: "/icon/512", type: "image/png", sizes: "512x512", purpose: "any" },
    ],
  };
}
