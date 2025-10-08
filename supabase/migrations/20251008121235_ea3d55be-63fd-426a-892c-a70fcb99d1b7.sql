-- Fix share_tokens RLS policy to prevent token theft
-- Drop the overly permissive policy that allows all org members to view tokens
DROP POLICY IF EXISTS "Users can view their org tokens" ON public.share_tokens;

-- Create a restrictive policy that only allows admins/owners to view tokens
CREATE POLICY "Only admins and owners can view share tokens"
ON public.share_tokens
FOR SELECT
TO authenticated
USING (
  user_has_org_access(org_id) AND 
  user_org_role(org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role])
);