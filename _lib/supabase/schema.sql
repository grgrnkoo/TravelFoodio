-- =============================================
-- TravelFoodio Supabase Schema Migration
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- Core user profile data (lightweight)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    image TEXT DEFAULT '',
    name TEXT,
    updates_remaining INTEGER DEFAULT 0,
    daily_updates INTEGER DEFAULT 3,
    subscription_type TEXT DEFAULT 'free',
    onboarding1_completed BOOLEAN DEFAULT FALSE,
    onboarding2_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================
-- USER PREFERENCES TABLE
-- Menu generation preferences (separated from core user data)
-- =============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER DEFAULT 0,
    date_of_birth DATE,
    location TEXT DEFAULT '',
    daily_calories_suggested INTEGER DEFAULT 0,
    daily_carbs_suggested INTEGER DEFAULT 0,
    daily_proteins_suggested INTEGER DEFAULT 0,
    daily_fats_suggested INTEGER DEFAULT 0,
    goals TEXT DEFAULT '',
    dietary_restrictions TEXT DEFAULT '',
    medical_recommendations JSONB DEFAULT '[]'::jsonb,
    weight TEXT DEFAULT '',
    height TEXT DEFAULT '',
    other_info TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- =============================================
-- USER FAVORITE MEALS TABLE
-- Meals the user has liked
-- =============================================
CREATE TABLE IF NOT EXISTS user_favorite_meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, meal_name)
);

CREATE INDEX IF NOT EXISTS idx_user_favorite_meals_user_id ON user_favorite_meals(user_id);

-- =============================================
-- USER DISLIKED MEALS TABLE
-- Meals the user has disliked
-- =============================================
CREATE TABLE IF NOT EXISTS user_disliked_meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, meal_name)
);

CREATE INDEX IF NOT EXISTS idx_user_disliked_meals_user_id ON user_disliked_meals(user_id);

-- =============================================
-- USER INGREDIENTS TABLE
-- Ingredient preferences with ratings
-- =============================================
CREATE TABLE IF NOT EXISTS user_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    rating INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, ingredient_name)
);

CREATE INDEX IF NOT EXISTS idx_user_ingredients_user_id ON user_ingredients(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ingredients_rating ON user_ingredients(rating);

-- =============================================
-- USER CUISINES TABLE
-- Cuisine preferences with ratings
-- =============================================
CREATE TABLE IF NOT EXISTS user_cuisines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cuisine_name TEXT NOT NULL,
    rating INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, cuisine_name)
);

CREATE INDEX IF NOT EXISTS idx_user_cuisines_user_id ON user_cuisines(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cuisines_rating ON user_cuisines(rating);

-- =============================================
-- MENUS TABLE
-- Generated daily menus for users
-- =============================================
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_menus_user_id ON menus(user_id);
CREATE INDEX IF NOT EXISTS idx_menus_created_at ON menus(created_at);

-- =============================================
-- MENU MEALS TABLE
-- Individual meals within a menu
-- =============================================
CREATE TABLE IF NOT EXISTS menu_meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories INTEGER,
    protein INTEGER,
    fats INTEGER,
    carbs INTEGER,
    weight INTEGER,
    cuisine TEXT,
    ingredients JSONB DEFAULT '[]'::jsonb,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_meals_menu_id ON menu_meals(menu_id);

-- =============================================
-- MEALS TABLE
-- Global meal catalog
-- =============================================
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    cuisine TEXT,
    ingredients JSONB DEFAULT '[]'::jsonb,
    calories INTEGER,
    protein INTEGER,
    fats INTEGER,
    carbs INTEGER,
    weight INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meals_name ON meals(name);

-- =============================================
-- CONSUMED MEALS TABLE
-- Track meals consumed by users for calorie tracking
-- =============================================
CREATE TABLE IF NOT EXISTS consumed_meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_name TEXT NOT NULL,
    calories INTEGER,
    protein INTEGER,
    fats INTEGER,
    carbs INTEGER,
    weight INTEGER,
    cuisine TEXT,
    ingredients JSONB DEFAULT '[]'::jsonb,
    consumed_at TIMESTAMPTZ DEFAULT NOW(),
    consumed_date DATE DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_consumed_meals_user_id ON consumed_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_consumed_meals_consumed_date ON consumed_meals(consumed_date);
CREATE INDEX IF NOT EXISTS idx_consumed_meals_user_meal_date ON consumed_meals(user_id, meal_name, consumed_date);

-- =============================================
-- FEEDBACK TABLE
-- User feedback submissions
-- =============================================
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author TEXT DEFAULT 'Not logged in',
    feedback TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically updates updated_at column
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ingredients_updated_at
    BEFORE UPDATE ON user_ingredients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cuisines_updated_at
    BEFORE UPDATE ON user_cuisines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_disliked_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumed_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- Service role bypasses RLS automatically
-- These policies are for anon/authenticated access
-- =============================================

-- Users: Allow service role full access (for server-side operations)
-- For client-side, users can only see their own data
CREATE POLICY "Service role has full access to users"
    ON users FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid()::text = clerk_user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid()::text = clerk_user_id OR auth.role() = 'service_role');

