-- ==========================================
-- Migration: Clean up and simplify RLS policies for post-attachments bucket
-- Purpose: Fix 401 errors by aligning policies with orgId/postId/filename path pattern
-- ==========================================

-- 1) Remove all existing redundant policies
DROP POLICY IF EXISTS "Org members can read post attachments" ON storage.objects;
DROP POLICY IF EXISTS "Editors can upload post attachments" ON storage.objects;
DROP POLICY IF EXISTS "Post attachments readable by org members" ON storage.objects;
DROP POLICY IF EXISTS "Post attachments insert by org editors" ON storage.objects;
DROP POLICY IF EXISTS "Post attachments update by org editors" ON storage.objects;
DROP POLICY IF EXISTS "Post attachments delete by org admins" ON storage.objects;
DROP POLICY IF EXISTS "Users can view attachments from their org posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload attachments to their org posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete attachments from their org posts" ON storage.objects;

-- 2) Create simplified SELECT policy (retrocompatible with old and new path patterns)
-- Allows reading when:
-- - New pattern: name = '<org_id>/<post_id>/<filename>' (uses split_part(..., 1) = org_id, 2 = post_id)
-- - Old pattern: name = '<post_id>/<filename>' (uses split_part(..., 1) = post_id for backwards compatibility)
CREATE POLICY "post_attachments_select"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'post-attachments'
  AND (
    -- New pattern orgId/postId/filename
    EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = (split_part(name, '/', 2))::uuid
        AND public.user_has_org_access(p.org_id)
    )
    OR
    -- Old pattern postId/filename (retrocompatibility)
    EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = (split_part(name, '/', 1))::uuid
        AND public.user_has_org_access(p.org_id)
    )
  )
);

-- 3) Create simplified INSERT policy (only new pattern with orgId prefix)
-- Restricted to OWNER/ADMIN/EDITOR in the org of the post
CREATE POLICY "post_attachments_insert"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'post-attachments'
  AND EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.org_id = (split_part(name, '/', 1))::uuid
      AND p.id = (split_part(name, '/', 2))::uuid
      AND public.user_has_org_access(p.org_id)
      AND (public.user_org_role(p.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role, 'EDITOR'::user_role]))
  )
);

-- 4) Create DELETE policy for admins/owners
CREATE POLICY "post_attachments_delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'post-attachments'
  AND (
    -- New pattern orgId/postId/filename
    EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.org_id = (split_part(name, '/', 1))::uuid
        AND p.id = (split_part(name, '/', 2))::uuid
        AND public.user_has_org_access(p.org_id)
        AND (public.user_org_role(p.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role]))
    )
    OR
    -- Old pattern postId/filename (retrocompatibility)
    EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = (split_part(name, '/', 1))::uuid
        AND public.user_has_org_access(p.org_id)
        AND (public.user_org_role(p.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role]))
    )
  )
);