import { cookies } from "next/headers";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin" | "super-admin";
  address?: string;
  phone?: string;
}

/**
 * Gets the current active session on the server.
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("whisk_session");
  
  if (!sessionCookie) return null;
  
  try {
    return JSON.parse(sessionCookie.value) as UserSession;
  } catch (e) {
    return null;
  }
}

/**
 * Saves a user session into cookies.
 */
export async function setSession(session: UserSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("whisk_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

/**
 * Destroys the current user session cookie.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("whisk_session");
}