-- User preferences
CREATE POLICY "Service role has full access to user_preferences"
    ON user_preferences FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own preferences"
    ON user_preferences FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

CREATE POLICY "Users can manage own preferences"
    ON user_preferences FOR ALL
    USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

-- User favorite meals
CREATE POLICY "Service role has full access to user_favorite_meals"
    ON user_favorite_meals FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own favorite meals"
    ON user_favorite_meals FOR ALL
    USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

-- User disliked meals
CREATE POLICY "Service role has full access to user_disliked_meals"
    ON user_disliked_meals FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own disliked meals"
    ON user_disliked_meals FOR ALL
    USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

-- User ingredients
CREATE POLICY "Service role has full access to user_ingredients"
    ON user_ingredients FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own ingredients"
    ON user_ingredients FOR ALL
    USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

-- User cuisines
CREATE POLICY "Service role has full access to user_cuisines"
    ON user_cuisines FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own cuisines"
    ON user_cuisines FOR ALL
    USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

-- Menus
CREATE POLICY "Service role has full access to menus"
    ON menus FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own menus"
    ON menus FOR ALL
    USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

-- Menu meals
CREATE POLICY "Service role has full access to menu_meals"
    ON menu_meals FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own menu meals"
    ON menu_meals FOR SELECT
    USING (menu_id IN (SELECT id FROM menus WHERE user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text)) OR auth.role() = 'service_role');

-- Consumed meals
CREATE POLICY "Service role has full access to consumed_meals"
    ON consumed_meals FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own consumed meals"
    ON consumed_meals FOR ALL
    USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

-- Meals (global catalog - anyone can read, only service role can write)
CREATE POLICY "Anyone can read meals"
    ON meals FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage meals"
    ON meals FOR ALL
    USING (auth.role() = 'service_role');

-- Feedback (anyone can insert, only service role can read all)
CREATE POLICY "Anyone can submit feedback"
    ON feedback FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can read all feedback"
    ON feedback FOR SELECT
    USING (auth.role() = 'service_role');

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get user by clerk_user_id
CREATE OR REPLACE FUNCTION get_user_by_clerk_id(p_clerk_user_id TEXT)
RETURNS SETOF users
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM users WHERE clerk_user_id = p_clerk_user_id;
$$;

-- Function to get user with all preferences (for menu generation)
CREATE OR REPLACE FUNCTION get_user_full_profile(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'user', (SELECT row_to_json(u) FROM users u WHERE u.id = p_user_id),
        'preferences', (SELECT row_to_json(p) FROM user_preferences p WHERE p.user_id = p_user_id),
        'favoriteMeals', (SELECT COALESCE(json_agg(json_build_object('name', meal_name, 'dateLastUpdated', created_at)), '[]'::json) FROM user_favorite_meals WHERE user_id = p_user_id),
        'dislikedMeals', (SELECT COALESCE(json_agg(json_build_object('name', meal_name, 'dateLastUpdated', created_at)), '[]'::json) FROM user_disliked_meals WHERE user_id = p_user_id),
        'ingredients', (SELECT COALESCE(json_agg(json_build_object('name', ingredient_name, 'rating', rating, 'dateLastUpdated', updated_at)), '[]'::json) FROM user_ingredients WHERE user_id = p_user_id),
        'cuisines', (SELECT COALESCE(json_agg(json_build_object('name', cuisine_name, 'rating', rating, 'dateLastUpdated', updated_at)), '[]'::json) FROM user_cuisines WHERE user_id = p_user_id)
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Function to upsert ingredient rating
CREATE OR REPLACE FUNCTION upsert_ingredient_rating(
    p_user_id UUID,
    p_ingredient_name TEXT,
    p_rating_change INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_ingredients (user_id, ingredient_name, rating)
    VALUES (p_user_id, p_ingredient_name, p_rating_change)
    ON CONFLICT (user_id, ingredient_name)
    DO UPDATE SET rating = user_ingredients.rating + p_rating_change, updated_at = NOW();
END;
$$;

-- Function to upsert cuisine rating
CREATE OR REPLACE FUNCTION upsert_cuisine_rating(
    p_user_id UUID,
    p_cuisine_name TEXT,
    p_rating_change INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_cuisines (user_id, cuisine_name, rating)
    VALUES (p_user_id, p_cuisine_name, p_rating_change)
    ON CONFLICT (user_id, cuisine_name)
    DO UPDATE SET rating = user_cuisines.rating + p_rating_change, updated_at = NOW();
END;
$$;

