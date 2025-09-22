-- Inserir cliente Grupo Austa e empresas/unidades
DO $$
DECLARE
    org_record RECORD;
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
    SELECT id INTO org_record FROM public.orgs LIMIT 1;
    
    IF org_record IS NOT NULL THEN
        -- Criar cliente Grupo Austa
        INSERT INTO public.clients (org_id, name, is_active)
        VALUES (org_record, 'Grupo Austa', true)
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
        VALUES (org_record, 'Campanha Outubro Rosa 2024', 'Campanha de conscientização sobre o câncer de mama', '2024-10-01', '2024-10-31', true)
        RETURNING id INTO campanha_outubro_rosa_id;
        
        -- Buscar IDs dos canais
        SELECT id INTO blog_channel_id FROM public.channels WHERE org_id = org_record AND key = 'blog';
        SELECT id INTO facebook_channel_id FROM public.channels WHERE org_id = org_record AND key = 'facebook';
        SELECT id INTO instagram_channel_id FROM public.channels WHERE org_id = org_record AND key = 'instagram';
        SELECT id INTO linkedin_channel_id FROM public.channels WHERE org_id = org_record AND key = 'linkedin';
        
        -- Inserir posts baseados no cronograma da planilha
        
        -- Post 1: Blog - Abertura da campanha Câncer de Mama
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_record,
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
            org_record,
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
        
        -- Post 3: Institucional IMC
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_record,
            NULL,
            instagram_channel_id,
            austa_client_id,
            imc_id,
            'scheduled',
            'IMC: Onde mentes brilhantes se encontram',
            'O IMC é local onde mentes brilhantes se encontram para ir além do que já é conhecido. Nossa paixão é buscar continuamente por novas soluções e transformar a maneira como o cuidado com a vida é feito. Aqui, o conhecimento é aplicado para desenvolver o que há de mais avançado na medicina, garantindo que o amanhã da saúde seja mais seguro, eficaz e humano.',
            '2024-10-03 16:00:00+00',
            'Institucional',
            'agency',
            ARRAY['inovação', 'medicina', 'tecnologia', 'futuro']
        );
        
        -- Post 4: Cuidados Paliativos
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_record,
            NULL,
            linkedin_channel_id,
            austa_client_id,
            austa_hospital_id,
            'scheduled',
            'Dia Mundial de Cuidados Paliativos',
            'O cuidado paliativo é uma abordagem que melhora a qualidade de vida de pacientes e familiares que enfrentam doenças graves. Não significa desistir, mas sim oferecer conforto, dignidade e bem-estar em todas as fases do tratamento. No Austa Hospital, nosso compromisso é cuidar com humanização e respeito.',
            '2024-10-04 10:00:00+00',
            'Cuidados Paliativos',
            'agency',
            ARRAY['cuidados paliativos', 'humanização', 'qualidade de vida', 'bem-estar']
        );
        
        -- Post 5: Vídeo Roteiro - Médico Campanha Câncer de Mama
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_record,
            campanha_outubro_rosa_id,
            (SELECT id FROM public.channels WHERE org_id = org_record AND key = 'roteiro'),
            austa_client_id,
            austa_clinica_id,
            'draft',
            'Roteiro: Vídeo Médico Campanha Câncer de Mama',
            'ROTEIRO - VÍDEO MÉDICO OUTUBRO ROSA

FADE IN:

INT. CONSULTÓRIO MÉDICO - DIA

[Médico(a) em consultório bem iluminado, com visual clean e acolhedor]

MÉDICO(A):
Olá, eu sou Dr(a). [NOME], e hoje quero conversar com você sobre algo muito importante: a prevenção do câncer de mama.

[Pausa, olhar direto para câmera]

O câncer de mama é o segundo tipo mais comum entre as mulheres no Brasil, mas temos uma arma poderosa contra ele: a detecção precoce.

[Gesto acolhedor]

A mamografia anual a partir dos 40 anos pode detectar tumores antes mesmo que sejam palpáveis. E o autoexame? É importante, mas não substitui os exames médicos regulares.

[Tom mais próximo]

Aqui no Grupo Austa, estamos com você em todas as etapas. Das consultas preventivas nas Austa Clínicas ao tratamento especializado no Austa Hospital.

[Sorri]

Porque prevenir é um ato de força, e você não está sozinha nessa jornada.

[Logo Grupo Austa]

FADE OUT.',
            '2024-10-05 12:00:00+00',
            'Roteiro de Vídeo',
            'agency',
            ARRAY['roteiro', 'vídeo', 'médico', 'câncer de mama', 'outubro rosa']
        );
        
        -- Post 6: Hábitos saudáveis
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_record,
            campanha_outubro_rosa_id,
            facebook_channel_id,
            austa_client_id,
            austa_clinica_id,
            'scheduled',
            'Hábitos saudáveis que auxiliam na prevenção do câncer',
            '🌸 Hábitos que fortalecem sua saúde:

✅ Alimentação equilibrada rica em frutas e vegetais
✅ Prática regular de exercícios físicos
✅ Evitar o consumo excessivo de álcool
✅ Não fumar
✅ Manter o peso adequado
✅ Realizar exames preventivos regularmente

Pequenas mudanças no dia a dia fazem uma grande diferença na prevenção. O Grupo Austa cuida de você em todas as etapas! 

#OutubroRosa #Prevenção #VidaSaudável #GrupoAusta',
            '2024-10-06 15:00:00+00',
            'Prevenção',
            'agency',
            ARRAY['hábitos saudáveis', 'prevenção', 'vida saudável', 'outubro rosa']
        );

    END IF;
END $$;