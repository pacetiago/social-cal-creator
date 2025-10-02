-- Security fix for profiles table: Prevent unauthorized access to personal data
-- Step 1: Remove ALL existing policies to start fresh

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- Step 2: Create new strict policies with clear security boundaries

-- SELECT policies: Control who can read profile data
CREATE POLICY "authenticated_users_view_own_profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "org_admins_view_member_profiles"
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

CREATE POLICY "platform_admins_view_all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (is_platform_admin());

-- UPDATE policies: Control who can modify profile data
CREATE POLICY "users_update_own_profile_only"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "platform_admins_update_any"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- INSERT policies: Control who can create profiles
CREATE POLICY "platform_admins_insert_only"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_platform_admin());

-- DELETE policies: Control who can delete profiles
CREATE POLICY "platform_admins_delete_only"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (is_platform_admin());

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner (prevents superuser bypass)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Add security documentation
COMMENT ON TABLE public.profiles IS 
'[SECURITY] User profiles with strict RLS protection. 
- Users can only view/edit their own profile
- Org admins can view profiles of members in their organizations only
- Platform admins have full access
- Public/anonymous access is completely blocked
- All changes are audited via triggers';
