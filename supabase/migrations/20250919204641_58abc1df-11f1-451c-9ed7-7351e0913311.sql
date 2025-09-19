-- CRITICAL SECURITY FIX: Remove public access to calendar posts
-- Business content and client data must be protected

-- Drop the public read policy that exposes sensitive business content
DROP POLICY IF EXISTS "Anyone can view calendar posts" ON public.calendar_posts;

-- Create secure policy - only authenticated users with proper access can view posts
CREATE POLICY "Authenticated users can view posts of assigned clients" ON public.calendar_posts
  FOR SELECT USING (auth.uid() IS NOT NULL AND public.can_access_client(client_id));

-- Remove the public display name columns as they're no longer needed
-- since posts are no longer publicly accessible
ALTER TABLE public.calendar_posts 
DROP COLUMN IF EXISTS public_client_name,
DROP COLUMN IF EXISTS public_company_name;