/*
  # Content Monetization System - Posts, Packages, PPM, Gifts, Wallets

  1. New Tables
    - `posts` - Creator content (videos/images) with lock/unlock capability
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references creators)
      - `created_at` (timestamptz)
      - `media_url` (text) - URL to video/image
      - `thumbnail_url` (text) - Preview thumbnail
      - `caption` (text) - Post description
      - `like_count` (int) - Number of likes
      - `comment_count` (int) - Number of comments
      - `view_count` (int) - Number of views
      - `is_locked` (boolean) - Whether post requires unlock
      - `unlock_price_cents` (int) - Individual post price if locked
      - `post_type` (text) - 'video' or 'image'

    - `content_packages` - Bundle deals creators can offer
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references creators)
      - `title` (text) - Package name
      - `description` (text) - Full description
      - `includes_summary` (text) - What's included
      - `cover_image_url` (text) - Package thumbnail
      - `price_cents` (int) - Bundle price
      - `items_count` (int) - Number of items in bundle
      - `created_at` (timestamptz)

    - `post_unlocks` - Track individual post purchases
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `fan_id` (uuid, references auth.users)
      - `unlocked_at` (timestamptz)

    - `package_purchases` - Track bundle purchases
      - `id` (uuid, primary key)
      - `package_id` (uuid, references content_packages)
      - `fan_id` (uuid, references auth.users)
      - `creator_id` (uuid, references creators)
      - `purchased_at` (timestamptz)

    - `ppm_threads` - One-to-one messaging between creator and fan
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references creators)
      - `fan_id` (uuid, references auth.users)
      - `last_message_at` (timestamptz)

    - `ppm_messages` - Pay-per-message content
      - `id` (uuid, primary key)
      - `thread_id` (uuid, references ppm_threads)
      - `sender_id` (uuid, references auth.users)
      - `is_creator` (boolean)
      - `text` (text)
      - `gift_emoji` (text) - Optional gift emoji
      - `tip_cents` (int) - Optional tip amount
      - `is_priority` (boolean) - Priority message flag
      - `created_at` (timestamptz)

    - `gifts` - Emoji gift catalog
      - `id` (uuid, primary key)
      - `name` (text)
      - `emoji` (text)
      - `coin_cost` (int)

    - `wallets` - User coin balances
      - `user_id` (uuid, primary key, references auth.users)
      - `coin_balance` (int)

  2. Security
    - Enable RLS on all tables
    - Posts: public read, creator can modify their own
    - Packages: public read, creator can modify their own
    - Unlocks/Purchases: fan sees their own, creator sees who unlocked their content
    - PPM: only thread participants can read/write
    - Gifts: public read
    - Wallets: user can only see/update their own

  3. Performance
    - Add indexes on foreign keys and frequently queried columns
*/

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  media_url text,
  thumbnail_url text,
  caption text,
  like_count int DEFAULT 0,
  comment_count int DEFAULT 0,
  view_count int DEFAULT 0,
  is_locked boolean DEFAULT false,
  unlock_price_cents int DEFAULT 0,
  post_type text DEFAULT 'video' CHECK (post_type IN ('video', 'image'))
);

CREATE INDEX IF NOT EXISTS idx_posts_creator_id ON posts(creator_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Content packages table
CREATE TABLE IF NOT EXISTS content_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  includes_summary text,
  cover_image_url text,
  price_cents int NOT NULL,
  items_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_packages_creator_id ON content_packages(creator_id);

-- Post unlocks table
CREATE TABLE IF NOT EXISTS post_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  fan_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(post_id, fan_id)
);

CREATE INDEX IF NOT EXISTS idx_post_unlocks_fan_id ON post_unlocks(fan_id);
CREATE INDEX IF NOT EXISTS idx_post_unlocks_post_id ON post_unlocks(post_id);

-- Package purchases table
CREATE TABLE IF NOT EXISTS package_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES content_packages(id) ON DELETE CASCADE,
  fan_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  purchased_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_package_purchases_fan_id ON package_purchases(fan_id);
CREATE INDEX IF NOT EXISTS idx_package_purchases_creator_id ON package_purchases(creator_id);

-- PPM threads table
CREATE TABLE IF NOT EXISTS ppm_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  fan_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  UNIQUE(creator_id, fan_id)
);

