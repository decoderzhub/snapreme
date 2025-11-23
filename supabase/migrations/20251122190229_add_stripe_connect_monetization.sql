/*
  # Add Stripe Connect Monetization to peak.boo

  1. Schema Changes
    - Add Stripe Connect fields to `creators` table
      - `stripe_connect_id` (text) - Stripe Connect account ID
      - `is_stripe_connected` (boolean) - Connection status
      - Subscription pricing fields already exist
    
    - Create `fan_profiles` table for non-creator users
      - `id` (uuid, primary key, references auth.users)
      - `stripe_customer_id` (text) - Stripe customer ID for fans
      - `email` (text) - User email
      - Timestamps
    
    - Create `subscriptions` table for fan-creator relationships
      - `id` (uuid, primary key)
      - `fan_id` (uuid) - References auth.users
      - `creator_id` (uuid) - References creators
      - `stripe_customer_id` (text) - Stripe customer
      - `stripe_subscription_id` (text) - Stripe subscription
      - `is_active` (boolean) - Active status
      - Timestamps

  2. Security
    - Enable RLS on fan_profiles table
    - Enable RLS on subscriptions table
    - Fans can view their own subscriptions
    - Creators can view subscriptions to them
    - Only authenticated users can create subscriptions
    
  3. Indexes
    - Add index on (fan_id, creator_id) for fast lookups
*/

-- Add Stripe Connect fields to creators table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'stripe_connect_id'
  ) THEN
    ALTER TABLE creators ADD COLUMN stripe_connect_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'is_stripe_connected'
  ) THEN
    ALTER TABLE creators ADD COLUMN is_stripe_connected boolean DEFAULT false;
  END IF;
END $$;

-- Create fan_profiles table for non-creator users
CREATE TABLE IF NOT EXISTS fan_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on fan_profiles
ALTER TABLE fan_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own fan profile
CREATE POLICY "Users can view own fan profile"
  ON fan_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own fan profile
CREATE POLICY "Users can update own fan profile"
  ON fan_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own fan profile
CREATE POLICY "Users can insert own fan profile"
  ON fan_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_fan_creator
  ON subscriptions (fan_id, creator_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Fans can view their own subscriptions
CREATE POLICY "Fans can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = fan_id);

-- Creators can view subscriptions to them
CREATE POLICY "Creators can view their subscribers"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

-- System can insert subscriptions (via service role)
CREATE POLICY "Service role can create subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System can update subscriptions (via service role)
CREATE POLICY "Service role can update subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
