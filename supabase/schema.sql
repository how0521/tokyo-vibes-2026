-- ============================================
-- TOKYO VIBES 2026 - Supabase Schema
-- ============================================
-- Run this in: Supabase Dashboard > SQL Editor

-- Create itinerary table
CREATE TABLE IF NOT EXISTS public.itinerary (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_num    SMALLINT NOT NULL CHECK (day_num BETWEEN 1 AND 6),
  time       TEXT NOT NULL DEFAULT '09:00',  -- 'HH:MM' format
  title      TEXT NOT NULL,
  map_url    TEXT,
  notes      TEXT,
  is_done    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast day queries
CREATE INDEX IF NOT EXISTS idx_itinerary_day ON public.itinerary(day_num, time);

-- Enable Row Level Security (open policy for shared use)
ALTER TABLE public.itinerary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON public.itinerary
  FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.itinerary;

-- ============================================
-- Seed: Sample Itinerary Data
-- ============================================

INSERT INTO public.itinerary (day_num, time, title, map_url, notes, is_done) VALUES
  -- Day 1: 5/20 抵達
  (1, '13:15', '抵達成田國際機場 (NRT)', 'https://www.google.com/maps/search/?api=1&query=Narita+International+Airport', '入境 → 取行李 → 買西瓜卡 / Suica', false),
  (1, '15:00', '飯店 Check-in', 'https://www.google.com/maps/search/?api=1&query=Tosei+Hotel+Cocone+Ueno+Okachimachi', 'Tosei Hotel Cocone 上野御徒町', false),
  (1, '17:00', '阿美橫丁散步', 'https://www.google.com/maps/search/?api=1&query=Ameya-Yokocho+Ueno+Tokyo', '上野商店街，買藥妝零食！', false),
  (1, '19:00', '上野 晚餐', 'https://www.google.com/maps/search/?api=1&query=上野+居酒屋', '附近居酒屋或拉麵', false),

  -- Day 2: 5/21 淺草 & 晴空塔
  (2, '09:00', '淺草寺 & 仲見世通り', 'https://www.google.com/maps/search/?api=1&query=Senso-ji+Temple+Asakusa', '記得買雷門紀念品 🏮', false),
  (2, '11:30', '東京晴空塔', 'https://www.google.com/maps/search/?api=1&query=Tokyo+Skytree', '預約票：350m 展望台', false),
  (2, '14:00', '秋葉原電器街', 'https://www.google.com/maps/search/?api=1&query=Akihabara+Electric+Town', '3C、扭蛋、周邊商品', false),
  (2, '18:00', '秋葉原 晚餐', 'https://www.google.com/maps/search/?api=1&query=秋葉原+晚餐', '', false),

  -- Day 3: 5/22 迪士尼
  (3, '08:00', '東京迪士尼樂園 開園', 'https://www.google.com/maps/search/?api=1&query=Tokyo+Disneyland', '帶雨衣！提前下載 Tokyo Disney Resort App', false),
  (3, '12:00', '園內午餐', NULL, '建議訂位或早到排隊餐廳', false),
  (3, '21:00', '迪士尼煙火 🎆', NULL, '夜間遊行結束後搭電車返回', false),

  -- Day 4: 5/23 新宿 & 渋谷
  (4, '09:30', '新宿御苑', 'https://www.google.com/maps/search/?api=1&query=Shinjuku+Gyoen+National+Garden', '大人 ¥500，花園超美', false),
  (4, '12:30', '新宿午餐', 'https://www.google.com/maps/search/?api=1&query=新宿+ランチ', '伊勢丹地下美食或拉麵街', false),
  (4, '14:00', '原宿 竹下通り', 'https://www.google.com/maps/search/?api=1&query=Takeshita+Street+Harajuku', '可愛服飾、棉花糖可麗餅', false),
  (4, '16:30', '表參道', 'https://www.google.com/maps/search/?api=1&query=Omotesando+Tokyo', '精品街散步', false),
  (4, '19:00', '澀谷 SCRAMBLE 夜景', 'https://www.google.com/maps/search/?api=1&query=Shibuya+Crossing', '超大十字路口打卡 📸', false),

  -- Day 5: 5/24 銀座 & 台場
  (5, '10:00', '銀座 購物', 'https://www.google.com/maps/search/?api=1&query=Ginza+Tokyo', 'ITOYA 文具店必去！', false),
  (5, '12:30', '築地外市場 午餐', 'https://www.google.com/maps/search/?api=1&query=Tsukiji+Outer+Market', '海鮮丼、玉子燒 🍣', false),
  (5, '15:00', '台場', 'https://www.google.com/maps/search/?api=1&query=Odaiba+Tokyo', 'teamLab / DiverCity Gundam', false),
  (5, '18:30', '台場 夕陽 & 晚餐', 'https://www.google.com/maps/search/?api=1&query=台場+夕陽', '彩虹橋夜景超美 🌇', false),

  -- Day 6: 5/25 回程
  (6, '08:00', '飯店早餐 & 整理行李', NULL, '記得確認所有物品！', false),
  (6, '10:00', '飯店 Check-out', 'https://www.google.com/maps/search/?api=1&query=Tosei+Hotel+Cocone+Ueno+Okachimachi', '行李可寄放至下午', false),
  (6, '11:00', '上野公園最後散步', 'https://www.google.com/maps/search/?api=1&query=Ueno+Park+Tokyo', '買最後的伴手禮', false),
  (6, '14:00', '前往成田機場', 'https://www.google.com/maps/search/?api=1&query=Narita+International+Airport', '上野 → 京成特急 → 成田 約 70 分鐘', false),
  (6, '17:55', '搭乘 CI105 回台 ✈', NULL, '中華航空 NRT → TPE', false);
