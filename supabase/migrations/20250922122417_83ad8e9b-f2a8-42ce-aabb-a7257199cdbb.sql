-- Inserir todo o conteúdo restante da planilha Grupo Austa
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
    roteiro_channel_id UUID;
    youtube_channel_id UUID;
BEGIN
    -- Buscar dados existentes
    SELECT id INTO org_id_var FROM public.orgs LIMIT 1;
    SELECT id INTO austa_client_id FROM public.clients WHERE name = 'Grupo Austa' LIMIT 1;
    SELECT id INTO austa_clinica_id FROM public.companies WHERE name = 'Austa Clínica' LIMIT 1;
    SELECT id INTO austa_hospital_id FROM public.companies WHERE name = 'Austa Hospital' LIMIT 1;
    SELECT id INTO imc_id FROM public.companies WHERE name = 'IMC - Instituto de Medicina Cirúrgica' LIMIT 1;
    SELECT id INTO campanha_outubro_rosa_id FROM public.campaigns WHERE name = 'Campanha Outubro Rosa 2024' LIMIT 1;
    
    -- Buscar canais
    SELECT id INTO blog_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'blog' LIMIT 1;
    SELECT id INTO facebook_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'facebook' LIMIT 1;
    SELECT id INTO instagram_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'instagram' LIMIT 1;
    SELECT id INTO linkedin_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'linkedin' LIMIT 1;
    SELECT id INTO roteiro_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'roteiro' LIMIT 1;
    SELECT id INTO youtube_channel_id FROM public.channels WHERE org_id = org_id_var AND key = 'youtube' LIMIT 1;
    
    IF org_id_var IS NOT NULL AND austa_client_id IS NOT NULL THEN
        
        -- Post 5: Roteiro Vídeo Médico Campanha Câncer de Mama
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, campanha_outubro_rosa_id, roteiro_channel_id, austa_client_id, austa_clinica_id, 'draft',
            'Roteiro: Vídeo Médico Campanha Câncer de Mama',
            'ROTEIRO - VÍDEO MÉDICO OUTUBRO ROSA

FADE IN: INT. CONSULTÓRIO MÉDICO - DIA
[Médico(a) em consultório bem iluminado, com visual clean e acolhedor]

MÉDICO(A): Olá, eu sou Dr(a). [NOME], e hoje quero conversar com você sobre algo muito importante: a prevenção do câncer de mama.

[Pausa, olhar direto para câmera] O câncer de mama é o segundo tipo mais comum entre as mulheres no Brasil, mas temos uma arma poderosa contra ele: a detecção precoce.

[Gesto acolhedor] A mamografia anual a partir dos 40 anos pode detectar tumores antes mesmo que sejam palpáveis. E o autoexame? É importante, mas não substitui os exames médicos regulares.

[Tom mais próximo] Aqui no Grupo Austa, estamos com você em todas as etapas. Das consultas preventivas nas Austa Clínicas ao tratamento especializado no Austa Hospital.

[Sorri] Porque prevenir é um ato de força, e você não está sozinha nessa jornada.
[Logo Grupo Austa] FADE OUT.',
            '2024-10-05 12:00:00+00', 'Roteiro de Vídeo', 'agency',
            ARRAY['roteiro', 'vídeo', 'médico', 'câncer de mama', 'outubro rosa']
        );
        
        -- Post 6: Hábitos saudáveis
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, campanha_outubro_rosa_id, facebook_channel_id, austa_client_id, austa_clinica_id, 'scheduled',
            'Hábitos saudáveis que auxiliam na prevenção do câncer',
            '🌸 Hábitos que fortalecem sua saúde:

✅ Alimentação equilibrada rica em frutas e vegetais
✅ Prática regular de exercícios físicos
✅ Evitar o consumo excessivo de álcool
✅ Não fumar
✅ Manter o peso adequado
✅ Realizar exames preventivos regularmente

