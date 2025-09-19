-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user-client assignments table
CREATE TABLE public.user_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, client_id)
);

-- Enable RLS on user_clients
ALTER TABLE public.user_clients ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Security definer function to check if user can access client
CREATE OR REPLACE FUNCTION public.can_access_client(client_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admins can access all clients
  IF public.get_current_user_role() = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Regular users can only access assigned clients
  RETURN EXISTS (
    SELECT 1 FROM public.user_clients 
    WHERE user_id = auth.uid() AND user_clients.client_id = can_access_client.client_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all operations on calendar_posts" ON public.calendar_posts;
DROP POLICY IF EXISTS "Allow all operations on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow all operations on companies" ON public.companies;

-- Create secure RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Create secure RLS policies for user_clients
CREATE POLICY "Users can view their own client assignments" ON public.user_clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all client assignments" ON public.user_clients
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create secure RLS policies for clients
CREATE POLICY "Users can view assigned clients" ON public.clients
  FOR SELECT USING (public.can_access_client(id));

CREATE POLICY "Admins can manage all clients" ON public.clients
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create secure RLS policies for companies
CREATE POLICY "Users can view companies of assigned clients" ON public.companies
  FOR SELECT USING (public.can_access_client(client_id));

CREATE POLICY "Admins can manage all companies" ON public.companies
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create secure RLS policies for calendar_posts
CREATE POLICY "Users can view posts of assigned clients" ON public.calendar_posts
  FOR SELECT USING (public.can_access_client(client_id));

CREATE POLICY "Users can create posts for assigned clients" ON public.calendar_posts
  FOR INSERT WITH CHECK (public.can_access_client(client_id));

CREATE POLICY "Users can update posts of assigned clients" ON public.calendar_posts
  FOR UPDATE USING (public.can_access_client(client_id));

CREATE POLICY "Users can delete posts of assigned clients" ON public.calendar_posts
  FOR DELETE USING (public.can_access_client(client_id));

CREATE POLICY "Admins can manage all calendar posts" ON public.calendar_posts
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();