-- ========================================================
-- MealMate - Supabase Database Schema
-- Run this script in the Supabase SQL Editor
-- ========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  currency TEXT DEFAULT 'LAK',
  avatar TEXT,
  qr_code_url TEXT,
  google_id TEXT,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  avatar TEXT,
  members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEALS TABLE
CREATE TABLE IF NOT EXISTS public.meals (
  id TEXT PRIMARY KEY,
  group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  paid_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  split_type TEXT DEFAULT 'EQUAL',
  split_details JSONB DEFAULT '{}'::jsonb,
  participants JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DEBTS TABLE
CREATE TABLE IF NOT EXISTS public.debts (
  id TEXT PRIMARY KEY,
  meal_id TEXT REFERENCES public.meals(id) ON DELETE CASCADE,
  group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
  from_user TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  to_user TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  proof_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'SYSTEM',
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- INITIAL SEED DATA
-- ========================================================

INSERT INTO public.users (id, username, password_hash, name, email, phone, role, currency, avatar, qr_code_url, is_locked)
VALUES 
('u-admin', 'admin', '123', 'ຜູ້ດູແລລະບົບ (Admin)', 'sokeskesannouanlaty@gmail.com', '2098667856', 'admin', 'LAK', 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAOQR-ADMIN-2098667856', false),
('u-alice', 'alice', '123', 'Alice Vongxay', 'alice@gmail.com', '2055667788', 'user', 'LAK', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAOQR-ALICE-55667788', false),
('u-bob', 'bob', '123', 'Bob Soukthavy', 'bob@gmail.com', '2099887766', 'user', 'LAK', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAOQR-BOB-99887766', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.groups (id, name, description, owner_id, avatar, members)
VALUES
('g-1', 'ກຸ່ມທ່ຽວ ວັງວຽງ 🏖️', 'ທ່ອງທ່ຽວພັກຜ່ອນກັບກຸ່ມໝູ່ເພື່ອນ ວັງວຽງ 2026', 'u-alice', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop', '["u-admin", "u-alice", "u-bob"]'::jsonb),
('g-2', 'ຫ້ອງ 302 🏢', 'ຄ່າໃຊ້ຈ່າຍສ່ວນລວມແລະອາຫານຫ້ອງ 302', 'u-bob', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&auto=format&fit=crop', '["u-alice", "u-bob"]'::jsonb),
('g-3', 'Team Cty TechCorp 💻', 'ກິນເຂົ້າສາຍ ກາເຟ ແລະ ງານລ້ຽງບໍລິສັດ', 'u-admin', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop', '["u-admin", "u-alice", "u-bob"]'::jsonb),
('g-4', 'ກຸ່ມຕີບານ & ກິລາ ⚽', 'ຄ່າເດີນຕີບານ ແລະ ນ້ຳດື່ມທຸກໆທ້າຍອາທິດ', 'u-admin', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&auto=format&fit=crop', '["u-admin", "u-alice", "u-bob"]'::jsonb),
('g-5', 'ກຸ່ມກິນດື່ມທ້າຍອາທິດ 🍲', 'ສັງສັນກິນດື່ມໝູກະທະ ແລະ ຊາບູ ທຸກວັນສຸກ', 'u-admin', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop', '["u-admin", "u-alice", "u-bob"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
