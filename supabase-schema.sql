-- ========================================================
-- WHISK FANTASIES - COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- Copy and paste this script into Supabase SQL Editor and click RUN
-- URL: https://supabase.com/dashboard/project/_/sql
-- ========================================================

-- Drop pre-existing tables to prevent column mismatch errors
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.delivery CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;

-- 1. Products Table
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  rating NUMERIC DEFAULT 5.0,
  "reviewsCount" NUMERIC DEFAULT 0,
  image TEXT,
  category TEXT,
  description TEXT,
  occasions JSONB DEFAULT '[]'::jsonb,
  flavors JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  "isSignature" BOOLEAN DEFAULT false,
  "isCustomizable" BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  image TEXT,
  slug TEXT
);

-- 3. Banners Table (Hero Carousel)
CREATE TABLE public.banners (
  id SERIAL PRIMARY KEY,
  image TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  "ctaText" TEXT,
  "ctaLink" TEXT
);

-- 4. Settings Table (Global Store Settings)
CREATE TABLE public.settings (
  id INT PRIMARY KEY DEFAULT 1,
  "storeName" TEXT DEFAULT 'Whisk Fantasies',
  "websiteName" TEXT DEFAULT 'Whisk Fantasies',
  "announcementText" TEXT DEFAULT '✨ Free Delivery on all Orders above ₹999 across Mumbai & Thane! ✨',
  "qrCodeUrl" TEXT DEFAULT 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=whiskfantasies@upi&pn=Whisk%20Fantasies',
  "bankName" TEXT DEFAULT 'Reserve Bank of Mumbai',
  "accountName" TEXT DEFAULT 'Whisk Fantasies Mumbai',
  "accountNumber" TEXT DEFAULT '8424-0168-7697-8890',
  "ifscCode" TEXT DEFAULT 'IFSC-WHISK0008424',
  "whatsappNumber" TEXT DEFAULT '+918424016876',
  "whatsappDefaultMsg" TEXT DEFAULT 'Hi Whisk Fantasies! I would like to order a custom cake.',
  "groqApiKey" TEXT DEFAULT '',
  "systemPrompt" TEXT DEFAULT 'You are Whisk AI, a virtual assistant for Whisk Fantasies bakery...',
  "aiRules" JSONB DEFAULT '[]'::jsonb,
  "activeOffer" JSONB DEFAULT '{}'::jsonb
);

-- Insert Default Row in Settings Table
INSERT INTO public.settings (id, "storeName", "announcementText")
VALUES (1, 'Whisk Fantasies', '✨ Free Delivery on all Orders above ₹999 across Mumbai & Thane! ✨');

-- 5. Coupons Table
CREATE TABLE public.coupons (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  "discountPercentage" NUMERIC NOT NULL
);

-- 6. Delivery Zones Table
CREATE TABLE public.delivery (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  pincodes JSONB DEFAULT '[]'::jsonb,
  fee NUMERIC DEFAULT 0,
  "minDuration" TEXT DEFAULT '24 Hours'
);

-- 7. Orders Table
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  "userId" TEXT,
  "userName" TEXT,
  "userPhone" TEXT,
  address TEXT,
  pincode TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  "totalAmount" NUMERIC NOT NULL,
  status TEXT DEFAULT 'Order Submitted',
  "paymentReceiptUrl" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Reviews Table
CREATE TABLE public.reviews (
  id TEXT PRIMARY KEY,
  "productId" TEXT,
  "orderId" TEXT,
  "userName" TEXT,
  "userId" TEXT,
  rating NUMERIC DEFAULT 5,
  review TEXT,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security (RLS) to grant unrestricted REST API access
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
