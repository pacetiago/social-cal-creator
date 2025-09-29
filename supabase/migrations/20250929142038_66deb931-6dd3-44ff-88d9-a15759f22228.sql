-- Delete org with cascade and audit safety
CREATE OR REPLACE FUNCTION public.delete_org_cascade(target_org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Permission: platform admin OR org OWNER/ADMIN
  IF NOT (
    is_platform_admin() OR
    (user_has_org_access(target_org_id) AND (user_org_role(target_org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role])))
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to delete organization';
  END IF;

  -- Delete dependents first to avoid FK violations
  -- Companies depend on clients
  DELETE FROM assets WHERE org_id = target_org_id;
  DELETE FROM approvals WHERE org_id = target_org_id;
  DELETE FROM posts WHERE org_id = target_org_id;
  DELETE FROM campaigns WHERE org_id = target_org_id;
  DELETE FROM channels WHERE org_id = target_org_id;
  DELETE FROM filters WHERE org_id = target_org_id;
  DELETE FROM companies WHERE client_id IN (SELECT id FROM clients WHERE org_id = target_org_id);
  DELETE FROM clients WHERE org_id = target_org_id;
  DELETE FROM memberships WHERE org_id = target_org_id;
  DELETE FROM share_tokens WHERE org_id = target_org_id;

  -- Keep audit logs but detach org reference to satisfy FK
  UPDATE audit_log SET org_id = NULL WHERE org_id = target_org_id;

  -- Finally delete the organization
  DELETE FROM orgs WHERE id = target_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_org_cascade(uuid) TO authenticated;