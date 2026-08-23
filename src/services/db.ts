import fs from "fs/promises";
import path from "path";

const MOCK_DATA_DIR = path.join(process.cwd(), "src", "mock-data");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_KEY);

/**
 * Reads all rows from database table (Supabase or local JSON fallback).
 */
export async function readTable<T>(tableName: string): Promise<T[]> {
  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY!}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      if (res.ok) {
        return (await res.json()) as T[];
      }
      console.warn(`Supabase read failed for ${tableName}, falling back to local file system.`);
    } catch (err) {
      console.error(`Supabase connection error for ${tableName}:`, err);
    }
  }

  // Local JSON fallback
  try {
    const filePath = path.join(MOCK_DATA_DIR, `${tableName}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T[];
  } catch (error) {
    console.error(`Error reading data table: ${tableName}`, error);
    return [];
  }
}

/**
 * Overwrites all rows in database table (Supabase or local JSON fallback).
 */
export async function writeTable<T>(tableName: string, data: T[]): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      // Clear existing records and bulk upsert
      await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY!}`,
        },
      });

      const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY!}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) return true;
    } catch (err) {
      console.error(`Supabase write error for ${tableName}:`, err);
    }
  }

  // Local JSON fallback
  try {
    const filePath = path.join(MOCK_DATA_DIR, `${tableName}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error(`Error writing table: ${tableName}`, error);
    return false;
  }
}

/**
 * Reads global settings object.
 */
export async function readSettings<T>(): Promise<T> {
  const defaultSettings: any = {
    storeName: "Whisk Fantasies Boutique",
    announcementText: "✨ Free Delivery on all Orders above ₹999 across Mumbai & Thane! ✨",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=whiskfantasies@upi&pn=Whisk%20Fantasies",
    bankName: "Reserve Bank of Mumbai",
    accountName: "Whisk Fantasies Mumbai",
    accountNumber: "8424-0168-7697-8890",
    ifscCode: "IFSC-WHISK0008424",
    whatsappNumber: "+918424016876",
    whatsappDefaultMsg: "Hi Whisk Fantasies! I would like to order a custom cake.",
    groqApiKey: "",
    systemPrompt: "You are Whisk AI, a virtual assistant for Whisk Fantasies bakery...",
    aiRules: [
      { keywords: ["eggless", "vegan"], response: "Yes! All our cakes can be prepared 100% eggless." },
      { keywords: ["custom", "photo"], response: "We accept custom cakes! Send your reference photo on WhatsApp." }
    ],
    activeOffer: {
      text: "🎉 Flash Celebration Offer: Flat 15% Off all confections!",
      discountPercentage: 15,
      durationHours: 2,
      isActive: true,
      startedAt: new Date().toISOString(),
    }
  };

  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/settings?id=eq.1&select=*`, {
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY!}`,
        },
        cache: "no-store",
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0) return { ...defaultSettings, ...rows[0] } as T;
      }
    } catch (err) {
      console.error("Supabase read settings error:", err);
    }
  }

  try {
    const filePath = path.join(MOCK_DATA_DIR, "settings.json");
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data);
    return { ...defaultSettings, ...parsed } as T;
  } catch (error) {
    console.error("Error reading settings", error);
    return defaultSettings as T;
  }
}

/**
 * Writes global settings object.
 */
export async function writeSettings<T>(data: T): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/settings?id=eq.1`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY!}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (res.ok) return true;
    } catch (err) {
      console.error("Supabase write settings error:", err);
    }
  }

  try {
    const filePath = path.join(MOCK_DATA_DIR, "settings.json");
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing settings", error);
    return false;
  }
}
