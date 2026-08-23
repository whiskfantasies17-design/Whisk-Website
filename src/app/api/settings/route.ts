import { NextResponse } from "next/server";
import { readSettings, writeSettings } from "@/services/db";
import { getSession } from "@/services/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json({ settings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    // Strip any large base64-encoded image data before persisting to disk
    // (base64 images bloat JSON files causing parse errors).
    // The qrCodeUrl (API-generated URL) is kept instead.
    const diskSafe = { ...body };
    if (diskSafe.qrImageUrl && diskSafe.qrImageUrl.startsWith("data:")) {
      delete diskSafe.qrImageUrl;
    }

    // Write the disk-safe version (no giant base64) to the JSON store
    await writeSettings(diskSafe);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
