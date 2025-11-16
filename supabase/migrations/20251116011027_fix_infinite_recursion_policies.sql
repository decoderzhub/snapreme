/*
  # Fix Infinite Recursion in Admin Policies

  ## Problem
  Admin policies that check is_admin by querying the creators table create infinite recursion
  because checking the policy requires reading from creators, which requires checking the policy.

  ## Solution
  Remove the conflicting admin SELECT policy since "Creators are viewable by authenticated users"
  already allows all authenticated users to read creator data (including is_admin field).
  
  Keep the admin UPDATE and DELETE policies for now but they won't cause recursion issues
  since they only apply when trying to modify data, not read it.

  ## Note
  A better long-term solution would be to store is_admin in auth.users metadata,
  but this quick fix resolves the immediate issue.
*/

-- Drop the conflicting admin SELECT policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all creators" ON creators;

-- The existing "Creators are viewable by authenticated users" policy (with qual: true) 
-- already allows all authenticated users to SELECT from creators, which is sufficient
-- for the admin check to work.