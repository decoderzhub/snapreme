/*
  # Add User Account Types

  1. Changes
    - Add `account_type` column to fan_profiles table to track user type (fan, creator, both)
    - Add default value of 'fan' for new users
    - Add `payment_method_setup` boolean to track if fan has added payment
  
  2. Notes
    - Fans browse and subscribe to creators
    - Creators publish content and manage monetization
    - Users can be both (have creator profile and also subscribe to others)
*/

-- Add account type column to fan_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fan_profiles' AND column_name = 'account_type'
  ) THEN
    ALTER TABLE fan_profiles ADD COLUMN account_type text DEFAULT 'fan' CHECK (account_type IN ('fan', 'creator', 'both'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fan_profiles' AND column_name = 'payment_method_setup'
  ) THEN
    ALTER TABLE fan_profiles ADD COLUMN payment_method_setup boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fan_profiles' AND column_name = 'onboarding_complete'
  ) THEN
    ALTER TABLE fan_profiles ADD COLUMN onboarding_complete boolean DEFAULT false;
  END IF;
END $$;

-- Add helpful comments
COMMENT ON COLUMN fan_profiles.account_type IS 'User account type: fan (only subscribes), creator (only creates), or both';
COMMENT ON COLUMN fan_profiles.payment_method_setup IS 'Whether fan has completed payment method setup';
COMMENT ON COLUMN fan_profiles.onboarding_complete IS 'Whether fan has completed onboarding flow';
