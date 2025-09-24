-- Create share tokens table for public calendar access
CREATE TABLE public.share_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on share_tokens
ALTER TABLE public.share_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for share_tokens
CREATE POLICY "Users can view their org tokens" 
ON public.share_tokens 
FOR SELECT 
USING (user_has_org_access(org_id));

CREATE POLICY "Org admins/owners can manage tokens" 
ON public.share_tokens 
FOR ALL 
USING (user_has_org_access(org_id) AND (user_org_role(org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role])));

-- Create function to generate share token
CREATE OR REPLACE FUNCTION public.generate_share_token(target_org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token TEXT;
BEGIN
  -- Check if user has permission
  IF NOT (user_has_org_access(target_org_id) AND (user_org_role(target_org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role]))) THEN
    RAISE EXCEPTION 'Insufficient permissions to generate share token';
  END IF;
  
  -- Generate random token
  new_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Deactivate existing tokens for this org
  UPDATE public.share_tokens 
  SET is_active = false 
  WHERE org_id = target_org_id AND is_active = true;
  
  -- Insert new token
  INSERT INTO public.share_tokens (org_id, token, created_by)
  VALUES (target_org_id, new_token, auth.uid());
  
  RETURN new_token;
END;
$$;

-- Delete all posts from grupo-austa organization
DELETE FROM public.posts 
WHERE org_id = (
  SELECT id FROM public.orgs WHERE slug = 'grupo-austa'
);