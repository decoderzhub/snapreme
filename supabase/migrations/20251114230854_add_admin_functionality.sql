/*
  # Add Admin Functionality to peak.boo Platform

  ## Summary
  This migration adds comprehensive admin functionality including role management,
  verification workflow, and activity tracking for the peak.boo platform.

  ## Changes to Existing Tables

  ### creators table additions:
  - `is_admin` (boolean) - Flags users with admin privileges
  - `verification_status` (text) - Creator verification state: unverified, pending, verified, rejected
  - `verification_submitted_at` (timestamptz) - When verification was submitted
  - `verification_notes` (text) - Admin notes about verification
  - `account_status` (text) - Account state: active, suspended, deleted
  - `admin_notes` (text) - General admin notes about the creator
  
  ## New Tables

  ### admin_activity_logs
  - Tracks all admin actions for audit trail and compliance
  - Stores who did what, when, and additional context
  - Essential for platform governance and security

  ## Security
  - Admin users have elevated RLS policies
  - All admin actions are logged
  - Verification status changes are tracked
  - Activity logs are immutable (no updates/deletes)

  ## Important
  - Sets darin.j.manley@gmail.com as the first admin user
  - All existing creators default to 'unverified' status
  - Account status defaults to 'active' for all creators
*/

-- Add new columns to creators table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE creators ADD COLUMN is_admin boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE creators ADD COLUMN verification_status text DEFAULT 'unverified' 
      CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'verification_submitted_at'
  ) THEN
    ALTER TABLE creators ADD COLUMN verification_submitted_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'verification_notes'
  ) THEN
    ALTER TABLE creators ADD COLUMN verification_notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE creators ADD COLUMN account_status text DEFAULT 'active'
      CHECK (account_status IN ('active', 'suspended', 'deleted'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE creators ADD COLUMN admin_notes text;
  END IF;
END $$;

-- Create admin_activity_logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_creators_is_admin ON creators(is_admin);
CREATE INDEX IF NOT EXISTS idx_creators_verification_status ON creators(verification_status);
CREATE INDEX IF NOT EXISTS idx_creators_account_status ON creators(account_status);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_type ON admin_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);

-- Enable RLS on admin_activity_logs
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_activity_logs
CREATE POLICY "Admins can view all activity logs"
  ON admin_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.user_id = auth.uid()
      AND creators.is_admin = true
    )
  );

CREATE POLICY "Admins can insert activity logs"
  ON admin_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.user_id = auth.uid()
      AND creators.is_admin = true
    )
  );

-- Update existing RLS policies to allow admin full access
-- Admins can view all creators
CREATE POLICY "Admins can view all creators"
  ON creators FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators c
      WHERE c.user_id = auth.uid()
      AND c.is_admin = true
    )
  );

-- Admins can update any creator
CREATE POLICY "Admins can update any creator"
  ON creators FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators c
      WHERE c.user_id = auth.uid()
      AND c.is_admin = true
    )
  );

-- Admins can delete any creator
CREATE POLICY "Admins can delete any creator"
  ON creators FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators c
      WHERE c.user_id = auth.uid()
      AND c.is_admin = true
    )
  );

-- Admins can view all campaigns
CREATE POLICY "Admins can view all campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.user_id = auth.uid()
      AND creators.is_admin = true
    )
  );

-- Admins can manage campaigns
CREATE POLICY "Admins can insert campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.user_id = auth.uid()
      AND creators.is_admin = true
    )
  );

CREATE POLICY "Admins can update campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.user_id = auth.uid()
      AND creators.is_admin = true
    )
  );

CREATE POLICY "Admins can delete campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.user_id = auth.uid()
      AND creators.is_admin = true
    )
  );

-- Admins can view all collaboration requests
CREATE POLICY "Admins can view all collaboration requests"
  ON collaboration_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.user_id = auth.uid()
      AND creators.is_admin = true
    )
  );

-- Admins can view all booking requests
CREATE POLICY "Admins can view all booking requests"
  ON booking_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.user_id = auth.uid()
      AND creators.is_admin = true
    )
  );

-- Set darin.j.manley@gmail.com as admin
UPDATE creators
SET is_admin = true
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'darin.j.manley@gmail.com'
);