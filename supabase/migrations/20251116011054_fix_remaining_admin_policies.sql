/*
  # Fix Remaining Admin Policies for Other Tables
  
  ## Problem
  Collaboration requests and booking requests admin policies also query creators table.
  
  ## Solution
  Use the is_current_user_admin() function for these policies as well.
*/

-- Fix collaboration_requests admin policy
DROP POLICY IF EXISTS "Admins can view all collaboration requests" ON collaboration_requests;

CREATE POLICY "Admins can view all collaboration requests"
  ON collaboration_requests FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

-- Fix booking_requests admin policy
DROP POLICY IF EXISTS "Admins can view all booking requests" ON booking_requests;

CREATE POLICY "Admins can view all booking requests"
  ON booking_requests FOR SELECT
  TO authenticated
  USING (is_current_user_admin());