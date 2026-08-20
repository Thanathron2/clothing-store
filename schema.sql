-- SQL SCHEMA FOR AURA APPAREL (OFFICIAL CLOTHING STORE)
-- RUN IN SUPABASE SQL EDITOR

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing triggers & old tables if re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.game_packages CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;
DROP TABLE IF EXISTS public.topup_transactions CASCADE;
DROP TABLE IF EXISTS public.purchase_transactions CASCADE;

-- 1. Profiles Table (Create or Update columns)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    address TEXT,
    credit NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    role TEXT DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure phone & address columns exist in case profiles existed previously
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='address') THEN
        ALTER TABLE public.profiles ADD COLUMN address TEXT;
    END IF;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Public profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Categories Table
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can modify categories" ON public.categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Products Table
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    description TEXT,
    image_url TEXT NOT NULL,
    additional_images JSONB DEFAULT '[]'::jsonb,
    sizes JSONB DEFAULT '["S", "M", "L", "XL"]'::jsonb,
    colors JSONB DEFAULT '["Black", "White"]'::jsonb,
    stock INT DEFAULT 50 NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can modify products" ON public.products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Orders Table
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    shipping_name TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('promptpay', 'credit')),
    payment_details JSONB,
    status TEXT DEFAULT 'pending_payment' NOT NULL CHECK (status IN ('pending_payment', 'preparing', 'shipped', 'delivered', 'cancelled')),
    tracking_number TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all orders" ON public.orders FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Order Items Table
CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    price NUMERIC(10, 2) NOT NULL,
    quantity INT DEFAULT 1 NOT NULL,
    size TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins manage all order items" ON public.order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. Trigger: Profile Auto-creation on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, role, credit, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'user'),
        0.00,
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Seed Initial Categories & Fashion Products
INSERT INTO public.categories (id, name, slug, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Tops & Tees', 'tops', 'เสื้อยืดแฟชั่น Oversized ทรงสวย ผ้าเนื้อหนาพิเศษ 240GSM'),
('22222222-2222-2222-2222-222222222222', 'Hoodies & Jackets', 'outerwear', 'เสื้อฮู้ดและแจ็คเก็ตทรงปัง ดีไซน์สตรีทพรีเมียม'),
('33333333-3333-3333-3333-333333333333', 'Pants & Cargos', 'pants', 'กางเกงคาร์โก้และกางเกงสตรีท ทรงสวยใส่สบาย'),
('44444444-4444-4444-4444-444444444444', 'Accessories', 'accessories', 'หมวก กระเป๋า และเครื่องประดับแฟชั่นคอมพลีทลุค');

INSERT INTO public.products (id, category_id, name, price, original_price, description, image_url, sizes, colors, stock, is_featured) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'AURA Heavyweight Oversized Tee', 790.00, 1190.00, 'เสื้อยืดแขนสั้น Oversized ผลิตจากผ้า Cotton 100% เกรดพรีเมียม 260GSM นุ่มสบาย ระบายอากาศได้ดีเยี่ยม ทรงสวยอยู่ทรงตลอดวัน', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop', '["S", "M", "L", "XL", "XXL"]', '["Cyber Black", "Off White", "Slate Gray"]', 45, true),

('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Cyberpunk Neon Zip-Up Hoodie', 1890.00, 2490.00, 'เสื้อฮู้ดซิปหน้าทรงครอปพรีเมียม ผ้า Fleece เนื้อนุ่มกันหนาวได้ดี ตกแต่งสกรีนสะท้อนแสง 3M ปลายแขนกระชับ ใส่ได้ทั้งชายและหญิง', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop', '["M", "L", "XL"]', '["Neon Violet", "Obsidian Black"]', 30, true),

('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Tactical Multi-Pocket Cargo Pants', 1490.00, 1990.00, 'กางเกงคาร์โก้ทรงดีไซเนอร์ กระเป๋าอเนกประสงค์ 6 ช่อง สายปรับกระชับข้อเท้า เนื้อผ้าทรงทนทาน ใส่ลุยได้ทุกสถานการณ์', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop', '["S (28-30)", "M (31-33)", "L (34-36)"]', '["Army Khaki", "Stealth Black"]', 25, true),

('a4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Vintage Denim Flight Jacket', 2290.00, 2990.00, 'แจ็คเก็ตยีนส์ฟอกทรงวินเทจ ตัดเย็บอย่างปราณีต ซับในลื่นใส่สบาย ดีไซน์ Unisex เข้ากับทุกชุด', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop', '["M", "L", "XL"]', '["Washed Blue", "Raw Indigo"]', 20, false),

('a5555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'AURA Glassmorphism Street Cap', 590.00, 890.00, 'หมวกเบสบอลปักโลโก้ AURA 3D ปรับขนาดด้านหลังได้ ป้องกันรังสียูวี ทรงสวยกระชับศรีษะ', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop', '["Free Size"]', '["Black", "Beige"]', 50, true),

('a6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Minimalist Boxy Vintage Graphic Tee', 890.00, 1290.00, 'เสื้อยืดลายกราฟิกแนวสตรีท สกรีนลายความละเอียดสูง ซักไม่ลอก ทรง Boxy Fit ทรงทันสมัย', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop', '["S", "M", "L", "XL"]', '["Washed Black", "Sand Cream"]', 35, false);
