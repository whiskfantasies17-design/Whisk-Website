import { NextResponse } from "next/server";
import { readTable } from "@/services/db";
import { setSession } from "@/services/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const users = await readTable<any>("users");
    const user = users.find((u) => u.email === email && u.password === password);
    
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      address: user.address,
      phone: user.phone,
    };
    
    await setSession(sessionUser);
    return NextResponse.json({ user: sessionUser });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
