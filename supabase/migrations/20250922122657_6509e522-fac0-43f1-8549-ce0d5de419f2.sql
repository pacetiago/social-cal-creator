-- Continuar inserindo posts restantes da planilha
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
        
        -- Post 17: Mitos & verdades do câncer de mama
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, campanha_outubro_rosa_id, instagram_channel_id, austa_client_id, austa_clinica_id, 'scheduled',
            'Mitos & Verdades sobre o Câncer de Mama',
            'MITOS & VERDADES SOBRE O CÂNCER DE MAMA 💖

❌ MITO: Só mulheres mais velhas têm câncer de mama
✅ VERDADE: Pode ocorrer em qualquer idade, mas é mais comum após os 50

❌ MITO: Se não há histórico familiar, não há risco
✅ VERDADE: 90% dos casos não têm histórico familiar

❌ MITO: Próteses de silicone causam câncer
✅ VERDADE: Não há evidência científica dessa relação

❌ MITO: Homens não podem ter câncer de mama
✅ VERDADE: Homens também podem desenvolver, embora seja raro

✅ VERDADE: A detecção precoce aumenta as chances de cura para mais de 95%

#OutubroRosa #MitosEVerdades #Conscientização #GrupoAusta',
            '2024-10-17 16:00:00+00', 'Educação', 'agency',
            ARRAY['mitos', 'verdades', 'educação', 'câncer de mama', 'outubro rosa']
        );
        
        -- Post 18: Carrossel - Dia do Médico
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, instagram_channel_id, austa_client_id, austa_hospital_id, 'scheduled',
            'Por Trás do Jaleco: A Rede de Cuidado Que Transforma Vidas',
            'CARROSSEL - DIA DO MÉDICO

SLIDE 1: POR TRÁS DO JALECO
A Rede de Cuidado Que Transforma Vidas

SLIDE 2: NO GRUPO AUSTA
Por trás de cada diagnóstico preciso e de cada tratamento bem-sucedido, existe uma equipe inteira trabalhando

SLIDE 3: MEDICINA COLABORATIVA
• Oncologistas especializados
• Cirurgiões experientes
• Anestesiologistas dedicados
• Enfermeiros cuidadosos
• Técnicos especializados

SLIDE 4: NOSSO DIFERENCIAL
Não é um único médico como herói, mas sim a rede de profissionais que trabalha em equipe

SLIDE 5: PARABÉNS A TODOS OS MÉDICOS
Que fazem do Grupo Austa um lugar de cuidado completo e integrado

#DiaDMédico #EquipeMultidisciplinar #GrupoAusta #CuidadoIntegral',
            '2024-10-18 10:00:00+00', 'Homenagem Profissional', 'agency',
            ARRAY['dia do médico', 'equipe', 'medicina colaborativa', 'carrossel']
        );
        
        -- Post 19: Dia mundial do combate ao câncer de mama
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, campanha_outubro_rosa_id, facebook_channel_id, austa_client_id, austa_clinica_id, 'scheduled',
            'A prevenção começa com cuidado que é um ciclo',
            'A PREVENÇÃO COMEÇA COM CUIDADO QUE É UM CICLO 🔄💖

Nós estamos com você em todas as etapas:

🔍 PREVENÇÃO
Exames regulares nas Austa Clínicas

🩺 DIAGNÓSTICO
Equipamentos de última geração

🏥 TRATAMENTO
Austa Hospital com equipe especializada

❤️ ACOMPANHAMENTO
Suporte durante toda a jornada

👥 SUPORTE
Cuidado humanizado e acolhedor

O seu cuidado é um ciclo completo de atenção. No Grupo Austa, você não está sozinha em nenhuma etapa.

#OutubroRosa #CuidadoCíclico #GrupoAusta #JuntasNaLuta',
            '2024-10-19 14:00:00+00', 'Cuidado Integral', 'agency',
            ARRAY['prevenção', 'cuidado cíclico', 'jornada', 'outubro rosa']
        );
        
        -- Post 20: Blog - Cobertura evento Famerp
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, blog_channel_id, austa_client_id, austa_hospital_id, 'scheduled',
            'Palestra no Evento FAMERP: Compartilhando Conhecimento',
            'PALESTRA NO EVENTO FAMERP: COMPARTILHANDO CONHECIMENTO

O Austa Hospital participou do evento da FAMERP (Faculdade de Medicina de São José do Rio Preto), reforçando nosso compromisso com a educação médica e o compartilhamento de conhecimento.

Nossa equipe de especialistas apresentou:
• Avanços em cirurgia oncológica
• Novas técnicas em anestesiologia
• Protocolos de cuidados paliativos
• Medicina integrativa e humanizada

