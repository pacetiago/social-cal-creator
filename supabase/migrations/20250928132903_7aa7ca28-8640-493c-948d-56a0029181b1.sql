-- Allow org admins/owners to view profiles of users in their orgs
CREATE POLICY "Org admins/owners can view org profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.memberships m_admin
    JOIN public.memberships m_target
      ON m_admin.org_id = m_target.org_id
    WHERE m_admin.user_id = auth.uid()
      AND m_admin.role IN ('OWNER','ADMIN')
      AND m_target.user_id = profiles.id
  )
);

-- Ensure authenticated users can execute the share token generator
GRANT EXECUTE ON FUNCTION public.generate_share_token(uuid) TO authenticated;