Pequenas mudanças no dia a dia fazem uma grande diferença na prevenção. O Grupo Austa cuida de você em todas as etapas! #OutubroRosa #Prevenção #VidaSaudável #GrupoAusta',
            '2024-10-06 15:00:00+00', 'Prevenção', 'agency',
            ARRAY['hábitos saudáveis', 'prevenção', 'vida saudável', 'outubro rosa']
        );
        
        -- Post 8: Blog - Câncer de Mama: A Jornada da Prevenção à Cura
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, campanha_outubro_rosa_id, blog_channel_id, austa_client_id, austa_hospital_id, 'scheduled',
            'Câncer de Mama: A Jornada da Prevenção à Cura',
            'Câncer de Mama: A Jornada da Prevenção à Cura

O câncer de mama representa uma das maiores preocupações de saúde feminina no Brasil. Mas aqui no Grupo Austa, acreditamos que conhecimento é poder – e que você não está sozinha nessa jornada.

A Prevenção Como Primeiro Passo
A prevenção começa com hábitos saudáveis e exames regulares. Nas Austa Clínicas, oferecemos programas de rastreamento personalizados, porque cada mulher é única.

O Diagnóstico: Momento de Acolhimento
Quando o diagnóstico surge, o Austa Hospital está preparado com uma equipe multidisciplinar experiente. Nossa abordagem humanizada garante que você receba não apenas o melhor tratamento, mas também o suporte emocional necessário.

Tratamento de Excelência
No IMC, nossa tecnologia de ponta se alia à experiência médica para oferecer as terapias mais avançadas, sempre focadas na qualidade de vida.

Porque no Grupo Austa, cuidar de você é nossa missão em cada etapa dessa jornada.',
            '2024-10-08 08:00:00+00', 'Jornada do Paciente', 'agency',
            ARRAY['câncer de mama', 'prevenção', 'tratamento', 'jornada', 'outubro rosa']
        );
        
        -- Post 9: Importância da mamografia
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, campanha_outubro_rosa_id, facebook_channel_id, austa_client_id, austa_clinica_id, 'scheduled',
            'A importância da mamografia',
            'A MAMOGRAFIA SALVA VIDAS 💖

🔍 A partir dos 40 anos, o exame anual é fundamental
📊 Detecta tumores até 2 anos antes de serem palpáveis
⏰ O diagnóstico precoce aumenta as chances de cura para mais de 95%
👩‍⚕️ Procedimento rápido e realizado por profissionais especializados

Não deixe para depois. Agende já sua mamografia nas Austa Clínicas.

#OutubroRosa #Mamografia #PrevenÇãoSalvaVidas #AustaClínicas',
            '2024-10-09 14:00:00+00', 'Prevenção', 'agency',
            ARRAY['mamografia', 'prevenção', 'diagnóstico precoce', 'outubro rosa']
        );
        
        -- Post 10: Carrossel - Saúde Mental
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, instagram_channel_id, austa_client_id, austa_clinica_id, 'scheduled',
            'Saúde Mental: O equilíbrio entre corpo e mente',
            'CARROSSEL - SAÚDE MENTAL E FÍSICA

SLIDE 1: A saúde completa é o equilíbrio entre o que sentimos e o que o nosso corpo expressa.

SLIDE 2: CONEXÃO MENTE-CORPO
• Estresse afeta o sistema imunológico
• Ansiedade pode causar sintomas físicos
• Depressão impacta a energia e disposição

SLIDE 3: SINAIS DE ALERTA
• Dores sem causa aparente
• Fadiga constante
• Alterações do sono
• Mudanças no apetite

SLIDE 4: COMO CUIDAR
✓ Atividade física regular
✓ Técnicas de relaxamento
✓ Apoio profissional quando necessário
✓ Rede de apoio social

