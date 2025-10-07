-- Fase 3: Criar bucket de storage para anexos de posts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-attachments',
  'post-attachments',
  false,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'video/mp4', 'video/quicktime']
);

-- RLS policies para o bucket post-attachments
CREATE POLICY "Users can upload attachments to their org posts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'post-attachments' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM posts p
    WHERE p.org_id::text = (storage.foldername(name))[1]
    AND user_has_org_access(p.org_id)
    AND user_org_role(p.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role, 'EDITOR'::user_role])
  )
);

CREATE POLICY "Users can view attachments from their org posts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'post-attachments' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM posts p
    WHERE p.org_id::text = (storage.foldername(name))[1]
    AND user_has_org_access(p.org_id)
  )
);

CREATE POLICY "Users can delete attachments from their org posts"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'post-attachments' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM posts p
    WHERE p.org_id::text = (storage.foldername(name))[1]
    AND user_has_org_access(p.org_id)
    AND user_org_role(p.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role, 'EDITOR'::user_role])
  )
);

-- Adicionar coluna attachments na tabela posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- Fase 4: Expandir hierarquia de usuários da plataforma
-- Adicionar novos valores ao enum platform_role
ALTER TYPE platform_role ADD VALUE IF NOT EXISTS 'platform_owner';
ALTER TYPE platform_role ADD VALUE IF NOT EXISTS 'platform_viewer';

-- Atualizar função is_platform_admin para incluir platform_owner
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN public.has_platform_role(auth.uid(), 'platform_admin') 
      OR public.has_platform_role(auth.uid(), 'platform_owner');
END;
$$;

-- Criar nova função is_platform_owner para operações críticas
CREATE OR REPLACE FUNCTION public.is_platform_owner()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN public.has_platform_role(auth.uid(), 'platform_owner');
END;
$$;