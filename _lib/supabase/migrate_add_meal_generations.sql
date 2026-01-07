-- =============================================
-- Migration: Create meal_generations table
-- Run this in Supabase SQL Editor
-- =============================================

-- Create meal_generations table to track daily meal generation counts
CREATE TABLE IF NOT EXISTS meal_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generation_date DATE DEFAULT CURRENT_DATE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meal_generations_user_id ON meal_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_generations_generation_date ON meal_generations(generation_date);
CREATE INDEX IF NOT EXISTS idx_meal_generations_user_date ON meal_generations(user_id, generation_date);

-- Enable RLS
ALTER TABLE meal_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access to meal_generations"
    ON meal_generations FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own meal generations"
    ON meal_generations FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

CREATE POLICY "Users can insert own meal generations"
    ON meal_generations FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

