-- =============================================
-- Migration: Add macro goal fields to user_preferences
-- Run this in Supabase SQL Editor
-- =============================================

-- Add daily carbs suggested column
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS daily_carbs_suggested INTEGER DEFAULT 0;

-- Add daily proteins suggested column
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS daily_proteins_suggested INTEGER DEFAULT 0;

-- Add daily fats suggested column
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS daily_fats_suggested INTEGER DEFAULT 0;

