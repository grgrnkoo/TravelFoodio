-- =============================================
-- Migration: Create photo_analyses table
-- Run this in Supabase SQL Editor
-- =============================================

-- Create photo_analyses table to track daily photo analysis counts
CREATE TABLE IF NOT EXISTS photo_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    analysis_date DATE DEFAULT CURRENT_DATE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_photo_analyses_user_id ON photo_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_analyses_analysis_date ON photo_analyses(analysis_date);
CREATE INDEX IF NOT EXISTS idx_photo_analyses_user_date ON photo_analyses(user_id, analysis_date);

-- Enable RLS
ALTER TABLE photo_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access to photo_analyses"
    ON photo_analyses FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own photo analyses"
    ON photo_analyses FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

CREATE POLICY "Users can insert own photo analyses"
    ON photo_analyses FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) OR auth.role() = 'service_role');

