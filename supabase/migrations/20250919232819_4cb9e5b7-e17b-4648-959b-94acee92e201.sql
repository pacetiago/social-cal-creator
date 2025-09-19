-- Corrigir para usar nome genérico ao invés de "Austa Digital"
UPDATE public.orgs 
SET name = 'Cronograma Editorial' 
WHERE name = 'Austa Digital';

-- Atualizar slug para ser genérico também
UPDATE public.orgs 
SET slug = 'cronograma' 
WHERE slug = 'austa-digital';