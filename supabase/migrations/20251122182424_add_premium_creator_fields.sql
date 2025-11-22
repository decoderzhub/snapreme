/*
  # Add Premium Creator Platform Fields

  1. New Columns
    - `is_priority` (boolean) - Flag for featured/priority creators in explore feed
    - `profile_views` (integer) - Total profile views count
    - `subscribers` (integer) - Current subscriber/fan count
    - `subscription_price` (numeric) - Monthly subscription price in dollars
    - `posts` (integer) - Total premium content posts
    - `category` (text) - Primary creator category (Lifestyle, Fitness, Gaming, etc.)

  2. Changes
    - Add default values for new fields
    - Add indexes for performance on commonly queried fields

  3. Security
    - Maintains existing RLS policies
    - New fields accessible via existing policies
*/

-- Add new premium platform fields to creators table
DO $$
BEGIN
  -- Add is_priority column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'is_priority'
  ) THEN
    ALTER TABLE creators ADD COLUMN is_priority boolean DEFAULT false;
  END IF;

  -- Add profile_views column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'profile_views'
  ) THEN
    ALTER TABLE creators ADD COLUMN profile_views integer DEFAULT 0;
  END IF;

  -- Add subscribers column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'subscribers'
  ) THEN
    ALTER TABLE creators ADD COLUMN subscribers integer DEFAULT 0;
  END IF;

  -- Add subscription_price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'subscription_price'
  ) THEN
    ALTER TABLE creators ADD COLUMN subscription_price numeric(10,2) DEFAULT 5.00;
  END IF;

  -- Add posts column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'posts'
  ) THEN
    ALTER TABLE creators ADD COLUMN posts integer DEFAULT 0;
  END IF;

  -- Add category column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'category'
  ) THEN
    ALTER TABLE creators ADD COLUMN category text DEFAULT 'Creator';
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_creators_is_priority ON creators(is_priority) WHERE is_priority = true;
CREATE INDEX IF NOT EXISTS idx_creators_subscribers ON creators(subscribers DESC);
CREATE INDEX IF NOT EXISTS idx_creators_profile_views ON creators(profile_views DESC);
CREATE INDEX IF NOT EXISTS idx_creators_category ON creators(category);

-- Update a few sample creators with premium data (optional, for testing)
UPDATE creators
SET
  subscription_price = 9.99,
  category = 'Lifestyle',
  posts = FLOOR(RANDOM() * 50 + 10)::integer,
  subscribers = FLOOR(RANDOM() * 500 + 50)::integer,
  profile_views = FLOOR(RANDOM() * 2000 + 200)::integer
WHERE id IN (SELECT id FROM creators LIMIT 3);