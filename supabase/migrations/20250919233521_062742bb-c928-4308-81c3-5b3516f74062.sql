-- Inserir os novos canais para organizações existentes
DO $$
DECLARE
    org_record RECORD;
BEGIN
    FOR org_record IN SELECT id FROM public.orgs LOOP
        -- Verificar se o canal já existe antes de inserir
        
        -- Blog
        IF NOT EXISTS (SELECT 1 FROM public.channels WHERE org_id = org_record.id AND key = 'blog') THEN
            INSERT INTO public.channels (org_id, key, name, is_active)
            VALUES (org_record.id, 'blog', 'Blog', true);
        END IF;
        
        -- Ebook
        IF NOT EXISTS (SELECT 1 FROM public.channels WHERE org_id = org_record.id AND key = 'ebook') THEN
            INSERT INTO public.channels (org_id, key, name, is_active)
            VALUES (org_record.id, 'ebook', 'E-book', true);
        END IF;
        
        -- Facebook
        IF NOT EXISTS (SELECT 1 FROM public.channels WHERE org_id = org_record.id AND key = 'facebook') THEN
            INSERT INTO public.channels (org_id, key, name, is_active)
            VALUES (org_record.id, 'facebook', 'Facebook', true);
        END IF;
        
        -- YouTube
        IF NOT EXISTS (SELECT 1 FROM public.channels WHERE org_id = org_record.id AND key = 'youtube') THEN
            INSERT INTO public.channels (org_id, key, name, is_active)
            VALUES (org_record.id, 'youtube', 'YouTube', true);
        END IF;
        
        -- Roteiro
        IF NOT EXISTS (SELECT 1 FROM public.channels WHERE org_id = org_record.id AND key = 'roteiro') THEN
            INSERT INTO public.channels (org_id, key, name, is_active)
            VALUES (org_record.id, 'roteiro', 'Roteiro', true);
        END IF;
    END LOOP;
END $$;