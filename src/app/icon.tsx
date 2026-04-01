import { ukagentflowMarkImageResponse } from "@/lib/brand/ukagentflow-mark-icon-image";

export const runtime = "nodejs";

export function generateImageMetadata() {
  return [
    { id: "32", contentType: "image/png" as const, size: { width: 32, height: 32 } },
    { id: "192", contentType: "image/png" as const, size: { width: 192, height: 192 } },
    { id: "512", contentType: "image/png" as const, size: { width: 512, height: 512 } },
  ];
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const raw = await id;
  const dim =
    raw === "192" ? 192 : raw === "512" ? 512 : 32;
  return ukagentflowMarkImageResponse(dim);
}
