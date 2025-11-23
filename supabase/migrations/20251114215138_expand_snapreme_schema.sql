/*
  # Expand peak.boo Schema for Full Platform Features

  ## Summary
  This migration expands the peak.boo platform to support shoppable creator profiles,
  creator applications, brand briefs, and enhanced creator data.

  ## New Tables
  
  ### creator_offers
  - Stores shoppable offers that creators can sell to brands
  - Each offer includes pricing, delivery time, and description
  - Links to creators table via creator_id foreign key
  
  ### creator_applications
  - Stores creator signup applications from the /apply flow
  - Captures all onboarding data before profile approval
  - Links to auth.users via user_id when user is authenticated
  
  ### booking_requests
  - Stores brand collaboration requests for specific creator offers
  - Tracks communication between brands and creators
  - Links to both creators and offers tables

  ## Modified Tables
  
  ### creators
  - Added display_name for public-facing name
  - Added short_bio for card previews
  - Added about for full profile description
  - Added starting_rate_label for display (e.g. "$149 / collab")
  - Added content_types array for content categories
  - Added top_regions array for audience geography
  - Added avg_story_views for engagement metrics
  - Added is_featured flag for homepage highlighting
  - Added is_verified flag for platform verification

  ## Security
  - RLS enabled on all new tables
  - Policies restrict data access to authenticated users
  - Public read access for creator profiles and offers
  - Write access restricted to creators for their own data
*/

-- Add new columns to creators table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE creators ADD COLUMN display_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'short_bio'
  ) THEN
    ALTER TABLE creators ADD COLUMN short_bio text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'about'
  ) THEN
    ALTER TABLE creators ADD COLUMN about text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'starting_rate_label'
  ) THEN
    ALTER TABLE creators ADD COLUMN starting_rate_label text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'content_types'
  ) THEN
    ALTER TABLE creators ADD COLUMN content_types text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'top_regions'
  ) THEN
    ALTER TABLE creators ADD COLUMN top_regions text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'avg_story_views'
  ) THEN
    ALTER TABLE creators ADD COLUMN avg_story_views integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE creators ADD COLUMN is_featured boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE creators ADD COLUMN is_verified boolean DEFAULT false;
  END IF;
END $$;

-- Create creator_offers table
CREATE TABLE IF NOT EXISTS creator_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price_label text NOT NULL,
  delivery_window text NOT NULL,
  best_for text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create creator_applications table
CREATE TABLE IF NOT EXISTS creator_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  snapchat_handle text NOT NULL,
  email text NOT NULL,
  region text NOT NULL,
  niches text[] DEFAULT '{}',
  snapcode_url text,
  followers integer DEFAULT 0,
  avg_story_views integer DEFAULT 0,
  short_bio text,
  content_types text,
  open_to_collabs boolean DEFAULT true,
  open_to_swaps boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Create booking_requests table
CREATE TABLE IF NOT EXISTS booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
  offer_id uuid REFERENCES creator_offers(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  brand_project text NOT NULL,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE creator_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_offers
CREATE POLICY "Anyone can view active offers"
  ON creator_offers
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Creators can insert their own offers"
  ON creator_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = creator_offers.creator_id
      AND creators.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can update their own offers"
  ON creator_offers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = creator_offers.creator_id
      AND creators.user_id = auth.uid()
    )
  );

-- RLS Policies for creator_applications
CREATE POLICY "Users can view their own applications"
  ON creator_applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert applications"
  ON creator_applications
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for booking_requests
CREATE POLICY "Creators can view booking requests for their offers"
  ON booking_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = booking_requests.creator_id
      AND creators.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert booking requests"
  ON booking_requests
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_creator_offers_creator_id ON creator_offers(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_offers_active ON creator_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_creator_applications_status ON creator_applications(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_creator_id ON booking_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);