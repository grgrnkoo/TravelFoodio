-- =============================================
-- Migration Script: Move Preferences to Separate Table
-- Run this AFTER creating the user_preferences table
-- =============================================

-- Step 1: Migrate existing preference data from users to user_preferences
-- This creates a preferences record for each user that has any preference data
INSERT INTO user_preferences (
    user_id,
    age,
    location,
    daily_calories_suggested,
    goals,
    dietary_restrictions,
    medical_recommendations
)
SELECT 
    id as user_id,
    age,
    location,
    daily_calories_suggested,
    goals,
    dietary_restrictions,
    '[]'::jsonb as medical_recommendations
FROM users
WHERE 
    age IS NOT NULL 
    OR location IS NOT NULL 
    OR daily_calories_suggested IS NOT NULL 
    OR goals IS NOT NULL 
    OR dietary_restrictions IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Step 2: Verify migration (optional - check counts)
-- SELECT 
--     (SELECT COUNT(*) FROM users) as total_users,
--     (SELECT COUNT(*) FROM user_preferences) as users_with_preferences;

-- Step 3: After verifying, you can drop the old columns from users table
-- WARNING: Only run this after verifying the migration was successful!
-- ALTER TABLE users 
--     DROP COLUMN IF EXISTS age,
--     DROP COLUMN IF EXISTS location,
--     DROP COLUMN IF EXISTS daily_calories_suggested,
--     DROP COLUMN IF EXISTS goals,
--     DROP COLUMN IF EXISTS dietary_restrictions;

