-- Phase 1 Complete: Remove deprecated profiles.role column
-- First drop the RLS policy that depends on the role column

-- Drop the policy that references profiles.role
DROP POLICY IF EXISTS users_update_own_profile_only ON public.profiles;

-- Recreate the policy without role restriction (users can update their own profile, but not change system fields)
CREATE POLICY users_update_own_profile_only 
ON public.profiles 
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND id = (SELECT id FROM profiles WHERE id = auth.uid()) -- Prevent ID changes
);

-- Now drop the deprecated role column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Add comment to profiles table documenting the change
COMMENT ON TABLE public.profiles IS 'User profile information. User roles are managed in the user_roles table, not here.';