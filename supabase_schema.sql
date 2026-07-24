-- WongLao (วงเหล้า) Supabase Database Schema & Seed Data
-- Run this script in your Supabase SQL Editor (https://app.supabase.com)

-- 1. Custom & Master Decks Table (คลังการ์ดคำถามและบทลงโทษทั้งหมด)
CREATE TABLE IF NOT EXISTS public.custom_decks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt TEXT NOT NULL,
    penalty TEXT DEFAULT 'ดื่ม 1 จิบ',
    deck_type TEXT DEFAULT 'truth_or_dare', -- 'truth_or_dare', 'never_have_i_ever', 'most_likely_to'
    intensity TEXT DEFAULT 'free',          -- 'free', 'spicy', 'extreme'
    type TEXT DEFAULT 'truth',              -- 'truth', 'dare', 'never', 'likely'
    is_master BOOLEAN DEFAULT true,         -- true = การ์ดหลักของระบบ, false = การ์ด custom
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Seed Initial Thai Card Decks into Database
INSERT INTO public.custom_decks (prompt, penalty, deck_type, intensity, type, is_master) VALUES
-- TRUTH OR DARE (FREE)
('ความจริง: เรื่องฮาๆ อายที่สุดที่เคยเกิดขึ้นกับคุณในที่สาธารณะคืออะไร?', 'ดื่ม 1 จิบ หรือ เล่าให้จบภายใน 30 วินาที', 'truth_or_dare', 'free', 'truth', true),
('ความกล้า: เต้นท่าที่คิดว่าตลกที่สุดกลางวงเป็นเวลา 15 วินาที', 'ดื่ม 1 จิบ หากไม่ยอมเต้น', 'truth_or_dare', 'free', 'dare', true),
('ความจริง: ดารา หรืออินฟลูเอนเซอร์คนไหนที่คุณแอบชอบมากที่สุด?', 'ดื่ม 1 จิบ', 'truth_or_dare', 'free', 'truth', true),
('ความกล้า: ส่งสติกเกอร์รูปหัวใจให้คนที่คุยอยู่ล่าสุดในแชตโดยไม่พิมอะไรต่อ', 'ดื่ม 2 จิบ', 'truth_or_dare', 'free', 'dare', true),

-- TRUTH OR DARE (18+ SPICY)
('ความจริง: จูบแรกเกิดขึ้นตอนอายุเท่าไหร่ และเกิดขึ้นที่ไหน?', 'ดื่ม 2 จิบ', 'truth_or_dare', 'spicy', 'truth', true),
('ความกล้า: สบตากับคนที่นั่งทางขวามือเป็นเวลา 20 วินาทีโดยห้ามยิ้มหรือหัวเราะ', 'ดื่ม 1 จิบทั้งคู่ถ้าหลุดหัวเราะ', 'truth_or_dare', 'spicy', 'dare', true),
('ความจริง: สเปกคนที่คุณพ่ายแพ้ทางความน่ารักในวงนี้คือใคร?', 'ดื่ม 2 จิบ', 'truth_or_dare', 'spicy', 'truth', true),

-- TRUTH OR DARE (EXTREME วงแตก)
('ความจริง: เคยแอบชอบแฟนเก่าของเพื่อนสนิทตนเองหรือไม่?', 'ดื่มหมดแก้ว!', 'truth_or_dare', 'extreme', 'truth', true),
('ความกล้า: โทรหาคนคุยเก่าแล้วพูดว่า "คิดถึงนะ" แล้ววางสายทันที', 'ดื่ม 3 จิบใหญ่', 'truth_or_dare', 'extreme', 'dare', true),

-- NEVER HAVE I EVER (FREE)
('ฉันไม่เคย... แกล้งหลับในห้องเรียนหรือในที่ทำงาน', 'ใครเคยดื่ม 1 จิบ', 'never_have_i_ever', 'free', 'never', true),
('ฉันไม่เคย... กดเข้าสตอรี่ไอจีคนอื่นแล้วเผลอมือไปโดนปุ่มกดส่งหัวใจ', 'ใครเคยดื่ม 1 จิบ', 'never_have_i_ever', 'free', 'never', true),
('ฉันไม่เคย... ทำอาหารหกใส่พื้นแล้วหยิบขึ้นมากินต่อตามกฎ 5 วินาที', 'ใครเคยดื่ม 1 จิบ', 'never_have_i_ever', 'free', 'never', true),

-- NEVER HAVE I EVER (18+ SPICY)
('ฉันไม่เคย... แอบส่องแชตหรือรูปเก่าของแฟนเก่าตอนตีสอง', 'ใครเคยดื่ม 2 จิบ', 'never_have_i_ever', 'spicy', 'never', true),
('ฉันไม่เคย... คุยซ้อนมากกว่า 2 คนพร้อมกัน', 'ใครเคยดื่ม 2 จิบ', 'never_have_i_ever', 'spicy', 'never', true),

-- NEVER HAVE I EVER (EXTREME วงแตก)
('ฉันไม่เคย... เผลอส่งแชตด่าคนอื่นผิดกลุ่มไปเข้ากลุ่มเจ้าตัว', 'ใครเคยดื่มหมดแก้ว!', 'never_have_i_ever', 'extreme', 'never', true),

-- MOST LIKELY TO (FREE)
('ใครในวงนี้มีโอกาส... นอนหลับคาวงเหล้าเป็นคนแรกมากที่สุด?', 'นับ 1 2 3 แล้วชี้พร้อมกัน! คนโดนชี้เยอะสุดดื่ม 1 จิบ', 'most_likely_to', 'free', 'likely', true),
('ใครในวงนี้มีโอกาส... โดนแก๊งคอลเซ็นเตอร์หลอกเงินมากที่สุด?', 'ชี้พร้อมกัน! คนโดนชี้เยอะสุดดื่ม 1 จิบ', 'most_likely_to', 'free', 'likely', true),

-- MOST LIKELY TO (18+ SPICY)
('ใครในวงนี้มีโอกาส... โทรหาแฟนเก่าตอนเมามากที่สุด?', 'ชี้พร้อมกัน! คนโดนชี้เยอะสุดดื่ม 2 จิบ', 'most_likely_to', 'spicy', 'likely', true),
('ใครในวงนี้มีความลับเยอะที่สุดแต่ไม่เคยเล่าให้ใครฟัง?', 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 2 จิบ หรือยอมแฉ 1 ความลับ', 'most_likely_to', 'extreme', 'likely', true);

-- Enable RLS
ALTER TABLE public.custom_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read custom_decks" ON public.custom_decks FOR SELECT USING (true);
CREATE POLICY "Allow public insert custom_decks" ON public.custom_decks FOR INSERT WITH CHECK (true);
