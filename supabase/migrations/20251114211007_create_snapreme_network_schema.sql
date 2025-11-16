/*
  # Snapreme Network Database Schema

  ## Overview
  Creates the complete database schema for the Snapreme creator network platform,
  including creator profiles, campaigns, collaboration requests, and analytics.

  ## New Tables
  
  ### 1. creators
  Stores detailed creator profile information including social metrics and pricing
  - `id` (uuid, primary key) - Unique creator identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `name` (text) - Creator display name
  - `handle` (text, unique) - Username handle (e.g., @username)
  - `avatar_url` (text) - Profile picture URL
  - `cover_url` (text) - Cover/banner image URL
  - `tier` (text) - Creator tier: Rising, Pro, or Elite
  - `bio` (text) - Creator biography
  - `region` (text) - Primary geographic region
  - `followers` (integer) - Follower count
  - `engagement_rate` (decimal) - Engagement percentage
  - `starting_rate` (integer) - Starting price in cents
  - `snapcode_url` (text) - Snapchat QR code image URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. creator_niches
  Many-to-many relationship between creators and their content niches
  - `id` (uuid, primary key)
  - `creator_id` (uuid, foreign key)
  - `niche` (text) - Content category (Beauty, Fitness, etc.)

  ### 3. campaigns
  Brand campaign opportunities for creators
  - `id` (uuid, primary key)
  - `brand_name` (text) - Brand company name
  - `title` (text) - Campaign title
  - `budget_range` (text) - Budget range string (e.g., "$1,000-$3,000")
  - `deadline` (date) - Application deadline
  - `description` (text) - Campaign details
  - `logo_initials` (text) - Brand logo initials for display
  - `is_active` (boolean) - Campaign availability status
  - `created_at` (timestamptz)

  ### 4. campaign_niches
  Target niches for each campaign
  - `id` (uuid, primary key)
  - `campaign_id` (uuid, foreign key)
  - `niche` (text)

  ### 5. campaign_regions
  Target regions for each campaign
  - `id` (uuid, primary key)
  - `campaign_id` (uuid, foreign key)
  - `region` (text)

  ### 6. collaboration_requests
  Tracks collaboration inquiries between users and creators
  - `id` (uuid, primary key)
  - `creator_id` (uuid, foreign key) - Target creator
  - `requester_id` (uuid, foreign key) - Requesting user
  - `campaign_id` (uuid, foreign key, nullable) - Related campaign if applicable
  - `status` (text) - Request status: pending, accepted, rejected
  - `message` (text) - Request message
  - `created_at` (timestamptz)

  ### 7. profile_views
  Analytics tracking for creator profile views
  - `id` (uuid, primary key)
  - `creator_id` (uuid, foreign key)
  - `viewer_id` (uuid, foreign key, nullable) - Viewing user (null for anonymous)
  - `viewed_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Creators can read all profiles, update only their own
  - Campaigns are publicly readable
  - Collaboration requests visible only to involved parties
  - Profile views tracked with proper access controls

  ## Indexes
  - Optimized for common queries: handle lookups, tier filtering, niche searches
*/

-- Create creators table
CREATE TABLE IF NOT EXISTS creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name text NOT NULL,
  handle text UNIQUE NOT NULL,
  avatar_url text,
  cover_url text,
  tier text NOT NULL DEFAULT 'Rising' CHECK (tier IN ('Rising', 'Pro', 'Elite')),
  bio text,
  region text,
  followers integer DEFAULT 0,
  engagement_rate decimal(5,2) DEFAULT 0,
  starting_rate integer DEFAULT 0,
  snapcode_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create creator_niches junction table
CREATE TABLE IF NOT EXISTS creator_niches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
  niche text NOT NULL,
  UNIQUE(creator_id, niche)
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL,
  title text NOT NULL,
  budget_range text NOT NULL,
  deadline date NOT NULL,
  description text NOT NULL,
  logo_initials text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create campaign_niches junction table
CREATE TABLE IF NOT EXISTS campaign_niches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  niche text NOT NULL,
  UNIQUE(campaign_id, niche)
);

-- Create campaign_regions junction table
CREATE TABLE IF NOT EXISTS campaign_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  region text NOT NULL,
  UNIQUE(campaign_id, region)
);

-- Create collaboration_requests table
CREATE TABLE IF NOT EXISTS collaboration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
  requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message text,
  created_at timestamptz DEFAULT now()
);

-- Create profile_views table
CREATE TABLE IF NOT EXISTS profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
  viewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_creators_handle ON creators(handle);
CREATE INDEX IF NOT EXISTS idx_creators_tier ON creators(tier);
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_niches_creator_id ON creator_niches(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_niches_niche ON creator_niches(niche);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_deadline ON campaigns(deadline);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_creator_id ON collaboration_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_requester_id ON collaboration_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_creator_id ON profile_views(creator_id);

-- Enable Row Level Security
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creators table
CREATE POLICY "Creators are viewable by authenticated users"
  ON creators FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own creator profile"
  ON creators FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creator profile"
  ON creators FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own creator profile"
  ON creators FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for creator_niches table
CREATE POLICY "Creator niches are viewable by authenticated users"
  ON creator_niches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators can manage their own niches"
  ON creator_niches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = creator_niches.creator_id
      AND creators.user_id = auth.uid()
    )
  );

-- RLS Policies for campaigns table
CREATE POLICY "Active campaigns are viewable by authenticated users"
  ON campaigns FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for campaign_niches table
CREATE POLICY "Campaign niches are viewable by authenticated users"
  ON campaign_niches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_niches.campaign_id
      AND campaigns.is_active = true
    )
  );

-- RLS Policies for campaign_regions table
CREATE POLICY "Campaign regions are viewable by authenticated users"
  ON campaign_regions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_regions.campaign_id
      AND campaigns.is_active = true
    )
  );

-- RLS Policies for collaboration_requests table
CREATE POLICY "Users can view their own collaboration requests"
  ON collaboration_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = requester_id OR
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = collaboration_requests.creator_id
      AND creators.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create collaboration requests"
  ON collaboration_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Creators can update requests to their profile"
  ON collaboration_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = collaboration_requests.creator_id
      AND creators.user_id = auth.uid()
    )
  );

-- RLS Policies for profile_views table
CREATE POLICY "Profile views can be created by authenticated users"
  ON profile_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = viewer_id OR viewer_id IS NULL);

CREATE POLICY "Creators can view their own profile analytics"
  ON profile_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = profile_views.creator_id
      AND creators.user_id = auth.uid()
    )
  );