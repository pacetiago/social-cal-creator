-- Restore public read access to calendar posts while keeping write operations secured
DROP POLICY IF EXISTS "Authenticated users can view posts of assigned clients" ON public.calendar_posts;

-- Allow public read access to calendar posts
CREATE POLICY "Public users can view calendar posts" 
ON public.calendar_posts 
FOR SELECT 
USING (true);

-- Keep write operations secured (INSERT, UPDATE, DELETE remain authenticated only)
-- The existing policies for INSERT, UPDATE, DELETE are already properly secured

-- Also allow public read access to clients and companies for filtering
DROP POLICY IF EXISTS "Authenticated users can view assigned clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can view companies of assigned clients" ON public.companies;

CREATE POLICY "Public users can view clients" 
ON public.clients 
FOR SELECT 
USING (true);

CREATE POLICY "Public users can view companies" 
ON public.companies 
FOR SELECT 
USING (true);