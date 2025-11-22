/*
  # Add onboarding_complete column to creators table

  1. Changes
    - Add `onboarding_complete` boolean column to `creators` table
    - Default value is `false` for new creators
    - Existing creators will have `null` which will be treated as incomplete

  2. Notes
    - This column tracks whether a creator has completed their profile setup
    - Used by the onboarding flow and protected routes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'onboarding_complete'
  ) THEN
    ALTER TABLE creators ADD COLUMN onboarding_complete boolean DEFAULT false;
  END IF;
END $$;