SLIDE 5: No Grupo Austa, cuidamos de você de forma integral, entendendo que saúde é bem-estar completo.',
            '2024-10-10 16:00:00+00', 'Saúde Mental', 'agency',
            ARRAY['saúde mental', 'bem-estar', 'carrossel', 'saúde integral']
        );
        
        -- Post 11: Carrossel - Prevenção da Obesidade
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, instagram_channel_id, austa_client_id, austa_clinica_id, 'scheduled',
            'Prevenção da Obesidade para Trabalhadores',
            'CARROSSEL - PREVENÇÃO DA OBESIDADE

SLIDE 1: DICAS DE PREVENÇÃO DA OBESIDADE Para Trabalhadores de Usina e Campo

SLIDE 2: ALIMENTAÇÃO NO TRABALHO
• Leve lanches saudáveis
• Frutas e castanhas
• Evite frituras e refrigerantes
• Beba muita água

SLIDE 3: ATIVIDADE FÍSICA
• Aproveite pausas para se movimentar
• Alongamentos durante o expediente
• Caminhadas após o trabalho
• Exercícios em casa

SLIDE 4: CUIDADOS ESPECIAIS
• Atenção ao peso regularmente
• Exames médicos periódicos
• Controle da pressão arterial
• Acompanhamento nutricional

SLIDE 5: Nas Austa Clínicas, oferecemos programas de saúde ocupacional personalizados para sua empresa.',
            '2024-10-11 15:00:00+00', 'Prevenção', 'agency',
            ARRAY['obesidade', 'prevenção', 'saúde ocupacional', 'trabalhadores', 'carrossel']
        );
        
        -- Post 12: Ação Dia das Crianças - Austa Hospital
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, responsibility, tags)
        VALUES (
            org_id_var, NULL, instagram_channel_id, austa_client_id, austa_hospital_id, 'scheduled',
            'Dia das Crianças no Austa Hospital',
            'DIA DAS CRIANÇAS NO AUSTA HOSPITAL 📚👶

Hoje entregamos livros para as crianças internadas, mostrando que o cuidado vai além da medicina. A humanização é parte fundamental do nosso tratamento.

Cada sorriso que despertamos reforça nossa missão: cuidar com amor e dedicação.

#DiaDasCrianças #Humanização #AustaHospital #CuidadoHumano',
            '2024-10-12 10:00:00+00', 'client',
            ARRAY['dia das crianças', 'humanização', 'hospital', 'cuidado infantil']
        );
        
        -- Post 13: LinkedIn Trombose
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, responsibility, tags)
        VALUES (
            org_id_var, NULL, linkedin_channel_id, austa_client_id, austa_hospital_id, 'scheduled',
            'Dia Mundial da Trombose - Panfletagem',
            'DIA MUNDIAL DA TROMBOSE - AÇÃO DE CONSCIENTIZAÇÃO

Hoje realizamos ação de panfletagem para conscientizar sobre a trombose, uma condição séria que pode ser prevenida com conhecimento e cuidados adequados.

A trombose venosa profunda afeta milhares de pessoas anualmente. Sinais como:
• Dor e inchaço nas pernas
• Vermelhidão local
• Sensação de calor na região

Devem ser investigados imediatamente.

No Austa Hospital, nossa equipe está preparada para diagnóstico e tratamento especializado.

#DiaMundialDaTrombose #Prevenção #AustaHospital #SaúdeVascular',
            '2024-10-13 09:00:00+00', 'client',
            ARRAY['trombose', 'prevenção', 'conscientização', 'saúde vascular']
        );
        
        -- Post 14: Blog IMC Cirurgia Vascular
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, blog_channel_id, austa_client_id, imc_id, 'scheduled',
            'IMC: Excelência em Cirurgia Vascular',
            'CIRURGIA VASCULAR NO IMC: TECNOLOGIA E EXPERTISE

O Instituto de Medicina Cirúrgica (IMC) é referência em cirurgia vascular, combinando tecnologia de ponta com a experiência de nossos especialistas.

Especialidades em Destaque:
• Cirurgia endovascular
• Tratamento de aneurismas
• Cirurgia de varizes
• Acessos vasculares para hemodiálise

