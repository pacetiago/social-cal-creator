-- ==========================================
-- SOLUÇÃO DEFINITIVA: Recriação de Políticas RLS para Storage
-- Usa abordagem correta para policies do storage schema
-- ==========================================

-- IMPORTANTE: Políticas do storage.objects devem ser gerenciadas através de comandos específicos

-- 1) DELETAR políticas antigas do bucket post-attachments
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects'
          AND policyname LIKE '%post_attachment%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- 2) CRIAR POLÍTICA SELECT SIMPLIFICADA
-- Formato esperado: orgId/postId/filename
CREATE POLICY "select_post_attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'post-attachments'
  AND EXISTS (
    SELECT 1
    FROM public.posts p
    JOIN public.memberships m ON m.org_id = p.org_id
    WHERE p.id = (split_part(name, '/', 2))::uuid
      AND p.org_id = (split_part(name, '/', 1))::uuid
      AND m.user_id = auth.uid()
  )
);

-- 3) CRIAR POLÍTICA INSERT SIMPLIFICADA
CREATE POLICY "insert_post_attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-attachments'
  AND EXISTS (
    SELECT 1
    FROM public.posts p
    JOIN public.memberships m ON m.org_id = p.org_id
    WHERE p.id = (split_part(name, '/', 2))::uuid
      AND p.org_id = (split_part(name, '/', 1))::uuid
      AND m.user_id = auth.uid()
      AND m.role IN ('OWNER', 'ADMIN', 'EDITOR')
  )
);

-- 4) CRIAR POLÍTICA DELETE SIMPLIFICADA  
CREATE POLICY "delete_post_attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-attachments'
  AND EXISTS (
    SELECT 1
    FROM public.posts p
    JOIN public.memberships m ON m.org_id = p.org_id
    WHERE p.id = (split_part(name, '/', 2))::uuid
      AND p.org_id = (split_part(name, '/', 1))::uuid
      AND m.user_id = auth.uid()
      AND m.role IN ('OWNER', 'ADMIN')
  )
);