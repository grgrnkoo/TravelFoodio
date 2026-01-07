-- =============================================
-- Migration: Create consumed_meals table
-- Run this in Supabase SQL Editor
-- =============================================

-- Create consumed_meals table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_consumed_meals_user_id ON consumed_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_consumed_meals_consumed_date ON consumed_meals(consumed_date);
CREATE INDEX IF NOT EXISTS idx_consumed_meals_user_meal_date ON consumed_meals(user_id, meal_name, consumed_date);

-- Enable RLS
ALTER TABLE consumed_meals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access to consumed_meals"
    ON consumed_meals FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own consumed meals"
    ON consumed_meals FOR ALL
    USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

