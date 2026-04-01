import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary/upload";
import { getSql } from "@/lib/db/neon";
import { NextResponse } from "next/server";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const kind = String(formData.get("kind") ?? "");
  const propertyIdRaw = formData.get("propertyId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, or WebP image." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large before upload." }, { status: 400 });
  }

  const companyId = session.user.companyId;
  const userId = session.user.id;

  let folder: string;
  let publicId: string;

  if (kind === "property_hero") {
    const propertyId =
      typeof propertyIdRaw === "string" ? propertyIdRaw.trim() : "";
    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
    }
    const sql = getSql();
    const ok = await sql`
      SELECT 1 AS ok
      FROM properties
      WHERE id = ${propertyId} AND company_id = ${companyId}
      LIMIT 1
    `;
    if ((ok as { ok: number }[]).length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 403 });
    }
    folder = `ukagentflow/properties/${companyId}/${propertyId}`;
    publicId = "hero";
  } else if (kind === "property_hero_draft") {
    folder = `ukagentflow/properties/${companyId}/draft`;
    publicId = randomUUID().replace(/-/g, "");
  } else if (kind === "company_logo") {
    folder = `ukagentflow/branding/companies/${companyId}`;
    publicId = "logo";
  } else if (kind === "profile_photo") {
    folder = `ukagentflow/branding/users/${userId}`;
    publicId = "photo";
  } else {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  let buffer: Buffer;
  try {
    const ab = await file.arrayBuffer();
    buffer = Buffer.from(ab);
  } catch {
    return NextResponse.json({ error: "Could not read file" }, { status: 400 });
  }

  try {
    const url = await uploadImageToCloudinary({
      buffer,
      mimeType: file.type,
      folder,
      publicId,
    });
    return NextResponse.json({ url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    if (msg === "CLOUDINARY_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
        },
        { status: 503 },
      );
    }
    console.error("[cloudinary upload]", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
