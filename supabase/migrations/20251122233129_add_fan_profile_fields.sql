/*
  # Add Profile Fields to Fan Profiles

  1. Changes
    - Add `name` column to fan_profiles table for display name
    - Add `avatar_url` column to fan_profiles table for profile picture
    
  2. Details
    - Both fields are optional (nullable)
    - Name defaults to empty string
    - Avatar URL can be null if no avatar uploaded
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fan_profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE fan_profiles ADD COLUMN name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fan_profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE fan_profiles ADD COLUMN avatar_url text;
  END IF;
END $$;