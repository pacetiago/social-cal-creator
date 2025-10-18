-- Fix hash_token function to set search_path for security
CREATE OR REPLACE FUNCTION hash_token(token_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(digest(token_input, 'sha256'), 'hex');
END;
$$;