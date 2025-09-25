-- Create a sample post to test the system
INSERT INTO public.posts (
  org_id, 
  client_id, 
  company_id,
  title, 
  content, 
  status, 
  responsibility,
  publish_at,
  theme,
  persona,
  insights
)
SELECT 
  o.id as org_id,
  c.id as client_id,
  comp.id as company_id,
  'Post de Teste - Sistema Funcionando',
  'Este é um post de teste para verificar se o sistema está funcionando corretamente após as correções.',
  'idea'::post_status,
  'agency'::post_responsibility,
  NOW() + INTERVAL '1 day',
  'Teste do Sistema',
  'Equipe Técnica',
  'Post criado para validar o funcionamento completo do calendário editorial.'
FROM public.orgs o
JOIN public.clients c ON c.org_id = o.id
JOIN public.companies comp ON comp.client_id = c.id
WHERE o.slug = 'grupo-austa' 
  AND c.name = 'Grupo Austa'
  AND comp.name = 'Austa Energia'
LIMIT 1;