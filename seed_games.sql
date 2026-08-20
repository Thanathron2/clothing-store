-- เพิ่มเกมให้เยอะขึ้น (รันใน Supabase SQL Editor)

-- เพิ่มเกม
INSERT INTO public.games (id, name, logo_url, banner_url, category, description) VALUES
('44444444-4444-4444-4444-444444444444', 'PUBG Mobile', 'https://api.dicebear.com/7.x/shapes/svg?seed=pubg&backgroundColor=1a1a2e', 'https://images.unsplash.com/photo-1589244159943-460088ed5c92?q=80&w=1200&auto=format&fit=crop', 'Mobile Survival', 'เติม UC PUBG Mobile ราคาสุดคุ้ม ส่งของภายใน 30 วินาที'),
('55555555-5555-5555-5555-555555555555', 'Genshin Impact', 'https://api.dicebear.com/7.x/shapes/svg?seed=genshin&backgroundColor=16213e', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop', 'PC/RPG', 'เติม Genesis Crystal Genshin Impact ทุกเซิร์ฟเวอร์ ราคาพิเศษ'),
('66666666-6666-6666-6666-666666666666', 'Honkai: Star Rail', 'https://api.dicebear.com/7.x/shapes/svg?seed=honkai&backgroundColor=0f3460', 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=1200&auto=format&fit=crop', 'PC/RPG', 'เติม Stellar Jades Honkai Star Rail รวดเร็ว ราคาดีที่สุด'),
('77777777-7777-7777-7777-777777777777', 'League of Legends', 'https://api.dicebear.com/7.x/shapes/svg?seed=lol&backgroundColor=1a1a2e', 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=1200&auto=format&fit=crop', 'PC Moba', 'เติม Riot Points League of Legends ราคาถูกที่สุด'),
('88888888-8888-8888-8888-888888888888', 'Call of Duty Mobile', 'https://api.dicebear.com/7.x/shapes/svg?seed=codm&backgroundColor=16213e', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop', 'Mobile Shooter', 'เติม CP Call of Duty Mobile ส่งของทันที'),
('99999999-9999-9999-9999-999999999999', 'Roblox', 'https://api.dicebear.com/7.x/shapes/svg?seed=roblox&backgroundColor=0f3460', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1200&auto=format&fit=crop', 'Multiplayer', 'เติม Robux Roblox ราคาสุดคุ้ม ได้รับทันที'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Minecraft', 'https://api.dicebear.com/7.x/shapes/svg?seed=minecraft&backgroundColor=1a1a2e', 'https://images.unsplash.com/photo-1627856014759-08522924670b?q=80&w=1200&auto=format&fit=crop', 'Sandbox', 'เติม Minecoins Minecraft ทุกแพลตฟอร์ม'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Apex Legends', 'https://api.dicebear.com/7.x/shapes/svg?seed=apex&backgroundColor=16213e', 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=1200&auto=format&fit=crop', 'PC Shooter', 'เติม Apex Coins ราคาดีที่สุด ส่งของภายใน 1 นาที'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Overwatch 2', 'https://api.dicebear.com/7.x/shapes/svg?seed=overwatch&backgroundColor=0f3460', 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=1200&auto=format&fit=crop', 'PC Shooter', 'เติม Coins Overwatch 2 ราคาพิเศษ');

-- แพ็กเกจ PUBG Mobile
INSERT INTO public.game_packages (game_id, name, price, original_price, reward_amount) VALUES
('44444444-4444-4444-4444-444444444444', '60 UC', 29.00, 35.00, 60),
('44444444-4444-4444-4444-444444444444', '300 UC', 145.00, 180.00, 300),
('44444444-4444-4444-4444-444444444444', '600 UC', 289.00, 350.00, 600),
('44444444-4444-4444-4444-444444444444', '1800 UC', 869.00, 1000.00, 1800);

-- แพ็กเกจ Genshin Impact
INSERT INTO public.game_packages (game_id, name, price, original_price, reward_amount) VALUES
('55555555-5555-5555-5555-555555555555', '60 Genesis Crystals', 39.00, 45.00, 60),
('55555555-5555-5555-5555-555555555555', '300+30 Genesis Crystals', 179.00, 200.00, 330),
('55555555-5555-5555-5555-555555555555', '980+110 Genesis Crystals', 529.00, 600.00, 1090),
('55555555-5555-5555-5555-555555555555', '1980+260 Genesis Crystals', 1049.00, 1200.00, 2240),
('55555555-5555-5555-5555-555555555555', '3280+600 Genesis Crystals', 1749.00, 2000.00, 3880);

-- แพ็กเกจ Honkai: Star Rail
INSERT INTO public.game_packages (game_id, name, price, original_price, reward_amount) VALUES
('66666666-6666-6666-6666-666666666666', '60 Stellar Jades', 39.00, 45.00, 60),
('66666666-6666-6666-6666-666666666666', '300+30 Stellar Jades', 179.00, 200.00, 330),
('66666666-6666-6666-6666-666666666666', '980+110 Stellar Jades', 529.00, 600.00, 1090),
('66666666-6666-6666-6666-666666666666', '1980+260 Stellar Jades', 1049.00, 1200.00, 2240);

-- แพ็กเกจ League of Legends
INSERT INTO public.game_packages (game_id, name, price, original_price, reward_amount) VALUES
('77777777-7777-7777-7777-777777777777', '650 RP', 149.00, 170.00, 650),
('77777777-7777-7777-7777-777777777777', '1380 RP', 289.00, 330.00, 1380),
('77777777-7777-7777-7777-777777777777', '2800 RP', 579.00, 650.00, 2800),
('77777777-7777-7777-7777-777777777777', '5300 RP', 1099.00, 1250.00, 5300);

-- แพ็กเกจ Call of Duty Mobile
INSERT INTO public.game_packages (game_id, name, price, original_price, reward_amount) VALUES
('88888888-8888-8888-8888-888888888888', '80 CP', 29.00, 35.00, 80),
('88888888-8888-8888-8888-888888888888', '400 CP', 145.00, 170.00, 400),
('88888888-8888-8888-8888-888888888888', '1000 CP', 349.00, 400.00, 1000),
('88888888-8888-8888-8888-888888888888', '2000 CP', 689.00, 800.00, 2000);

-- แพ็กเกจ Roblox
INSERT INTO public.game_packages (game_id, name, price, original_price, reward_amount) VALUES
('99999999-9999-9999-9999-999999999999', '80 Robux', 29.00, 35.00, 80),
('99999999-9999-9999-9999-999999999999', '400 Robux', 119.00, 140.00, 400),
('99999999-9999-9999-9999-999999999999', '800 Robux', 229.00, 270.00, 800),
('99999999-9999-9999-9999-999999999999', '1700 Robux', 449.00, 520.00, 1700);

-- แพ็กเกจ Minecraft
INSERT INTO public.game_packages (game_id, name, price, original_price, reward_amount) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '320 Minecoins', 29.00, 35.00, 320),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '960 Minecoins', 79.00, 95.00, 960),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1920 Minecoins', 149.00, 180.00, 1920),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '3840 Minecoins', 289.00, 350.00, 3840);

-- แพ็กเกจ Apex Legends
INSERT INTO public.game_packages (game_id, name, price, original_price, reward_amount) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1000 Apex Coins', 289.00, 350.00, 1000),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2150 Apex Coins', 579.00, 700.00, 2150),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '4350 Apex Coins', 1149.00, 1400.00, 4350),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11000 Apex Coins', 2899.00, 3500.00, 11000);

-- แพ็กเกจ Overwatch 2
INSERT INTO public.game_packages (game_id, name, price, original_price, reward_amount) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', '500 Coins', 119.00, 140.00, 500),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '1000 Coins', 229.00, 270.00, 1000),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '2200 Coins', 449.00, 550.00, 2200),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '5700 Coins', 1049.00, 1300.00, 5700);
