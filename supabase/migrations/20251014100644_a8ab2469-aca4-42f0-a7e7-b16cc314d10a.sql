-- Storage policies for post attachments in private bucket
-- Allow org members to read and editors/admins to write, based on first folder = postId

-- SELECT policy: org members can view attachments for posts they have access to
CREATE POLICY "Post attachments readable by org members"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'post-attachments'
  AND EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id::text = (storage.foldername(name))[1]
      AND public.user_has_org_access(p.org_id)
  )
);

-- INSERT policy: editors/admins/owners can upload attachments
CREATE POLICY "Post attachments insert by org editors"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'post-attachments'
  AND EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id::text = (storage.foldername(name))[1]
      AND public.user_has_org_access(p.org_id)
      AND (public.user_org_role(p.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role, 'EDITOR'::user_role]))
  )
);

-- UPDATE policy: editors/admins/owners can update attachments
CREATE POLICY "Post attachments update by org editors"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'post-attachments'
  AND EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id::text = (storage.foldername(name))[1]
      AND public.user_has_org_access(p.org_id)
      AND (public.user_org_role(p.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role, 'EDITOR'::user_role]))
  )
)
WITH CHECK (
  bucket_id = 'post-attachments'
  AND EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id::text = (storage.foldername(name))[1]
      AND public.user_has_org_access(p.org_id)
      AND (public.user_org_role(p.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role, 'EDITOR'::user_role]))
  )
);

-- DELETE policy: admins/owners can delete attachments
CREATE POLICY "Post attachments delete by org admins"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'post-attachments'
  AND EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id::text = (storage.foldername(name))[1]
      AND public.user_has_org_access(p.org_id)
      AND (public.user_org_role(p.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role]))
  )
);
