import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-guards";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

function isCloudinaryConfigured(): boolean {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

async function generateSignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const msgBuffer = new TextEncoder().encode(sorted + apiSecret);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// POST /api/admin/upload — Upload an image file
export async function POST(request: NextRequest) {
  const auth = await requireRole(request, ["ADMIN", "MANAGER"]);
  if ("error" in auth) return auth.error;

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { success: false, error: "Image upload is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: "Invalid file type. Allowed: JPEG, PNG, WebP, AVIF" },
      { status: 400 }
    );
  }

  // Validate file size (5 MB max)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { success: false, error: "File too large. Maximum size is 5 MB." },
      { status: 400 }
    );
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const params: Record<string, string> = {
      folder: "delicacies",
      timestamp,
    };

    const signature = await generateSignature(params, CLOUDINARY_API_SECRET!);

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("folder", "delicacies");
    uploadData.append("timestamp", timestamp);
    uploadData.append("signature", signature);
    uploadData.append("api_key", CLOUDINARY_API_KEY!);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: uploadData }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data.error?.message || "Upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { url: data.secure_url },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
