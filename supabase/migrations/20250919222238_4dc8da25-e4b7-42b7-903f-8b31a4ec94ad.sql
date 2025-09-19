-- Fix RLS issue for organization creation
-- Update the policy to allow organization owners/admins to create new organizations
DROP POLICY IF EXISTS "Users can view their org" ON public.orgs;

CREATE POLICY "Users can view their org" 
ON public.orgs 
FOR SELECT 
USING (user_has_org_access(id) OR is_platform_admin());

-- Add policy to allow platform admins and organization owners to create new organizations
CREATE POLICY "Platform admins and org owners can create orgs" 
ON public.orgs 
FOR INSERT 
WITH CHECK (is_platform_admin() OR auth.uid() IN (
  SELECT user_id FROM public.memberships 
  WHERE role IN ('OWNER', 'ADMIN')
));