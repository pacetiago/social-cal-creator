-- Adicionar novos tipos de canal: blog, ebook, facebook, youtube e roteiro
-- Primeiro, vamos verificar se o enum channel_key existe e adicionar os novos valores

ALTER TYPE channel_key ADD VALUE IF NOT EXISTS 'blog';
ALTER TYPE channel_key ADD VALUE IF NOT EXISTS 'ebook';
ALTER TYPE channel_key ADD VALUE IF NOT EXISTS 'facebook';
ALTER TYPE channel_key ADD VALUE IF NOT EXISTS 'youtube';
ALTER TYPE channel_key ADD VALUE IF NOT EXISTS 'roteiro';

-- Inserir os novos canais para organizações existentes
-- Vamos criar uma função temporária para inserir canais para todas as orgs
DO $$
DECLARE
    org_record RECORD;
BEGIN
    FOR org_record IN SELECT id FROM public.orgs LOOP
        -- Blog
        INSERT INTO public.channels (org_id, key, name, is_active)
        VALUES (org_record.id, 'blog', 'Blog', true)
        ON CONFLICT (org_id, key) DO NOTHING;
        
        -- Ebook
        INSERT INTO public.channels (org_id, key, name, is_active)
        VALUES (org_record.id, 'ebook', 'E-book', true)
        ON CONFLICT (org_id, key) DO NOTHING;
        
        -- Facebook
        INSERT INTO public.channels (org_id, key, name, is_active)
        VALUES (org_record.id, 'facebook', 'Facebook', true)
        ON CONFLICT (org_id, key) DO NOTHING;
        
        -- YouTube
        INSERT INTO public.channels (org_id, key, name, is_active)
        VALUES (org_record.id, 'youtube', 'YouTube', true)
        ON CONFLICT (org_id, key) DO NOTHING;
        
        -- Roteiro
        INSERT INTO public.channels (org_id, key, name, is_active)
        VALUES (org_record.id, 'roteiro', 'Roteiro', true)
        ON CONFLICT (org_id, key) DO NOTHING;
    END LOOP;
END $$;