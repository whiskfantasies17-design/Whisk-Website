import { NextResponse } from "next/server";
import { readTable, writeTable } from "@/services/db";
import { getSession } from "@/services/auth";

export async function GET() {
  try {
    const banners = await readTable("banners");
    return NextResponse.json({ banners });
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
    await writeTable("banners", body);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
