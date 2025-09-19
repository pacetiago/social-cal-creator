-- Create ENUM types for calendar posts
CREATE TYPE social_network AS ENUM ('Facebook', 'Instagram', 'LinkedIn', 'Site');
CREATE TYPE editorial_line AS ENUM ('SAZONAL', 'INSTITUCIONAL', 'BLOG', 'ROTEIRO');
CREATE TYPE media_type AS ENUM ('Imagem', 'Vídeo', 'Carrossel', 'Texto blog');
CREATE TYPE channel_type AS ENUM ('Feed', 'Story', 'Feed e Story', 'Site');
CREATE TYPE responsibility_type AS ENUM ('Agência', 'Cliente');

-- Create clients table
CREATE TABLE public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create companies table
CREATE TABLE public.companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  group_name TEXT,
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create calendar_posts table
CREATE TABLE public.calendar_posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  day INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  networks social_network[] NOT NULL DEFAULT '{}',
  channels channel_type[] NOT NULL DEFAULT '{}',
  media_type media_type NOT NULL,
  editorial_line editorial_line NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  responsibility responsibility_type NOT NULL,
  insight TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public access for now since no auth yet)
CREATE POLICY "Allow all operations on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on companies" ON public.companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on calendar_posts" ON public.calendar_posts FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_posts_updated_at
  BEFORE UPDATE ON public.calendar_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.clients (id, name) VALUES 
  ('austa', 'Grupo Austa'),
  ('cliente-exemplo', 'Cliente Exemplo');

INSERT INTO public.companies (id, name, color, group_name, client_id) VALUES 
  ('austa-clinica', 'Austa Clínica', '#4CAF50', 'Grupo Austa', 'austa'),
  ('austa-hospital', 'Austa Hospital', '#2196F3', 'Grupo Austa', 'austa'),
  ('imc', 'IMC', '#FF9800', 'Grupo Austa', 'austa'),
  ('todas-unidades', 'Todas unidades', '#9C27B0', 'Grupo Austa', 'austa'),
  ('austa-clinica-imc', 'Austa Clínica e IMC', '#E91E63', 'Grupo Austa', 'austa'),
  ('austa-clinica-hospital', 'Austa Clínica e Hospital', '#00BCD4', 'Grupo Austa', 'austa'),
  ('imc-austa-hospital', 'IMC e Austa Hospital', '#795548', 'Grupo Austa', 'austa'),
  ('empresa-exemplo-1', 'Empresa A', '#607D8B', NULL, 'cliente-exemplo'),
  ('empresa-exemplo-2', 'Empresa B', '#8BC34A', NULL, 'cliente-exemplo');