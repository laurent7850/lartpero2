/*
  # Simplify profiles RLS to fix recursion

  1. Changes
    - Drop all existing problematic policies
    - Create simple, non-recursive policies
    - Users can view and update their own profile only

  2. Security
    - Each user can only access their own profile data
    - No recursion issues
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS is_admin();

-- Create simple, working policies without recursion
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);