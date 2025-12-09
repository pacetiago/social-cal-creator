-- Update role from platform_admin to platform_owner
UPDATE public.user_roles 
SET role = 'platform_owner' 
WHERE user_id = 'b1f95a56-7a29-4fda-9589-89ff763299d3';

-- Log the change in audit
INSERT INTO public.audit_log (actor_id, action, target_table, target_id, diff)
VALUES (
  'b1f95a56-7a29-4fda-9589-89ff763299d3',
  'ROLE_PROMOTED',
  'user_roles',
  'b1f95a56-7a29-4fda-9589-89ff763299d3',
  jsonb_build_object('old_role', 'platform_admin', 'new_role', 'platform_owner')
);