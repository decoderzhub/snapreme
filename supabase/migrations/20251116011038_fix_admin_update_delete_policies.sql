/*
  # Fix Admin UPDATE and DELETE Policies
  
  ## Problem
  Admin UPDATE and DELETE policies also have potential for infinite recursion
  when they query the creators table to check is_admin status.
  
  ## Solution
  We'll keep these policies but understand they may have recursion issues.
  The better approach is to use a PostgreSQL function that can bypass RLS.
  
  For now, let's create a helper function that checks admin status without RLS.
*/

-- Create a function to check if current user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM creators
    WHERE user_id = auth.uid()
    AND is_admin = true
  );
END;
$$;

-- Drop existing admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can update any creator" ON creators;
DROP POLICY IF EXISTS "Admins can delete any creator" ON creators;

-- Recreate admin policies using the function
CREATE POLICY "Admins can update any creator"
  ON creators FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete any creator"
  ON creators FOR DELETE
  TO authenticated
  USING (is_current_user_admin());