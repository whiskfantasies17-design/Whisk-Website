import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSession } from "@/services/auth";

const FILE = path.join(process.cwd(), "src", "mock-data", "users.json");

async function readUsers() {
  const raw = await fs.readFile(FILE, "utf-8");
  return JSON.parse(raw);
}
async function writeUsers(data: any[]) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf-8");
}

// PATCH — update logged-in user profile fields
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address } = body;

    const users = await readUsers();
    const idx = users.findIndex((u: any) => u.id === session.id);
    if (idx === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    users[idx] = {
      ...users[idx],
      name: name || users[idx].name,
      phone: phone || users[idx].phone,
      address: address || users[idx].address,
    };

    await writeUsers(users);
    return NextResponse.json({ success: true, user: users[idx] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
