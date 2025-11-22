/*
  # Add Username Field to Fan Profiles

  1. Changes
    - Add `username` column to fan_profiles table for unique username
    - Add unique constraint to ensure no duplicate usernames
    - Add index for performance
    
  2. Details
    - Username is required (NOT NULL)
    - Username must be unique across all fan profiles
    - Username does not include the @ symbol in database (added in UI)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fan_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE fan_profiles ADD COLUMN username text;
  END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fan_profiles_username_key'
  ) THEN
    ALTER TABLE fan_profiles ADD CONSTRAINT fan_profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_fan_profiles_username ON fan_profiles(username);