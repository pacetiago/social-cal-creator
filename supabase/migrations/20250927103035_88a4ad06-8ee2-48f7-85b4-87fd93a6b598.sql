-- Limpar posts antigos importados via planilha
DELETE FROM posts WHERE created_at < '2025-09-25';

-- Verificar e adicionar novos canais se não existirem (usando INSERT simples)
INSERT INTO channels (org_id, name, key, is_active, created_by)
SELECT '550e8400-e29b-41d4-a716-446655440002', 'Instagram', 'instagram', true, '0ede79a2-f5ff-4c36-ada4-2a61baf98f35'
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE org_id = '550e8400-e29b-41d4-a716-446655440002' AND key = 'instagram');

INSERT INTO channels (org_id, name, key, is_active, created_by)
SELECT '550e8400-e29b-41d4-a716-446655440002', 'TikTok', 'tiktok', true, '0ede79a2-f5ff-4c36-ada4-2a61baf98f35'
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE org_id = '550e8400-e29b-41d4-a716-446655440002' AND key = 'tiktok');

INSERT INTO channels (org_id, name, key, is_active, created_by)
SELECT '550e8400-e29b-41d4-a716-446655440002', 'Blog', 'blog', true, '0ede79a2-f5ff-4c36-ada4-2a61baf98f35'
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE org_id = '550e8400-e29b-41d4-a716-446655440002' AND key = 'blog');

INSERT INTO channels (org_id, name, key, is_active, created_by)
SELECT '550e8400-e29b-41d4-a716-446655440002', 'E-book', 'ebook', true, '0ede79a2-f5ff-4c36-ada4-2a61baf98f35'
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE org_id = '550e8400-e29b-41d4-a716-446655440002' AND key = 'ebook');

INSERT INTO channels (org_id, name, key, is_active, created_by)
SELECT '550e8400-e29b-41d4-a716-446655440002', 'Roteiro', 'roteiro', true, '0ede79a2-f5ff-4c36-ada4-2a61baf98f35'
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE org_id = '550e8400-e29b-41d4-a716-446655440002' AND key = 'roteiro');

-- Criar memberships para o usuário criado se não existir
INSERT INTO memberships (user_id, org_id, role, created_by)
SELECT '0ede79a2-f5ff-4c36-ada4-2a61baf98f35', '550e8400-e29b-41d4-a716-446655440002', 'ADMIN', '0ede79a2-f5ff-4c36-ada4-2a61baf98f35'
WHERE NOT EXISTS (SELECT 1 FROM memberships WHERE user_id = '0ede79a2-f5ff-4c36-ada4-2a61baf98f35' AND org_id = '550e8400-e29b-41d4-a716-446655440002');