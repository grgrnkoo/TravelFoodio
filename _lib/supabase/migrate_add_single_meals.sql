-- =============================================
-- Migration: Create single_meals table
-- Run this in Supabase SQL Editor
-- =============================================

-- Create single_meals table to store individually generated meals
CREATE TABLE IF NOT EXISTS single_meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories INTEGER,
    protein INTEGER,
    fats INTEGER,
    carbs INTEGER,
    weight INTEGER,
    cuisine TEXT,
    ingredients JSONB DEFAULT '[]'::jsonb,
    source TEXT NOT NULL CHECK (source IN ('photo', 'prompt')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    generation_date DATE DEFAULT CURRENT_DATE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_single_meals_user_id ON single_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_single_meals_generation_date ON single_meals(generation_date);
CREATE INDEX IF NOT EXISTS idx_single_meals_source ON single_meals(source);
CREATE INDEX IF NOT EXISTS idx_single_meals_user_date_source ON single_meals(user_id, generation_date, source);

-- Enable RLS
ALTER TABLE single_meals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access to single_meals"
    ON single_meals FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own single meals"
    ON single_meals FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

CREATE POLICY "Users can insert own single meals"
    ON single_meals FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

