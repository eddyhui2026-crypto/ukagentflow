import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

let cachedDataUrl: string | null = null;

async function getMarkDataUrl(): Promise<string> {
  if (cachedDataUrl) return cachedDataUrl;
  const svg = await readFile(
    path.join(process.cwd(), "public/brand/ukagentflow-mark.svg"),
    "utf8",
  );
  cachedDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return cachedDataUrl;
}

/** Rasterise the homepage UKAgentFlow mark for favicon / PWA / apple-touch-icon. */
export async function ukagentflowMarkImageResponse(sizePx: number): Promise<ImageResponse> {
  const src = await getMarkDataUrl();
  return new ImageResponse(
    (
      <img
        src={src}
        alt=""
        width={sizePx}
        height={sizePx}
        style={{ width: sizePx, height: sizePx }}
      />
    ),
    { width: sizePx, height: sizePx },
  );
}
