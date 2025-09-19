-- 1. Create security definer function for organization creation
CREATE OR REPLACE FUNCTION public.create_org_with_owner(org_name text, org_slug text)
RETURNS uuid AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- Insert organization
  INSERT INTO public.orgs (name, slug, status, created_by)
  VALUES (org_name, org_slug, 'active', auth.uid())
  RETURNING id INTO new_org_id;
  
  -- Create owner membership
  INSERT INTO public.memberships (user_id, org_id, role, created_by)
  VALUES (auth.uid(), new_org_id, 'OWNER', auth.uid());
  
  RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Add responsibility column to posts
CREATE TYPE post_responsibility AS ENUM ('client', 'agency');

ALTER TABLE public.posts 
ADD COLUMN responsibility post_responsibility DEFAULT 'agency';

-- 3. Add updated_at trigger to posts table if not exists
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();