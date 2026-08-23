import { NextResponse } from "next/server";
import { readTable, writeTable } from "@/services/db";
import { setSession } from "@/services/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password, address, phone } = await request.json();
    const users = await readTable<any>("users");
    
    if (users.some((u) => u.email === email)) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role: "customer",
      address: address || "",
      phone: phone || "",
    };
    
    users.push(newUser);
    await writeTable("users", users);
    
    const sessionUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as "customer",
      address: newUser.address,
      phone: newUser.phone,
    };
    
    await setSession(sessionUser);
    return NextResponse.json({ user: sessionUser });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
