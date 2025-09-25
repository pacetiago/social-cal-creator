-- CRITICAL SECURITY FIXES

-- 1. Fix Profile Table RLS Policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "authenticated_users_own_profile_select" ON public.profiles;
DROP POLICY IF EXISTS "platform_admins_all_profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_own_profile_update" ON public.profiles;
DROP POLICY IF EXISTS "platform_admins_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "platform_admins_delete_profiles" ON public.profiles;

-- Create secure profile policies
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Platform admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_platform_admin());

CREATE POLICY "Users can update own profile (non-role fields)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent role self-modification
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Platform admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (is_platform_admin())
WITH CHECK (is_platform_admin());

CREATE POLICY "Platform admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (is_platform_admin());

CREATE POLICY "Platform admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (is_platform_admin());

-- 2. Add constraints to prevent unauthorized role changes
ALTER TABLE public.profiles 
ADD CONSTRAINT check_role_values 
CHECK (role IN ('user', 'admin', 'platform_admin'));

-- 3. Create security definer function for safe role checks
CREATE OR REPLACE FUNCTION public.get_user_role_secure(user_id uuid)
RETURNS TEXT AS $$
BEGIN
  -- Only allow checking own role or if platform admin
  IF auth.uid() = user_id OR is_platform_admin() THEN
    RETURN (SELECT role FROM public.profiles WHERE id = user_id);
  END IF;
  
  -- Return null for unauthorized access
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 4. Add audit trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any role changes
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.audit_log (
      actor_id, action, target_table, target_id, diff
    ) VALUES (
      auth.uid(),
      'ROLE_CHANGE',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER role_change_audit
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.audit_role_changes();

-- 5. Add rate limiting table for authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  email text,
  attempt_count integer DEFAULT 1,
  last_attempt timestamptz DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_ip ON public.auth_rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_email ON public.auth_rate_limits(email);

-- Enable RLS on rate limits table
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only platform admins can view rate limit data
CREATE POLICY "Platform admins can view rate limits" 
ON public.auth_rate_limits 
FOR SELECT 
USING (is_platform_admin());