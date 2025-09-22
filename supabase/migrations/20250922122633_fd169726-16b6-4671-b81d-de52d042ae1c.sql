-- Finalizar com os últimos posts da planilha
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
    
    IF org_id_var IS NOT NULL AND austa_client_id IS NOT NULL THEN
        
        -- Post 24: Roteiro Vídeo - Dia do Médico
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, roteiro_channel_id, austa_client_id, austa_hospital_id, 'draft',
            'Roteiro: Vídeo Dia do Médico - Medicina Colaborativa',
            'ROTEIRO - VÍDEO DIA DO MÉDICO

FADE IN: INT. HALL DO HOSPITAL - DIA

NARRADOR (V.O.): Por trás de cada diagnóstico preciso e de cada tratamento bem-sucedido, existe uma equipe inteira trabalhando.

[Sequência de imagens: médicos, enfermeiros, técnicos trabalhando em equipe]

MÉDICO ONCOLOGISTA: [olhando para câmera] No Grupo Austa, acreditamos na medicina colaborativa.

[Corte para: sala de cirurgia, médicos se preparando]

CIRURGIÃO: Cada especialista contribui com sua expertise...

[Corte para: centro de diagnóstico]

RADIOLOGISTA: Para que o paciente receba o melhor cuidado possível.

[Corte para: enfermaria, enfermeira cuidando de paciente]

ENFERMEIRA: Nosso trabalho vai além da técnica médica.

[Corte para: recepção, atendimento humanizado]

NARRADOR (V.O.): É sobre cuidar de pessoas, com dedicação e respeito.

[Montagem rápida: diferentes profissionais sorrindo]

TEXTO NA TELA: "PARABÉNS A TODOS OS MÉDICOS"

LOGO GRUPO AUSTA

FADE OUT.',
            '2024-10-24 15:00:00+00', 'Roteiro de Vídeo', 'agency',
            ARRAY['roteiro', 'dia do médico', 'medicina colaborativa', 'equipe']
        );
        
        -- Post 25: Cuidados Paliativos - reprise
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, instagram_channel_id, austa_client_id, austa_hospital_id, 'scheduled',
            'Cuidados Paliativos: Dignidade e Bem-estar',
            'CUIDADOS PALIATIVOS: DIGNIDADE E BEM-ESTAR 🤝

O que é cuidado paliativo?
É uma abordagem que melhora a qualidade de vida de pacientes e familiares diante de doenças graves.

❤️ NÃO SIGNIFICA DESISTIR
Significa oferecer conforto e dignidade

🏥 NOSSA ABORDAGEM
• Controle da dor e sintomas
• Suporte emocional e espiritual
• Comunicação clara e compassiva
• Respeito às escolhas do paciente

👨‍⚕️ EQUIPE ESPECIALIZADA
Médicos, enfermeiros, psicólogos e assistentes sociais trabalhando juntos

💝 CUIDADO INTEGRAL
Para o paciente e toda a família

No Austa Hospital, cuidar é nossa missão em todas as fases da vida.

#CuidadosPaliativos #Dignidade #Humanização #AustaHospital',
            '2024-10-25 14:00:00+00', 'Cuidados Paliativos', 'agency',
            ARRAY['cuidados paliativos', 'dignidade', 'humanização', 'bem-estar']
        );
        
        -- Post 27: Carrossel - Engajamento Câncer de Mama
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, campanha_outubro_rosa_id, instagram_channel_id, austa_client_id, austa_clinica_id, 'scheduled',
            'Quiz: Teste seus conhecimentos sobre Câncer de Mama',
            'CARROSSEL - QUIZ OUTUBRO ROSA

SLIDE 1: TESTE SEUS CONHECIMENTOS
Quiz sobre Câncer de Mama 🧠💖

SLIDE 2: PERGUNTA 1
Qual a idade recomendada para começar a mamografia?
A) 35 anos
B) 40 anos
C) 50 anos

SLIDE 3: PERGUNTA 2
Quantos casos de câncer de mama têm histórico familiar?
A) 50%
B) 30%
C) 10%

SLIDE 4: PERGUNTA 3
A detecção precoce aumenta as chances de cura em:
A) 70%
B) 85%
C) 95%

SLIDE 5: RESPOSTAS
1: B) 40 anos
2: C) 10% (90% não têm histórico familiar)
3: C) 95% com detecção precoce

Como você se saiu? Compartilhe nos comentários! 

