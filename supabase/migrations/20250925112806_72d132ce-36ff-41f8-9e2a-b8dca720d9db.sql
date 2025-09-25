-- Create client "Grupo Austa" for the grupo-austa organization
INSERT INTO public.clients (org_id, name, created_by)
SELECT id, 'Grupo Austa', NULL
FROM public.orgs 
WHERE slug = 'grupo-austa';

-- Create companies for Grupo Austa client
WITH grupo_austa_client AS (
  SELECT c.id as client_id
  FROM public.clients c
  JOIN public.orgs o ON c.org_id = o.id
  WHERE o.slug = 'grupo-austa' AND c.name = 'Grupo Austa'
)
INSERT INTO public.companies (client_id, name, color, created_by)
SELECT 
  client_id,
  company_name,
  company_color,
  NULL
FROM grupo_austa_client
CROSS JOIN (
  VALUES 
    ('Austa Energia', '#10B981'),
    ('Austa Infraestrutura', '#3B82F6'),
    ('Austa Tecnologia', '#8B5CF6'),
    ('Austa Sustentabilidade', '#059669')
) AS companies(company_name, company_color);