Momento de Networking:
O evento proporcionou importante troca de experiências entre profissionais, fortalecendo a rede de cuidados da região.

Compromisso com a Educação:
Acreditamos que compartilhar conhecimento é fundamental para elevar o padrão de cuidados em saúde.

O Austa Hospital orgulha-se de contribuir para a formação de novos profissionais e o aperfeiçoamento contínuo da medicina.',
            '2024-10-20 08:00:00+00', 'Institucional', 'client',
            ARRAY['famerp', 'evento', 'educação médica', 'conhecimento']
        );
        
        -- Post 21: Blog - Osteoporose
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, blog_channel_id, austa_client_id, austa_clinica_id, 'scheduled',
            'Osteoporose: Prevenção e Cuidados',
            'OSTEOPOROSE: PREVENÇÃO É O MELHOR REMÉDIO

A osteoporose é uma condição que enfraquece os ossos, tornando-os mais propensos a fraturas. Mas a boa notícia é que pode ser prevenida!

Fatores de Risco:
• Idade avançada
• Menopausa
• Histórico familiar
• Sedentarismo
• Deficiência de cálcio e vitamina D

Prevenção Eficaz:
✓ Alimentação rica em cálcio
✓ Exercícios com peso
✓ Exposição solar adequada
✓ Evitar fumo e álcool
✓ Exames de densitometria óssea

Nas Austa Clínicas oferecemos:
• Densitometria óssea
• Avaliação nutricional
• Programas de exercícios
• Acompanhamento médico especializado

Cuide dos seus ossos hoje para ter uma vida ativa amanhã!',
            '2024-10-20 14:00:00+00', 'Prevenção', 'agency',
            ARRAY['osteoporose', 'prevenção', 'saúde óssea', 'densitometria']
        );
        
        -- Post 22: Apoio emocional câncer de mama
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, campanha_outubro_rosa_id, instagram_channel_id, austa_client_id, austa_hospital_id, 'scheduled',
            'Apoio Emocional na Jornada do Câncer de Mama',
            'VOCÊ NÃO ESTÁ SOZINHA NESSA JORNADA 💗

Enfrentar o câncer de mama vai além do tratamento médico. É preciso cuidar também das emoções.

🤗 PERMITA-SE SENTIR
Raiva, medo, tristeza são sentimentos normais

💪 BUSQUE APOIO
Família, amigos e grupos de apoio são fundamentais

📝 MANTENHA A ROTINA
Pequenas atividades mantêm a sensação de normalidade

🧘‍♀️ PRATIQUE AUTOCUIDADO
Meditação, leitura, música... encontre o que te faz bem

👩‍⚕️ CONFIE NA EQUIPE
No Austa Hospital, nossa equipe está preparada para cuidar de você integralmente

Cada dia é uma vitória. Você é mais forte do que imagina.

#OutubroRosa #ApoioEmocional #ForçaECoragem #AustaHospital',
            '2024-10-21 15:00:00+00', 'Apoio Emocional', 'agency',
            ARRAY['apoio emocional', 'câncer de mama', 'suporte', 'outubro rosa']
        );
        
        -- Post 23: Pronto Atendimento Virtual 24h
        INSERT INTO public.posts (org_id, campaign_id, channel_id, client_id, company_id, status, title, content, publish_at, theme, responsibility, tags)
        VALUES (
            org_id_var, NULL, facebook_channel_id, austa_client_id, austa_clinica_id, 'scheduled',
            'Pronto Atendimento Virtual 24h',
            'PRONTO ATENDIMENTO VIRTUAL 24H 📱🩺

Em parceria com a Conexa Saúde, oferecemos aos colaboradores de sua empresa:

⏰ DISPONIBILIDADE
24 horas por dia, 7 dias por semana

💻 PLATAFORMA DIGITAL
Acesso via www.conexasaude.com.br

👨‍⚕️ ATENDIMENTO MÉDICO
Orientações clínicas em poucos minutos

📋 RECEITAS DIGITAIS
Prescrições válidas e seguras

🏥 ENCAMINHAMENTO
Direcionamento às nossas unidades quando necessário

BENEFÍCIOS:
✓ Redução de custos para a empresa
✓ Conveniência para os colaboradores
✓ Atendimento imediato e seguro
✓ Continuidade do cuidado

Saúde digital que conecta você ao melhor cuidado!

#TelemedicinaAusta #SaúdeDigital #ConexaSaúde #AtendimentoVirtual',
            '2024-10-22 11:00:00+00', 'Serviço Digital', 'agency',
            ARRAY['telemedicina', 'pronto atendimento', 'saúde digital', 'conexa saúde']
        );

    END IF;
END $$;