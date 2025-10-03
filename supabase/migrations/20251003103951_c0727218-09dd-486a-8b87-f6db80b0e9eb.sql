-- Fix generate_share_token to allow platform admins
CREATE OR REPLACE FUNCTION public.generate_share_token(target_org_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_token TEXT;
BEGIN
  -- Check if user has permission: platform admin OR org owner/admin
  IF NOT (is_platform_admin() OR (user_has_org_access(target_org_id) AND (user_org_role(target_org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role])))) THEN
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
$function$;