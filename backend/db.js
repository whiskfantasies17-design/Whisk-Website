const fs = require("fs").promises;
const path = require("path");

const MOCK_DATA_DIR = path.join(__dirname, "mock-data");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_KEY);

// In-Memory Database Fallback
const memoryDb = {};
let memorySettings = undefined;

/**
 * Safe JSON file read — returns null if file is empty, missing, or corrupt.
 */
async function safeReadJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const trimmed = raw.trim();
    if (!trimmed) return null;
    return JSON.parse(trimmed);
  } catch (err) {
    return null;
  }
}

/**
 * Atomic JSON write — writes to temp file then renames.
 */
async function safeWriteJson(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  const tempPath = filePath + ".tmp";
  await fs.writeFile(tempPath, json, "utf-8");
  await fs.rename(tempPath, filePath);
}

/**
 * Reads all rows from database table (Supabase -> In-Memory -> local JSON fallback).
 */
async function readTable(tableName) {
  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && Array.isArray(rows)) {
          memoryDb[tableName] = rows;
          return rows;
        }
      }
    } catch (err) {
      console.error(`Supabase connection error for ${tableName}:`, err.message);
    }
  }

  // Check In-Memory Store
  if (memoryDb[tableName] !== undefined) {
    return memoryDb[tableName];
  }

  // Local JSON fallback
  const filePath = path.join(MOCK_DATA_DIR, `${tableName}.json`);
  const parsed = await safeReadJson(filePath);
  if (Array.isArray(parsed)) {
    memoryDb[tableName] = parsed;
    return parsed;
  }
  return [];
}

/**
 * Overwrites all rows in database table (Supabase + In-Memory + local JSON fallback).
 */
async function writeTable(tableName, data) {
  memoryDb[tableName] = data;

  if (isSupabaseConfigured()) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });

      if (data.length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(data),
        });
      }
    } catch (err) {
      console.error(`Supabase write error for ${tableName}:`, err.message);
    }
  }

  try {
    const filePath = path.join(MOCK_DATA_DIR, `${tableName}.json`);
    await safeWriteJson(filePath, data);
    return true;
  } catch (error) {
    console.error(`Error writing table: ${tableName}`, error.message);
    return true;
  }
}

/**
 * Reads global settings object.
 */
async function readSettings() {
  const defaultSettings = {
    storeName: "Whisk Fantasies",
    websiteName: "Whisk Fantasies",
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
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        cache: "no-store",
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0) {
          const merged = { ...defaultSettings, ...rows[0] };
          memorySettings = merged;
          return merged;
        }
      }
    } catch (err) {
      console.error("Supabase read settings error:", err.message);
    }
  }

  if (memorySettings !== undefined) {
    return { ...defaultSettings, ...memorySettings };
  }

  const filePath = path.join(MOCK_DATA_DIR, "settings.json");
  const parsed = await safeReadJson(filePath);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const merged = { ...defaultSettings, ...parsed };
    memorySettings = merged;
    return merged;
  }

  return defaultSettings;
}

/**
 * Writes global settings object.
 */
async function writeSettings(data) {
  memorySettings = data;

  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/settings?id=eq.1`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        await fetch(`${SUPABASE_URL}/rest/v1/settings`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({ id: 1, ...data }),
        });
      }
    } catch (err) {
      console.error("Supabase write settings error:", err.message);
    }
  }

  try {
    const filePath = path.join(MOCK_DATA_DIR, "settings.json");
    await safeWriteJson(filePath, data);
    return true;
  } catch (error) {
    console.error("Error writing settings", error.message);
    return true;
  }
}

module.exports = {
  readTable,
  writeTable,
  readSettings,
  writeSettings,
  safeReadJson,
  safeWriteJson,
  MOCK_DATA_DIR,
};
