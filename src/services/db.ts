import fs from "fs/promises";
import path from "path";

const MOCK_DATA_DIR = path.join(process.cwd(), "src", "mock-data");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_KEY);

// In-Memory Database Fallback for instant serverless & node persistence
declare global {
  /* eslint-disable no-var */
  var _whiskMemoryDb: Record<string, any> | undefined;
  var _whiskMemorySettings: any | undefined;
  /* eslint-enable no-var */
}

if (!globalThis._whiskMemoryDb) {
  globalThis._whiskMemoryDb = {};
}

/**
 * Reads all rows from database table (Supabase, In-Memory, or local JSON fallback).
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
        const rows = (await res.json()) as T[];
        if (rows && Array.isArray(rows)) {
          globalThis._whiskMemoryDb![tableName] = rows;
          return rows;
        }
      }
    } catch (err) {
      console.error(`Supabase connection error for ${tableName}:`, err);
    }
  }

  // Check In-Memory Store
  if (globalThis._whiskMemoryDb![tableName] !== undefined) {
    return globalThis._whiskMemoryDb![tableName] as T[];
  }

  // Local JSON fallback
  try {
    const filePath = path.join(MOCK_DATA_DIR, `${tableName}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data) as T[];
    globalThis._whiskMemoryDb![tableName] = parsed;
    return parsed;
  } catch (error) {
    console.error(`Error reading data table: ${tableName}`, error);
    return [];
  }
}

/**
 * Overwrites all rows in database table (Supabase, In-Memory & local JSON fallback).
 */
export async function writeTable<T>(tableName: string, data: T[]): Promise<boolean> {
  // Always update memory store immediately
  globalThis._whiskMemoryDb![tableName] = data;

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

      await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY!}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(data),
      });
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
    return true; // Still true because in-memory store succeeded!
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
        if (rows && rows.length > 0) {
          const merged = { ...defaultSettings, ...rows[0] };
          globalThis._whiskMemorySettings = merged;
          return merged as T;
        }
      }
    } catch (err) {
      console.error("Supabase read settings error:", err);
    }
  }

  // Check In-Memory Settings
  if (globalThis._whiskMemorySettings !== undefined) {
    return { ...defaultSettings, ...globalThis._whiskMemorySettings } as T;
  }

  try {
    const filePath = path.join(MOCK_DATA_DIR, "settings.json");
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data);
    const merged = { ...defaultSettings, ...parsed };
    globalThis._whiskMemorySettings = merged;
    return merged as T;
  } catch (error) {
    console.error("Error reading settings", error);
    return defaultSettings as T;
  }
}

/**
 * Writes global settings object.
 */
export async function writeSettings<T>(data: T): Promise<boolean> {
  globalThis._whiskMemorySettings = data;

  if (isSupabaseConfigured()) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/settings?id=eq.1`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY!}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
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
    return true;
  }
}
