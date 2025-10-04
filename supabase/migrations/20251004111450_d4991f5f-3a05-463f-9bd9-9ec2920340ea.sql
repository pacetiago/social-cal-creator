-- ============================================================================
-- CRITICAL SECURITY FIX: Separate User Roles & Add RLS Protections
-- ============================================================================

-- 1. Create platform_role enum
CREATE TYPE public.platform_role AS ENUM ('platform_admin', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role platform_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check platform roles
CREATE OR REPLACE FUNCTION public.has_platform_role(_user_id UUID, _role platform_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Migrate existing admin users from profiles.role to user_roles
INSERT INTO public.user_roles (user_id, role, created_by)
SELECT id, 'platform_admin'::platform_role, id
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert all users as 'user' role (default)
INSERT INTO public.user_roles (user_id, role, created_by)
SELECT id, 'user'::platform_role, id
FROM public.profiles
WHERE role != 'admin' OR role IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Update is_platform_admin() function to use new table
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.has_platform_role(auth.uid(), 'platform_admin');
END;
$$;

-- 6. Add RLS policies for user_roles table
CREATE POLICY "Platform admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_platform_role(auth.uid(), 'platform_admin'))
WITH CHECK (public.has_platform_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Explicitly block anonymous access
CREATE POLICY "Block anonymous access to user_roles"
ON public.user_roles
FOR ALL
TO anon
USING (false);

-- 7. Add explicit DENY policies for security-sensitive tables

-- Profiles: Block anonymous/public access to email addresses
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

CREATE POLICY "Block public access to profiles"
ON public.profiles
FOR ALL
TO public
USING (false);

-- Auth rate limits: Block all non-admin access
CREATE POLICY "Block public insert on auth_rate_limits"
ON public.auth_rate_limits
FOR INSERT
TO public
WITH CHECK (false);

CREATE POLICY "Block public update on auth_rate_limits"
ON public.auth_rate_limits
FOR UPDATE
TO public
USING (false);

CREATE POLICY "Block public delete on auth_rate_limits"
ON public.auth_rate_limits
FOR DELETE
TO public
USING (false);

CREATE POLICY "Block anonymous access to auth_rate_limits"
ON public.auth_rate_limits
FOR ALL
TO anon
USING (false);

-- Audit log: Block all user modifications (only system can write)
CREATE POLICY "Block user insert on audit_log"
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Block user update on audit_log"
ON public.audit_log
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Block user delete on audit_log"
ON public.audit_log
FOR DELETE
TO authenticated
USING (false);

CREATE POLICY "Block anonymous access to audit_log"
ON public.audit_log
FOR ALL
TO anon
USING (false);

CREATE POLICY "Block public access to audit_log"
ON public.audit_log
FOR ALL
TO public
USING (false);

-- 8. Update audit_role_changes trigger to log role changes in user_roles
CREATE OR REPLACE FUNCTION public.audit_user_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (
      actor_id, action, target_table, target_id, diff
    ) VALUES (
      COALESCE(NEW.created_by, auth.uid()),
      'ROLE_ASSIGNED',
      'user_roles',
      NEW.user_id,
      jsonb_build_object(
        'role', NEW.role,
        'assigned_by', COALESCE(NEW.created_by, auth.uid())
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (
      actor_id, action, target_table, target_id, diff
    ) VALUES (
      auth.uid(),
      'ROLE_REMOVED',
      'user_roles',
      OLD.user_id,
      jsonb_build_object(
        'role', OLD.role,
        'removed_by', auth.uid()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_user_role_changes_trigger
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.audit_user_role_changes();

-- 9. Update get_current_user_role to use new system
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN public.has_platform_role(auth.uid(), 'platform_admin') THEN 'admin'
    ELSE 'user'
  END;
$$;

-- 10. Keep profiles.role for backward compatibility but mark as deprecated
COMMENT ON COLUMN public.profiles.role IS 'DEPRECATED: Use user_roles table instead. This column is kept for backward compatibility only.';