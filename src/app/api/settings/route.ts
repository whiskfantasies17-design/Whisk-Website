import { NextResponse } from "next/server";
import { readSettings, writeSettings } from "@/services/db";
import { getSession } from "@/services/auth";

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
    await writeSettings(body);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