#OutubroRosa #Quiz #Conhecimento #PrevenÇãoSalvaVidas',
            '2024-10-27 16:00:00+00', 'Engajamento', 'agency',
            ARRAY['quiz', 'engajamento', 'educação', 'câncer de mama', 'outubro rosa']
        );
        
        -- Post 29: Blog - Dia Mundial de Conscientização do AVC
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, blog_channel_id, austa_client_id, austa_hospital_id, 'scheduled',
            'AVC: Protocolo de Atendimento e Prevenção',
            'AVC: CADA MINUTO CONTA NO PROTOCOLO DE ATENDIMENTO

O Acidente Vascular Cerebral (AVC) é uma emergência médica. No Austa Hospital, nosso protocolo especializado garante atendimento rápido e eficaz.

Nosso Protocolo AVC:
✓ Atendimento em menos de 60 minutos
✓ Equipe multidisciplinar 24h
✓ Tecnologia avançada de diagnóstico
✓ Unidade de AVC especializada

Sinais de Alerta (teste SAMU):
S - Sorriso (boca torta)
A - Abraço (fraqueza no braço)
M - Música (fala alterada)
U - Urgente (chame o 192)

Fatores de Risco:
• Hipertensão arterial
• Diabetes
• Colesterol alto
• Tabagismo
• Sedentarismo

Prevenção:
• Controle da pressão arterial
• Atividade física regular
• Alimentação saudável
• Não fumar
• Check-ups regulares

No Austa Hospital, temos o protocolo cirúrgico AVC que salva vidas todos os dias.',
            '2024-10-29 08:00:00+00', 'Emergência Médica', 'client',
            ARRAY['avc', 'protocolo', 'emergência', 'prevenção', 'neurocirurgia']
        );
        
        -- Post 30: Sinais de AVC
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, facebook_channel_id, austa_client_id, austa_clinica_id, 'scheduled',
            'Sinais de AVC: Quando procurar ajuda',
            'SINAIS DE AVC: QUANDO PROCURAR AJUDA IMEDIATAMENTE 🚨

Use o teste SAMU para identificar:

🙂 S - SORRISO
Peça para a pessoa sorrir. A boca fica torta?

🤗 A - ABRAÇO  
Peça para levantar os braços. Um fica mais baixo?

🎵 M - MÚSICA
Peça para falar uma frase. A fala está alterada?

🚨 U - URGENTE
Se qualquer resposta for SIM, chame 192 IMEDIATAMENTE

⏰ TEMPO É VIDA
Cada minuto perdido = 1,9 milhão de neurônios mortos

📞 LIGUE 192
Ou dirija-se ao pronto-socorro mais próximo

🏥 NO AUSTA HOSPITAL
Protocolo AVC 24h para atendimento especializado

Compartilhe esta informação! Pode salvar uma vida.

#DiaMundialDoAVC #SinaisDeAVC #Emergência #AustaHospital',
            '2024-10-29 14:00:00+00', 'Educação Emergencial', 'agency',
            ARRAY['avc', 'sinais', 'emergência', 'prevenção', 'educação']
        );
        
        -- Post 31: Blog - Reumatismo
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, blog_channel_id, austa_client_id, austa_clinica_id, 'scheduled',
            'Reumatismo: Prevenção e Tratamento',
            'REUMATISMO: PREVENÇÃO É O MELHOR TRATAMENTO

O reumatismo engloba mais de 200 doenças que afetam articulações, músculos e ossos. A prevenção e o diagnóstico precoce fazem toda a diferença.

Principais Tipos:
• Artrite reumatoide
• Osteoartrose
• Fibromialgia
• Gota
• Lúpus

Sinais de Alerta:
⚠️ Dor nas articulações pela manhã
⚠️ Rigidez matinal
⚠️ Inchaço nas articulações
⚠️ Fadiga excessiva
⚠️ Febre baixa persistente

Prevenção Eficaz:
✓ Atividade física regular
✓ Manter peso adequado
✓ Alimentação anti-inflamatória
✓ Evitar movimentos repetitivos
✓ Gerenciar o estresse

Nas Austa Clínicas oferecemos:
• Consultas com reumatologista
• Exames especializados
• Fisioterapia
• Acompanhamento multidisciplinar

Cuide das suas articulações hoje para ter mobilidade sempre!',
            '2024-10-31 08:00:00+00', 'Prevenção', 'agency',
            ARRAY['reumatismo', 'artrite', 'prevenção', 'reumatologia', 'articulações']
        );

    END IF;
END $$;