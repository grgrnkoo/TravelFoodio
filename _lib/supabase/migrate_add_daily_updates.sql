-- =============================================
-- Migration: Add daily_updates column to users table
-- Run this in Supabase SQL Editor
-- =============================================

-- Add daily_updates column next to updates_remaining
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS daily_updates INTEGER DEFAULT 3;

-- Update existing users to have 3 daily updates
UPDATE users 
SET daily_updates = 3 
WHERE daily_updates IS NULL;

