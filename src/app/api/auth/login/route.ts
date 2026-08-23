import { NextResponse } from "next/server";
import { readTable } from "@/services/db";
import { setSession } from "@/services/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cleanEmail = (body.email || "").trim().toLowerCase();
    const cleanPassword = (body.password || "").trim();

    const MASTER_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "whiskfantasies17@gmail.com").trim().toLowerCase();
    const MASTER_ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "Whisk@Password@2026").trim();

    // 1. Direct Master Admin Credentials Matching (Works everywhere, offline, Vercel & Supabase)
    if (cleanEmail === MASTER_ADMIN_EMAIL && cleanPassword === MASTER_ADMIN_PASSWORD) {
      const adminSession = {
        id: "user-admin-master",
        email: MASTER_ADMIN_EMAIL,
        name: "Whisk Owner Admin",
        role: "admin" as const,
        address: "Karm Stambh, LBS Marg, Vikhroli, Mumbai",
        phone: "+91 8424016876",
      };
      await setSession(adminSession);
      return NextResponse.json({ user: adminSession, session: adminSession });
    }

    // 2. Database Lookup (Supabase or local JSON)
    const users = await readTable<any>("users");
    const user = users.find(
      (u: any) =>
        (u.email || "").trim().toLowerCase() === cleanEmail &&
        (u.password || "").trim() === cleanPassword
    );

    if (user) {
      const sessionUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        address: user.address,
        phone: user.phone,
      };
      await setSession(sessionUser);
      return NextResponse.json({ user: sessionUser, session: sessionUser });
    }

    // 3. Fallback: If user email contains admin or owner keyword with correct password
    if (cleanEmail.includes("admin") || cleanEmail.includes("owner") || cleanEmail === "admin@whisk.com") {
      if (cleanPassword === MASTER_ADMIN_PASSWORD || cleanPassword === "Whisk@Password@2026") {
        const adminSession = {
          id: "user-admin-master",
          email: cleanEmail,
          name: "Whisk Owner Admin",
          role: "admin" as const,
          address: "Karm Stambh, LBS Marg, Vikhroli, Mumbai",
          phone: "+91 8424016876",
        };
        await setSession(adminSession);
        return NextResponse.json({ user: adminSession, session: adminSession });
      }
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
