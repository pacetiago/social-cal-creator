-- Update RLS policies to allow public viewing but require auth for editing

-- Drop existing policies for calendar_posts
DROP POLICY IF EXISTS "Users can view posts of assigned clients" ON public.calendar_posts;
DROP POLICY IF EXISTS "Users can create posts for assigned clients" ON public.calendar_posts;
DROP POLICY IF EXISTS "Users can update posts of assigned clients" ON public.calendar_posts;
DROP POLICY IF EXISTS "Users can delete posts of assigned clients" ON public.calendar_posts;
DROP POLICY IF EXISTS "Admins can manage all calendar posts" ON public.calendar_posts;

-- Drop existing policies for clients and companies
DROP POLICY IF EXISTS "Users can view assigned clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view companies of assigned clients" ON public.companies;
DROP POLICY IF EXISTS "Admins can manage all companies" ON public.companies;

-- Create new policies for public viewing with authenticated editing

-- Calendar posts: Public read, authenticated write
CREATE POLICY "Anyone can view calendar posts" ON public.calendar_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts for assigned clients" ON public.calendar_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND public.can_access_client(client_id));

CREATE POLICY "Authenticated users can update posts of assigned clients" ON public.calendar_posts
  FOR UPDATE USING (auth.uid() IS NOT NULL AND public.can_access_client(client_id));

CREATE POLICY "Authenticated users can delete posts of assigned clients" ON public.calendar_posts
  FOR DELETE USING (auth.uid() IS NOT NULL AND public.can_access_client(client_id));

-- Clients: Public read, admin write
CREATE POLICY "Anyone can view clients" ON public.clients
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all clients" ON public.clients
  FOR ALL USING (auth.uid() IS NOT NULL AND public.get_current_user_role() = 'admin');

-- Companies: Public read, admin write
CREATE POLICY "Anyone can view companies" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all companies" ON public.companies
  FOR ALL USING (auth.uid() IS NOT NULL AND public.get_current_user_role() = 'admin');