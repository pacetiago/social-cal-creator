-- Update Tiago's profile to admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'tiago@marsala.ag';

-- Add Tiago as OWNER to both demo organizations
INSERT INTO public.memberships (user_id, org_id, role, created_by, updated_by) VALUES
  ('b1f95a56-7a29-4fda-9589-89ff763299d3', '550e8400-e29b-41d4-a716-446655440001', 'OWNER', 'b1f95a56-7a29-4fda-9589-89ff763299d3', 'b1f95a56-7a29-4fda-9589-89ff763299d3'),
  ('b1f95a56-7a29-4fda-9589-89ff763299d3', '550e8400-e29b-41d4-a716-446655440002', 'OWNER', 'b1f95a56-7a29-4fda-9589-89ff763299d3', 'b1f95a56-7a29-4fda-9589-89ff763299d3')
ON CONFLICT (user_id, org_id) DO UPDATE SET 
  role = EXCLUDED.role,
  updated_by = EXCLUDED.updated_by,
  updated_at = now();