CREATE INDEX IF NOT EXISTS idx_ppm_threads_creator_id ON ppm_threads(creator_id);
CREATE INDEX IF NOT EXISTS idx_ppm_threads_fan_id ON ppm_threads(fan_id);

-- PPM messages table
CREATE TABLE IF NOT EXISTS ppm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES ppm_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_creator boolean DEFAULT false,
  text text,
  gift_emoji text,
  tip_cents int DEFAULT 0,
  is_priority boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ppm_messages_thread_id ON ppm_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_ppm_messages_created_at ON ppm_messages(created_at DESC);

-- Enable realtime for messages
ALTER TABLE ppm_messages REPLICA IDENTITY FULL;

-- Gifts catalog table
CREATE TABLE IF NOT EXISTS gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emoji text NOT NULL,
  coin_cost int NOT NULL
);

-- Seed sample gifts
INSERT INTO gifts (name, emoji, coin_cost) VALUES
('Diamond', '💎', 50),
('Fire', '🔥', 25),
('Flowers', '💐', 15),
('Present', '🎁', 20),
('Crown', '👑', 60),
('Star', '⭐', 10)
ON CONFLICT DO NOTHING;

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_balance int DEFAULT 0
);

-- RLS Policies

-- Enable RLS on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppm_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Public can view posts"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Creator can insert their posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = posts.creator_id
      AND creators.user_id = auth.uid()
    )
  );

CREATE POLICY "Creator can update their posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = posts.creator_id
      AND creators.user_id = auth.uid()
    )
  );

CREATE POLICY "Creator can delete their posts"
  ON posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = posts.creator_id
      AND creators.user_id = auth.uid()
    )
  );

-- Content packages policies
CREATE POLICY "Public can view packages"
  ON content_packages FOR SELECT
  USING (true);

CREATE POLICY "Creator can insert their packages"
  ON content_packages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = content_packages.creator_id
      AND creators.user_id = auth.uid()
    )
  );

CREATE POLICY "Creator can update their packages"
  ON content_packages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = content_packages.creator_id
      AND creators.user_id = auth.uid()
    )
  );

CREATE POLICY "Creator can delete their packages"
  ON content_packages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = content_packages.creator_id
      AND creators.user_id = auth.uid()
    )
  );

-- Post unlocks policies
CREATE POLICY "Fan can view their post unlocks"
  ON post_unlocks FOR SELECT
  TO authenticated
  USING (auth.uid() = fan_id);

CREATE POLICY "Creator can view unlocks of their posts"
  ON post_unlocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      JOIN creators ON creators.id = posts.creator_id
      WHERE posts.id = post_unlocks.post_id
      AND creators.user_id = auth.uid()
    )
  );

CREATE POLICY "Fan can insert post unlock"
  ON post_unlocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = fan_id);

-- Package purchases policies
CREATE POLICY "Fan can view their package purchases"
  ON package_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = fan_id);

CREATE POLICY "Creator can view purchases of their packages"
  ON package_purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = package_purchases.creator_id
      AND creators.user_id = auth.uid()
    )
  );

CREATE POLICY "Fan can insert package purchase"
  ON package_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = fan_id);

-- PPM threads policies
CREATE POLICY "Participants can view their thread"
  ON ppm_threads FOR SELECT
  TO authenticated
  USING (
    auth.uid() = fan_id OR
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = ppm_threads.creator_id
      AND creators.user_id = auth.uid()
    )
  );

CREATE POLICY "Fan can create thread"
  ON ppm_threads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = fan_id);

CREATE POLICY "Participants can update thread"
  ON ppm_threads FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = fan_id OR
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = ppm_threads.creator_id
      AND creators.user_id = auth.uid()
    )
  );

-- PPM messages policies
CREATE POLICY "Participants can view messages"
  ON ppm_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ppm_threads
      WHERE ppm_threads.id = ppm_messages.thread_id
      AND (
        ppm_threads.fan_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM creators
          WHERE creators.id = ppm_threads.creator_id
          AND creators.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "User can send messages"
  ON ppm_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Gifts policies (public read)
CREATE POLICY "Public can view gifts"
  ON gifts FOR SELECT
  USING (true);

-- Wallets policies
CREATE POLICY "User can view their wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "User can insert their wallet"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update their wallet"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
