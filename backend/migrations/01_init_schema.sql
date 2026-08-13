-- 01_init_schema.sql — MealMate Supabase PostgreSQL Schema Migration

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(128),
  phone VARCHAR(32),
  role VARCHAR(32) DEFAULT 'user',
  currency VARCHAR(10) DEFAULT 'LAK',
  avatar TEXT,
  qr_code_url TEXT,
  google_id VARCHAR(128),
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  owner_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  avatar TEXT,
  members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meals (
  id VARCHAR(64) PRIMARY KEY,
  group_id VARCHAR(64) REFERENCES groups(id) ON DELETE SET NULL,
  title VARCHAR(128) NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  paid_by VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  split_type VARCHAR(32) DEFAULT 'EQUAL',
  split_details JSONB DEFAULT '{}'::jsonb,
  participants JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debts (
  id VARCHAR(64) PRIMARY KEY,
  meal_id VARCHAR(64) REFERENCES meals(id) ON DELETE CASCADE,
  group_id VARCHAR(64) REFERENCES groups(id) ON DELETE SET NULL,
  from_user VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  to_user VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  status VARCHAR(32) DEFAULT 'PENDING',
  proof_image TEXT,
  reject_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(128) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(32) DEFAULT 'GENERAL',
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friendships Table with Unique Pair Normalized Constraint
CREATE TABLE IF NOT EXISTS friendships (
  id VARCHAR(64) PRIMARY KEY,
  user_id_1 VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(32) DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined'
  requested_by VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_user_order CHECK (user_id_1 < user_id_2),
  CONSTRAINT unique_friendship_pair UNIQUE (user_id_1, user_id_2)
);

-- Indexes for frequent query optimization
CREATE INDEX IF NOT EXISTS idx_debts_group_id ON debts(group_id);
CREATE INDEX IF NOT EXISTS idx_debts_from_user ON debts(from_user);
CREATE INDEX IF NOT EXISTS idx_debts_to_user ON debts(to_user);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_meals_group_id ON meals(group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(user_id_1, user_id_2);
