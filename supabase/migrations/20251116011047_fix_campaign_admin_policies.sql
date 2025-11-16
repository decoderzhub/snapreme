/*
  # Fix Campaign Admin Policies to Prevent Recursion
  
  ## Problem
  Campaign admin policies query the creators table which can cause recursion issues.
  
  ## Solution
  Use the is_current_user_admin() function we created to check admin status
  without causing recursion.
*/

-- Drop existing admin campaign policies
DROP POLICY IF EXISTS "Admins can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can delete campaigns" ON campaigns;

-- Recreate using the function
CREATE POLICY "Admins can view all campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (is_current_user_admin());