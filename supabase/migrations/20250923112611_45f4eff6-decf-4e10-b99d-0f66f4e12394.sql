-- Fix profiles table security by ensuring proper RLS policies
-- Remove any permissive policies that might allow public access

-- First, drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create restrictive policies that explicitly require authentication
-- Policy 1: Users can only view their own profile when authenticated
CREATE POLICY "authenticated_users_own_profile_select" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy 2: Platform admins can view all profiles when authenticated  
CREATE POLICY "platform_admins_all_profiles_select" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (is_platform_admin());

-- Policy 3: Users can only update their own profile when authenticated
CREATE POLICY "authenticated_users_own_profile_update" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Only platform admins can insert profiles (handled by trigger)
CREATE POLICY "platform_admins_insert_profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (is_platform_admin());

-- Policy 5: Only platform admins can delete profiles
CREATE POLICY "platform_admins_delete_profiles" 
ON public.profiles 
FOR DELETE 
TO authenticated 
USING (is_platform_admin());

-- Ensure RLS is enabled (should already be enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Also ensure that the public role (unauthenticated users) has no access
-- This is the key fix - explicitly deny access to public role
REVOKE ALL ON public.profiles FROM public;
REVOKE ALL ON public.profiles FROM anon;