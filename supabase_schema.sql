-- WongLao (วงเหล้า) Supabase Database Schema
-- Run this script in your Supabase SQL Editor (https://app.supabase.com)

-- 1. Custom Decks Table (การ์ดที่ผู้ใช้งานสร้างเอง)
CREATE TABLE IF NOT EXISTS public.custom_decks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt TEXT NOT NULL,
    penalty TEXT DEFAULT 'ดื่ม 1 จิบ',
    deck_type TEXT DEFAULT 'truth_or_dare',
    intensity TEXT DEFAULT 'free',
    creator_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. User Profiles Table (โปรไฟล์สายตี้)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name TEXT NOT NULL,
    player_avatar TEXT DEFAULT '🍻',
    is_vip BOOLEAN DEFAULT false,
    vip_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Party Passes Table (ประวัติการซื้อบัตรปลดล็อกโหมด)
CREATE TABLE IF NOT EXISTS public.party_passes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pass_type TEXT NOT NULL, -- '24hr' or 'monthly'
    price_thb NUMERIC DEFAULT 39,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Enable
ALTER TABLE public.custom_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_passes ENABLE ROW LEVEL SECURITY;

-- Allow Anonymous Read/Write Access for Party Game Decks
CREATE POLICY "Allow public read custom_decks" ON public.custom_decks FOR SELECT USING (true);
CREATE POLICY "Allow public insert custom_decks" ON public.custom_decks FOR INSERT WITH CHECK (true);
