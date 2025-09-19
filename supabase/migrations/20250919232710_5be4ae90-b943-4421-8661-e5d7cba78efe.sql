-- Corrigir últimas referências a "Demo Agency" no banco de dados
UPDATE public.orgs 
SET name = 'Austa Digital' 
WHERE name = 'Demo Agency';

-- Garantir que qualquer slug 'demo' seja também atualizado
UPDATE public.orgs 
SET slug = 'austa-digital' 
WHERE slug = 'demo';