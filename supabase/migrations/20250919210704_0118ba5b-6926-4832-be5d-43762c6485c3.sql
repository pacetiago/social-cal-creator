-- Remove public read access to protect marketing content from competitors
DROP POLICY IF EXISTS "Public users can view calendar posts" ON public.calendar_posts;
DROP POLICY IF EXISTS "Public users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Public users can view companies" ON public.companies;

-- Restore secure access - only authenticated users with proper client assignments
CREATE POLICY "Authenticated users can view posts of assigned clients" 
ON public.calendar_posts 
FOR SELECT 
USING ((auth.uid() IS NOT NULL) AND can_access_client(client_id));

CREATE POLICY "Authenticated users can view assigned clients" 
ON public.clients 
FOR SELECT 
USING ((auth.uid() IS NOT NULL) AND can_access_client(id));

CREATE POLICY "Authenticated users can view companies of assigned clients" 
ON public.companies 
FOR SELECT 
USING ((auth.uid() IS NOT NULL) AND can_access_client(client_id));