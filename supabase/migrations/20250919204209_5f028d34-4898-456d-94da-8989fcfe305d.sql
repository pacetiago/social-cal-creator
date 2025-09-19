-- Secure client and company data from public access
-- Only authenticated users should see client/company information

-- Drop existing public read policies for clients and companies
DROP POLICY IF EXISTS "Anyone can view clients" ON public.clients;
DROP POLICY IF EXISTS "Anyone can view companies" ON public.companies;

-- Create secure policies - only authenticated users can see client/company data
CREATE POLICY "Authenticated users can view assigned clients" ON public.clients
  FOR SELECT USING (auth.uid() IS NOT NULL AND public.can_access_client(id));

CREATE POLICY "Authenticated users can view companies of assigned clients" ON public.companies
  FOR SELECT USING (auth.uid() IS NOT NULL AND public.can_access_client(client_id));

-- Add public display names for calendar posts (optional generic labels)
ALTER TABLE public.calendar_posts 
ADD COLUMN IF NOT EXISTS public_client_name TEXT,
ADD COLUMN IF NOT EXISTS public_company_name TEXT;

-- Update existing posts with generic names for public display
UPDATE public.calendar_posts 
SET 
  public_client_name = 'Cliente',
  public_company_name = 'Empresa'
WHERE public_client_name IS NULL OR public_company_name IS NULL;