Nossa Abordagem:
Utilizamos técnicas minimamente invasivas sempre que possível, reduzindo o tempo de internação e acelerando a recuperação dos pacientes.

Tecnologia Avançada:
Contamos com equipamentos de última geração para diagnóstico por imagem e procedimentos cirúrgicos precisos.

No IMC, cada paciente recebe um plano de tratamento personalizado, desenvolvido por nossa equipe multidisciplinar especializada.',
            '2024-10-13 14:00:00+00', 'Especialidade Médica', 'agency',
            ARRAY['cirurgia vascular', 'imc', 'tecnologia', 'especialidade']
        );
        
        -- Post 15: Canais de atendimento para beneficiários
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, facebook_channel_id, austa_client_id, austa_clinica_id, 'scheduled',
            'Canais de atendimento ágil para beneficiários',
            'SEUS CANAIS DE ATENDIMENTO AUSTA CLÍNICAS 📱💻

Facilitamos o seu acesso aos nossos serviços:

📞 TELEFONE
Central de atendimento disponível para agendamentos e informações

💻 PORTAL ONLINE
Agende consultas, veja resultados de exames e gerencie sua conta

📱 APP AUSTA
Praticidade na palma da sua mão

🏥 ATENDIMENTO PRESENCIAL
Equipe preparada para te receber com qualidade

Evite deslocamentos desnecessários. Utilize nossos canais digitais!

#AustaClínicas #AtendimentoÁgil #Conveniência #SaúdeDigital',
            '2024-10-14 11:00:00+00', 'Institucional', 'agency',
            ARRAY['atendimento', 'canais digitais', 'conveniência', 'beneficiários']
        );

        -- Post 16: Blog - Foco oncologia + cirurgia
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, campanha_outubro_rosa_id, blog_channel_id, austa_client_id, austa_hospital_id, 'scheduled',
            'Oncologia e Cirurgia: Nossa Expertise',
            'ONCOLOGIA E CIRURGIA: EXCELÊNCIA EM TRATAMENTO

O Austa Hospital é referência em oncologia e cirurgia, oferecendo tratamento integral para pacientes com câncer.

Nossa Estrutura Oncológica:
• Centro de Infusão moderno e humanizado
• Equipamentos de radioterapia de última geração
• Laboratório especializado em diagnóstico oncológico
• UTI Oncológica com equipe especializada

Cirurgias Especializadas:
• Cirurgia oncológica
• Procedimentos minimamente invasivos
• Cirurgia robótica
• Reconstrução mamária

Equipe Multidisciplinar:
Nossos oncologistas, cirurgiões, enfermeiros e demais profissionais trabalham de forma integrada para oferecer o melhor cuidado.

No Austa Hospital, cada paciente recebe um tratamento personalizado, com foco na cura e qualidade de vida.',
            '2024-10-15 08:00:00+00', 'Especialidade Oncológica', 'agency',
            ARRAY['oncologia', 'cirurgia', 'câncer', 'tratamento especializado']
        );
        
        -- Post 17: Dia do Anestesiologista
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, instagram_channel_id, austa_client_id, austa_hospital_id, 'scheduled',
            'Dia do Anestesiologista',
            'DIA DO ANESTESIOLOGISTA 👨‍⚕️

O anestesista é a segurança que você não vê, mas sente em cada segundo de sua cirurgia.

Muito mais que técnica, é o profissional que oferece tranquilidade e segurança não só ao paciente, mas também aos familiares que esperam.

No Austa Hospital, nossa equipe de anestesiologistas está preparada para garantir seu conforto e segurança em todos os procedimentos.

Parabéns a todos os anestesiologistas! 

#DiaDoAnestesiologista #Segurança #AustaHospital #CuidadoEspecializado',
            '2024-10-16 14:00:00+00', 'Homenagem Profissional', 'agency',
            ARRAY['anestesiologista', 'segurança', 'profissionais', 'homenagem']
        );

    END IF;
END $$;