import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSession } from "@/services/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FILE = path.join(process.cwd(), "src", "mock-data", "delivery.json");

async function readZones() {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeZones(data: any[]) {
  const temp = FILE + ".tmp";
  await fs.writeFile(temp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(temp, FILE);
}

// GET — public: returns all zones
export async function GET() {
  try {
    const zones = await readZones();
    return NextResponse.json({ zones });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — admin only: full replace of zones list
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    await writeZones(body);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
