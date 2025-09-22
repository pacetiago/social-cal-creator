-- Inserir cliente Grupo Austa e empresas/unidades
DO $$
DECLARE
    org_id_var UUID;
    austa_client_id UUID;
    austa_clinica_id UUID;
    austa_hospital_id UUID;
    imc_id UUID;
    campanha_outubro_rosa_id UUID;
    blog_channel_id UUID;
    facebook_channel_id UUID;
    instagram_channel_id UUID;
    linkedin_channel_id UUID;
BEGIN
    -- Buscar a primeira organização para inserir dados de exemplo
    SELECT id INTO org_id_var FROM public.orgs LIMIT 1;
    
    IF org_id_var IS NOT NULL THEN
        -- Criar cliente Grupo Austa
        INSERT INTO public.clients (org_id, name, is_active)
        VALUES (org_id_var, 'Grupo Austa', true)
        RETURNING id INTO austa_client_id;
        
        -- Criar empresas/unidades do Grupo Austa
        INSERT INTO public.companies (client_id, name, color, is_active)
        VALUES 
            (austa_client_id, 'Austa Clínica', '#0066CC', true),
            (austa_client_id, 'Austa Hospital', '#CC0000', true),
            (austa_client_id, 'IMC - Instituto de Medicina Cirúrgica', '#00AA44', true)
        RETURNING id INTO austa_clinica_id;
        
        -- Buscar IDs das outras empresas
        SELECT id INTO austa_hospital_id FROM public.companies WHERE client_id = austa_client_id AND name = 'Austa Hospital';
        SELECT id INTO imc_id FROM public.companies WHERE client_id = austa_client_id AND name = 'IMC - Instituto de Medicina Cirúrgica';
        
        -- Criar campanha Outubro Rosa
        INSERT INTO public.campaigns (org_id, name, description, start_date, end_date, is_active)
        VALUES (org_id_var, 'Campanha Outubro Rosa 2024', 'Campanha de conscientização sobre o câncer de mama', '2024-10-01', '2024-10-31', true)
        RETURNING id INTO campanha_outubro_rosa_id;
        
        -- Buscar IDs dos canais
        SELECT id INTO blog_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'blog';
        SELECT id INTO facebook_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'facebook';
        SELECT id INTO instagram_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'instagram';
        SELECT id INTO linkedin_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'linkedin';
        
        -- Inserir posts baseados no cronograma da planilha
        
        -- Post 1: Blog - Abertura da campanha Câncer de Mama
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var,
            campanha_outubro_rosa_id,
            blog_channel_id,
            austa_client_id,
            austa_clinica_id,
            'scheduled',
            'Autocuidado que transforma – Prevenir é um ato de força',
            'A prevenção do câncer de mama começa com o autocuidado. Neste Outubro Rosa, o Grupo Austa reforça que prevenir é um ato de força e coragem. Conhecer seu corpo, fazer exames regulares e manter hábitos saudáveis são passos fundamentais para uma vida plena e saudável.',
            '2024-10-01 08:00:00+00',
            'Prevenção e Autocuidado',
            'agency',
            ARRAY['câncer de mama', 'prevenção', 'outubro rosa', 'autocuidado']
        );
        
        -- Post 2: Facebook/Instagram - Campanha Câncer de Mama
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var,
            campanha_outubro_rosa_id,
            facebook_channel_id,
            austa_client_id,
            austa_clinica_id,
            'scheduled',
            'Dados de impacto do câncer de mama',
            'Você sabia que o câncer de mama é o segundo tipo de câncer mais comum entre as mulheres no Brasil? A detecção precoce pode salvar vidas. O Grupo Austa está com você em todas as etapas do cuidado. #OutubroRosa #Prevenção #CuidadoIntegral',
            '2024-10-02 14:00:00+00',
            'Conscientização',
            'agency',
            ARRAY['câncer de mama', 'dados', 'outubro rosa', 'prevenção']
        );

    END IF;
END $$;