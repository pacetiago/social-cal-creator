-- Enable org UPDATE/DELETE for owners and admins
-- Ensure RLS is already enabled (it is) and add policies for updates and deletes

-- Update policy
CREATE POLICY "Org admins/owners can update orgs"
ON public.orgs
FOR UPDATE
USING (
  user_has_org_access(id) AND (user_org_role(id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role]))
)
WITH CHECK (
  user_has_org_access(id) AND (user_org_role(id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role]))
);

-- Delete policy (optional but useful for cleanup)
CREATE POLICY "Org admins/owners can delete orgs"
ON public.orgs
FOR DELETE
USING (
  user_has_org_access(id) AND (user_org_role(id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role]))
);
