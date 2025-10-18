-- ==========================================
-- POLÍTICAS DE RLS DO BUCKET post-attachments
-- Extraídas do banco de dados em 2025-10-18
-- ==========================================

-- ============================================
-- POLÍTICA 1: SELECT (Leitura de Anexos)
-- ============================================
-- Nome: post_attachments_select
-- Comando: SELECT
-- Descrição: Permite leitura quando usuário tem acesso à organização do post
-- Padrões suportados:
--   - NOVO: orgId/postId/filename (linha 14)
--   - ANTIGO: postId/filename (linha 17, retrocompatibilidade)

CREATE POLICY "post_attachments_select"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'post-attachments'::text
  AND (
    -- NOVO PADRÃO: orgId/postId/filename
    -- split_part(name, '/', 2) extrai o postId da posição 2
    EXISTS (
      SELECT 1
      FROM posts p
      WHERE p.id = (split_part(objects.name, '/'::text, 2))::uuid
        AND user_has_org_access(p.org_id)
    )
    OR
    -- ANTIGO PADRÃO: postId/filename (retrocompatibilidade)
    -- split_part(name, '/', 1) extrai o postId da posição 1
    EXISTS (
      SELECT 1
      FROM posts p
      WHERE p.id = (split_part(objects.name, '/'::text, 1))::uuid
        AND user_has_org_access(p.org_id)
    )
  )
);

-- ============================================
-- POLÍTICA 2: INSERT (Upload de Anexos)
-- ============================================
-- Nome: post_attachments_insert
-- Comando: INSERT
-- Descrição: Permite upload APENAS no novo padrão orgId/postId/filename
-- Restrições: Apenas OWNER, ADMIN ou EDITOR da organização

CREATE POLICY "post_attachments_insert"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'post-attachments'::text
  AND EXISTS (
    SELECT 1
    FROM posts p
    WHERE p.org_id = (split_part(objects.name, '/'::text, 1))::uuid  -- Extrai orgId
      AND p.id = (split_part(objects.name, '/'::text, 2))::uuid      -- Extrai postId
      AND user_has_org_access(p.org_id)
      AND (user_org_role(p.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role, 'EDITOR'::user_role]))
  )
);

-- ============================================
-- POLÍTICA 3: DELETE (Remoção de Anexos)
-- ============================================
-- Nome: post_attachments_delete
-- Comando: DELETE
-- Descrição: Permite remoção por OWNER ou ADMIN
-- Padrões suportados:
--   - NOVO: orgId/postId/filename
--   - ANTIGO: postId/filename (retrocompatibilidade)

CREATE POLICY "post_attachments_delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'post-attachments'::text
  AND (
    -- NOVO PADRÃO: orgId/postId/filename
    EXISTS (
      SELECT 1
      FROM posts p
      WHERE p.org_id = (split_part(objects.name, '/'::text, 1))::uuid
        AND p.id = (split_part(objects.name, '/'::text, 2))::uuid
        AND user_has_org_access(p.org_id)
        AND (user_org_role(p.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role]))
    )
    OR
    -- ANTIGO PADRÃO: postId/filename (retrocompatibilidade)
    EXISTS (
      SELECT 1
      FROM posts p
      WHERE p.id = (split_part(objects.name, '/'::text, 1))::uuid
        AND user_has_org_access(p.org_id)
        AND (user_org_role(p.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role]))
    )
  )
);

-- ============================================
-- FORMATO ESPERADO DOS CAMINHOS (file_path)
-- ============================================

-- ✅ NOVO PADRÃO (obrigatório para INSERT):
-- orgId/postId/filename
-- Exemplo: 550e8400-e29b-41d4-a716-446655440001/7c9e6679-7425-40de-944b-e07fc1f90ae7/1729260123456-abc123.jpg

-- ✅ ANTIGO PADRÃO (aceito apenas para SELECT e DELETE, retrocompatibilidade):
-- postId/filename
-- Exemplo: 7c9e6679-7425-40de-944b-e07fc1f90ae7/1729260123456-abc123.jpg

-- ============================================
-- FUNÇÕES AUXILIARES USADAS
-- ============================================

-- user_has_org_access(org_id UUID) -> BOOLEAN
-- Verifica se o usuário autenticado (auth.uid()) pertence à organização

-- user_org_role(org_id UUID) -> user_role ENUM
-- Retorna o papel do usuário na organização (OWNER, ADMIN, EDITOR, VIEWER)

-- split_part(text, delimiter, position) -> text
-- Extrai uma parte de um caminho separado por delimitadores
-- Exemplo: split_part('org/post/file.jpg', '/', 1) = 'org'
--          split_part('org/post/file.jpg', '/', 2) = 'post'
--          split_part('org/post/file.jpg', '/', 3) = 'file.jpg'
