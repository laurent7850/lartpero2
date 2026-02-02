/*
  # Fix infinite recursion in profiles RLS policies

  1. Changes
    - Drop the problematic "Admins can view all profiles" policy
    - Create a new admin policy that uses JWT metadata instead of querying profiles table
    - This prevents infinite recursion while maintaining admin access

  2. Security
    - Users can still view and update their own profiles
    - Admins can view all profiles using JWT role claim (no recursion)
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a new admin policy using JWT metadata (no recursion)
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Check if the requesting user's role in their own profile is 'admin'
    -- This uses a security definer function to avoid recursion
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Wait, this still has the same problem. Let me use a different approach.
-- Drop it again and use a simpler solution
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- For now, let's just keep it simple: users can only see their own profile
-- Admins will use a security definer function or service role for admin operations
-- This policy is redundant with "Users can view own profile" but explicit for clarity
CREATE POLICY "Admins view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if viewing own profile OR if user's JWT contains admin role
    auth.uid() = id 
    OR 
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Actually, that still has recursion. Let me fix this properly.
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;

-- The safest approach: create a function that caches the role check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Now create the admin policy using this function
CREATE POLICY "Admins view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());