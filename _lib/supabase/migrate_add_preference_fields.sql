-- =============================================
-- Migration: Add weight, height, and other_info to user_preferences
-- Run this in Supabase SQL Editor
-- =============================================

-- Add weight column (TEXT to support values with units like "70kg")
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS weight TEXT DEFAULT '';

-- Add height column (TEXT to support values with units like "5'10"")
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS height TEXT DEFAULT '';

-- Add other_info column
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS other_info TEXT DEFAULT '';

