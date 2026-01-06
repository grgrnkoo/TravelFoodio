-- =============================================
-- Migration Script: Add onboarding1_completed and onboarding2_completed
-- Run this to add the new onboarding step fields
-- =============================================

-- Step 1: Add new columns (if they don't exist)
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS onboarding1_completed BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS onboarding2_completed BOOLEAN DEFAULT FALSE;

-- Step 2: Migrate existing onboarding_completed data (if column exists)
-- If onboarding_completed is true, set onboarding2_completed as true
-- This assumes onboarding_completed means the user completed both steps
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'onboarding_completed'
    ) THEN
        UPDATE users 
        SET onboarding2_completed = onboarding_completed
        WHERE onboarding_completed = true;
        
        -- Drop the old column after migration
        ALTER TABLE users DROP COLUMN IF EXISTS onboarding_completed;
    END IF;
END $$;

-- Step 3: Verify migration (optional)
-- SELECT 
--     COUNT(*) FILTER (WHERE onboarding1_completed = true) as step1_completed,
--     COUNT(*) FILTER (WHERE onboarding2_completed = true) as step2_completed
-- FROM users;

