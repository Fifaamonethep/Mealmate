-- 02_add_security_indexes.sql — MealMate Security & Performance Indexing Migration

-- Meals Table Indexes
CREATE INDEX IF NOT EXISTS idx_meals_group_id ON meals(group_id);
CREATE INDEX IF NOT EXISTS idx_meals_paid_by ON meals(paid_by);
CREATE INDEX IF NOT EXISTS idx_meals_created_at ON meals(created_at DESC);

-- Debts Table Indexes
CREATE INDEX IF NOT EXISTS idx_debts_group_id ON debts(group_id);
CREATE INDEX IF NOT EXISTS idx_debts_from_user ON debts(from_user);
CREATE INDEX IF NOT EXISTS idx_debts_to_user ON debts(to_user);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_composite_group_status ON debts(group_id, status);

-- Friendships Table Indexes
CREATE INDEX IF NOT EXISTS idx_friendships_user_id_1 ON friendships(user_id_1);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id_2 ON friendships(user_id_2);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_users_status ON friendships(user_id_1, user_id_2, status);

-- EXPLAIN ANALYZE Verification Queries:
-- 
-- 1. Verify group history query uses idx_meals_group_id index:
-- EXPLAIN ANALYZE SELECT * FROM meals WHERE group_id = 'g-demo-1' ORDER BY created_at DESC;
-- -> Expected Plan: Index Scan using idx_meals_group_id on meals (cost=0.15..8.17 rows=1)
--
-- 2. Verify debt list query by group and status uses idx_debts_composite_group_status:
-- EXPLAIN ANALYZE SELECT * FROM debts WHERE group_id = 'g-demo-1' AND status = 'PENDING';
-- -> Expected Plan: Index Scan using idx_debts_composite_group_status on debts (cost=0.15..8.17 rows=1)
--
-- 3. Verify user debt search uses idx_debts_from_user / idx_debts_to_user:
-- EXPLAIN ANALYZE SELECT * FROM debts WHERE from_user = 'u-userA' OR to_user = 'u-userA';
-- -> Expected Plan: Bitmap Or / Index Scan using idx_debts_from_user, idx_debts_to_user
