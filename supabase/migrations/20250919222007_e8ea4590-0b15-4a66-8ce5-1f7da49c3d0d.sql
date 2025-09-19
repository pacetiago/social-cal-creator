-- Create clients table to match the old structure
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create companies table to match the old structure  
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#64748B',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Platform admins can manage all clients" 
ON public.clients 
FOR ALL 
USING (is_platform_admin());

CREATE POLICY "Users can view clients of their orgs" 
ON public.clients 
FOR SELECT 
USING (user_has_org_access(org_id));

CREATE POLICY "Org admins/owners can manage clients" 
ON public.clients 
FOR ALL 
USING (user_has_org_access(org_id) AND user_org_role(org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role]));

-- RLS Policies for companies
CREATE POLICY "Platform admins can manage all companies" 
ON public.companies 
FOR ALL 
USING (is_platform_admin());

CREATE POLICY "Users can view companies of their orgs" 
ON public.companies 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.clients 
  WHERE clients.id = companies.client_id 
  AND user_has_org_access(clients.org_id)
));

CREATE POLICY "Org admins/owners can manage companies" 
ON public.companies 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.clients 
  WHERE clients.id = companies.client_id 
  AND user_has_org_access(clients.org_id) 
  AND user_org_role(clients.org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role])
));

-- Add foreign keys to posts for clients and companies
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id),
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Create audit triggers
CREATE TRIGGER clients_audit_trigger 
AFTER INSERT OR UPDATE OR DELETE ON public.clients 
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER companies_audit_trigger 
AFTER INSERT OR UPDATE OR DELETE ON public.companies 
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Create updated_at triggers
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data with proper UUIDs
INSERT INTO public.clients (org_id, name, created_by) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Grupo Austa', 'b1f95a56-7a29-4fda-9589-89ff763299d3'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Cliente Demo', 'b1f95a56-7a29-4fda-9589-89ff763299d3');

-- Get the client IDs for inserting companies
DO $$
DECLARE
    austa_client_id UUID;
    demo_client_id UUID;
BEGIN
    SELECT id INTO austa_client_id FROM public.clients WHERE name = 'Grupo Austa' LIMIT 1;
    SELECT id INTO demo_client_id FROM public.clients WHERE name = 'Cliente Demo' LIMIT 1;
    
    IF austa_client_id IS NOT NULL THEN
        INSERT INTO public.companies (client_id, name, color, created_by) VALUES 
          (austa_client_id, 'Austa Clínica', '#4CAF50', 'b1f95a56-7a29-4fda-9589-89ff763299d3'),
          (austa_client_id, 'Austa Hospital', '#2196F3', 'b1f95a56-7a29-4fda-9589-89ff763299d3'),
          (austa_client_id, 'IMC', '#FF9800', 'b1f95a56-7a29-4fda-9589-89ff763299d3'),
          (austa_client_id, 'Todas unidades', '#9C27B0', 'b1f95a56-7a29-4fda-9589-89ff763299d3');
    END IF;
    
    IF demo_client_id IS NOT NULL THEN
        INSERT INTO public.companies (client_id, name, color, created_by) VALUES 
          (demo_client_id, 'Empresa Demo A', '#607D8B', 'b1f95a56-7a29-4fda-9589-89ff763299d3'),
          (demo_client_id, 'Empresa Demo B', '#8BC34A', 'b1f95a56-7a29-4fda-9589-89ff763299d3');
    END IF;
END $$;