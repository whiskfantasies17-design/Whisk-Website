import { NextResponse } from "next/server";
import { readTable } from "@/services/db";
import { setSession } from "@/services/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Check environment variables if defined on server
    const envAdminEmail = process.env.ADMIN_EMAIL;
    const envAdminPassword = process.env.ADMIN_PASSWORD;

    if (envAdminEmail && envAdminPassword && email === envAdminEmail && password === envAdminPassword) {
      const sessionUser = {
        id: "user-admin-master",
        email: envAdminEmail,
        name: "Whisk Admin",
        role: "admin",
        address: "Karm Stambh, LBS Marg, Vikhroli, Mumbai",
        phone: "+91 8424016876",
      };
      await setSession(sessionUser);
      return NextResponse.json({ user: sessionUser });
    }

    // 2. Lookup in users table (Supabase or local JSON)
    const users = await readTable<any>("users");
    const user = users.find((u: any) => u.email === email && u.password === password);
    
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
