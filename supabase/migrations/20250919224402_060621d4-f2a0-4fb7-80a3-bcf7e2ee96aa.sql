-- Fix search path security warnings for existing functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_access_client(client_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.user_has_org_access(target_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND org_id = target_org_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_org_role(target_org_id uuid)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN (
    SELECT role FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND org_id = target_org_id
    LIMIT 1
  );
END;
$function$;