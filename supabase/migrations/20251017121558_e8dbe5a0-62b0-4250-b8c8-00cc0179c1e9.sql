-- ==========================================
-- Migration: Implement SHA-256 hashing for share tokens
-- Purpose: Fix SECRETS_EXPOSED security issue by hashing tokens
-- ==========================================

-- 1) Add a function to hash tokens using SHA-256
CREATE OR REPLACE FUNCTION hash_token(token_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN encode(digest(token_input, 'sha256'), 'hex');
END;
$$;

-- 2) Hash all existing tokens in the share_tokens table
UPDATE share_tokens 
SET token = encode(digest(token, 'sha256'), 'hex')
WHERE length(token) != 64; -- Only hash if not already hashed (SHA-256 produces 64 hex chars)

-- 3) Update the generate_share_token function to store hashed tokens
CREATE OR REPLACE FUNCTION public.generate_share_token(target_org_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_token TEXT;
  hashed_token TEXT;
BEGIN
  -- Check if user has permission: platform admin OR org owner/admin
  IF NOT (is_platform_admin() OR (user_has_org_access(target_org_id) AND (user_org_role(target_org_id) = ANY (ARRAY['OWNER'::user_role, 'ADMIN'::user_role])))) THEN
    RAISE EXCEPTION 'Insufficient permissions to generate share token';
  END IF;
  
  -- Generate random token (this will be returned to the user)
  new_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Hash the token for storage
  hashed_token := encode(digest(new_token, 'sha256'), 'hex');
  
  -- Deactivate existing tokens for this org
  UPDATE public.share_tokens 
  SET is_active = false 
  WHERE org_id = target_org_id AND is_active = true;
  
  -- Insert new hashed token
  INSERT INTO public.share_tokens (org_id, token, created_by)
  VALUES (target_org_id, hashed_token, auth.uid());
  
  -- Log token generation in audit log
  INSERT INTO public.audit_log (
    org_id, actor_id, action, target_table, target_id, diff
  ) VALUES (
    target_org_id,
    auth.uid(),
    'GENERATE_SHARE_TOKEN',
    'share_tokens',
    target_org_id,
    jsonb_build_object('action', 'token_generated', 'timestamp', now())
  );
  
  -- Return the unhashed token to the user (this is the ONLY time they'll see it)
  RETURN new_token;
END;
$function$;