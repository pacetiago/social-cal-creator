-- Security fix for profiles table: Prevent unauthorized access to personal data

-- First, drop existing policies that might be too permissive
DROP POLICY IF EXISTS "Org admins/owners can view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Platform admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Platform admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Platform admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Platform admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile (non-role fields)" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;

-- Recreate stricter policies

-- 1. SELECT policies (reading data)
-- Users can ONLY view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Org admins/owners can view profiles of users in their organizations
CREATE POLICY "Org admins can view member profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM memberships m_admin
      JOIN memberships m_target ON m_admin.org_id = m_target.org_id
      WHERE m_admin.user_id = auth.uid()
        AND m_admin.role IN ('OWNER', 'ADMIN')
        AND m_target.user_id = profiles.id
    )
  );

-- Platform admins can view all profiles
CREATE POLICY "Platform admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (is_platform_admin());

-- 2. UPDATE policies (modifying data)
-- Users can update their own profile but CANNOT change role
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Platform admins can update any profile
CREATE POLICY "Platform admins can update profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- 3. INSERT policies (creating new profiles)
-- Only platform admins can manually insert profiles
CREATE POLICY "Platform admins can insert profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_platform_admin());

-- 4. DELETE policies (removing profiles)
-- Only platform admins can delete profiles
CREATE POLICY "Platform admins can delete profiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (is_platform_admin());

-- Ensure RLS is enabled (should already be, but let's be explicit)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add comment documenting the security model
COMMENT ON TABLE public.profiles IS 
'User profiles with RLS protection. Users can only view/edit their own profile. Org admins can view profiles of members in their organizations. Platform admins have full access.';

-- Create an audit log entry for profile access (optional but recommended)
CREATE OR REPLACE FUNCTION log_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log when someone views another user's profile (admins viewing others)
  IF TG_OP = 'SELECT' AND auth.uid() != NEW.id THEN
    INSERT INTO audit_log (
      actor_id,
      action,
      target_table,
      target_id,
      metadata
    ) VALUES (
      auth.uid(),
      'VIEW_PROFILE',
      'profiles',
      NEW.id,
      jsonb_build_object('viewed_user', NEW.email)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;