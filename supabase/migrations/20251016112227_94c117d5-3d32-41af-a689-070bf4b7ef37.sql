-- Storage policies for post-attachments to fix 401 on read/upload
-- Drop existing policies if any
DROP POLICY IF EXISTS "Org members can read post attachments" ON storage.objects;
DROP POLICY IF EXISTS "Editors can upload post attachments" ON storage.objects;

-- Assumes files are stored under path: <post_id>/<filename>
-- Grant SELECT to org members for objects belonging to posts in their org
CREATE POLICY "Org members can read post attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'post-attachments'
  AND EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = (split_part(name, '/', 1))::uuid
      AND public.user_has_org_access(p.org_id)
  )
);

-- Grant INSERT to editors/admins/owners uploading into paths for posts in their orgs
CREATE POLICY "Editors can upload post attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'post-attachments'
  AND EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = (split_part(name, '/', 1))::uuid
      AND public.user_has_org_access(p.org_id)
      AND (public.user_org_role(p.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role, 'EDITOR'::user_role]))
  )
);
