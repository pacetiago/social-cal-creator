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
        -- Verificar se o cliente já existe
        SELECT id INTO austa_client_id FROM public.clients WHERE org_id = org_id_var AND name = 'Grupo Austa' LIMIT 1;
        
        -- Criar cliente Grupo Austa se não existir
        IF austa_client_id IS NULL THEN
            INSERT INTO public.clients (org_id, name, is_active)
            VALUES (org_id_var, 'Grupo Austa', true)
            RETURNING id INTO austa_client_id;
        END IF;
        
        -- Criar empresa Austa Clínica
        SELECT id INTO austa_clinica_id FROM public.companies WHERE client_id = austa_client_id AND name = 'Austa Clínica' LIMIT 1;
        IF austa_clinica_id IS NULL THEN
            INSERT INTO public.companies (client_id, name, color, is_active)
            VALUES (austa_client_id, 'Austa Clínica', '#0066CC', true)
            RETURNING id INTO austa_clinica_id;
        END IF;
        
        -- Criar empresa Austa Hospital
        SELECT id INTO austa_hospital_id FROM public.companies WHERE client_id = austa_client_id AND name = 'Austa Hospital' LIMIT 1;
        IF austa_hospital_id IS NULL THEN
            INSERT INTO public.companies (client_id, name, color, is_active)
            VALUES (austa_client_id, 'Austa Hospital', '#CC0000', true)
            RETURNING id INTO austa_hospital_id;
        END IF;
        
        -- Criar empresa IMC
        SELECT id INTO imc_id FROM public.companies WHERE client_id = austa_client_id AND name = 'IMC - Instituto de Medicina Cirúrgica' LIMIT 1;
        IF imc_id IS NULL THEN
            INSERT INTO public.companies (client_id, name, color, is_active)
            VALUES (austa_client_id, 'IMC - Instituto de Medicina Cirúrgica', '#00AA44', true)
            RETURNING id INTO imc_id;
        END IF;
        
        -- Criar campanha Outubro Rosa
        SELECT id INTO campanha_outubro_rosa_id FROM public.campaigns WHERE org_id = org_id_var AND name = 'Campanha Outubro Rosa 2024' LIMIT 1;
        IF campanha_outubro_rosa_id IS NULL THEN
            INSERT INTO public.campaigns (org_id, name, description, start_date, end_date, is_active)
            VALUES (org_id_var, 'Campanha Outubro Rosa 2024', 'Campanha de conscientização sobre o câncer de mama', '2024-10-01', '2024-10-31', true)
            RETURNING id INTO campanha_outubro_rosa_id;
        END IF;
        
        -- Buscar IDs dos canais
        SELECT id INTO blog_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'blog' LIMIT 1;
        SELECT id INTO facebook_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'facebook' LIMIT 1;
        SELECT id INTO instagram_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'instagram' LIMIT 1;
        SELECT id INTO linkedin_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'linkedin' LIMIT 1;
        
        -- Post 1: Blog - Abertura da campanha Câncer de Mama
        IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Autocuidado que transforma – Prevenir é um ato de força') THEN
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
        END IF;
        
        -- Post 2: Facebook - Campanha Câncer de Mama
        IF NOT EXISTS (SELECT 1 FROM public.posts WHERE title = 'Dados de impacto do câncer de mama') THEN
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

    END IF;
END $$;