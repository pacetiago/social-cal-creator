-- ADD SEED DATA
INSERT INTO public.orgs (id, name, slug, created_by, updated_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Demo Agency', 'demo', NULL, NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'Varejo Brasil', 'varejo-br', NULL, NULL);

INSERT INTO public.channels (org_id, key, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'instagram', 'Instagram'),
  ('550e8400-e29b-41d4-a716-446655440001', 'linkedin', 'LinkedIn'),
  ('550e8400-e29b-41d4-a716-446655440001', 'x', 'X (Twitter)'),
  ('550e8400-e29b-41d4-a716-446655440002', 'instagram', 'Instagram'),
  ('550e8400-e29b-41d4-a716-446655440002', 'tiktok', 'TikTok'),
  ('550e8400-e29b-41d4-a716-446655440002', 'youtube', 'YouTube');

INSERT INTO public.filters (org_id, type, name, value, color) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'theme', 'Institucional', 'institucional', '#2196F3'),
  ('550e8400-e29b-41d4-a716-446655440001', 'theme', 'Sazonal', 'sazonal', '#4CAF50'),
  ('550e8400-e29b-41d4-a716-446655440001', 'persona', 'Pacientes', 'pacientes', '#FF9800'),
  ('550e8400-e29b-41d4-a716-446655440002', 'theme', 'Promocional', 'promocional', '#E91E63'),
  ('550e8400-e29b-41d4-a716-446655440002', 'persona', 'Jovens', 'jovens', '#9C27B0');

INSERT INTO public.campaigns (org_id, name, description, utm_source, utm_campaign) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Outubro Rosa 2024', 'Campanha de conscientização sobre câncer de mama', 'instagram', 'outubro-rosa'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Dia do Médico', 'Homenagem aos profissionais de saúde', 'social', 'dia-medico'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Black Friday 2024', 'Maior campanha de vendas do ano', 'social', 'black-friday');

-- FIX SECURITY ISSUES - ADD SEARCH PATH TO FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((auth.jwt() ->> 'role') = 'platform_admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_has_org_access(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND org_id = target_org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_org_role(target_org_id UUID)
RETURNS public.user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND org_id = target_org_id
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  org_id_value UUID;
  old_data JSONB;
  new_data JSONB;
  diff_data JSONB;
BEGIN
  -- Extract org_id from record
  IF TG_OP = 'DELETE' THEN
    org_id_value := OLD.org_id;
    old_data := to_jsonb(OLD);
    new_data := NULL;
  ELSE
    org_id_value := NEW.org_id;
    new_data := to_jsonb(NEW);
    IF TG_OP = 'UPDATE' THEN
      old_data := to_jsonb(OLD);
    ELSE
      old_data := NULL;
    END IF;
  END IF;
  
  -- Calculate diff for updates
  IF TG_OP = 'UPDATE' THEN
    SELECT jsonb_object_agg(key, jsonb_build_object('old', old_data->key, 'new', new_data->key))
    INTO diff_data
    FROM jsonb_each(new_data)
    WHERE new_data->key IS DISTINCT FROM old_data->key;
  END IF;
  
  -- Insert audit record
  INSERT INTO public.audit_log (
    org_id, actor_id, action, target_table, target_id, diff
  ) VALUES (
    org_id_value,
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    COALESCE(diff_data, new_data)
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;