-- DROP EXISTING TABLES AND START FRESH
DROP TABLE IF EXISTS calendar_posts;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS user_clients;

-- CREATE ENUMS
CREATE TYPE public.user_role AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');
CREATE TYPE public.post_status AS ENUM ('idea', 'draft', 'review', 'approved', 'scheduled', 'published');
CREATE TYPE public.channel_key AS ENUM ('instagram', 'linkedin', 'x', 'tiktok', 'youtube');
CREATE TYPE public.asset_kind AS ENUM ('image', 'video', 'doc');
CREATE TYPE public.filter_type AS ENUM ('theme', 'persona', 'tag');

-- ORGANIZATIONS TABLE (previously clients)
CREATE TABLE public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- MEMBERSHIPS TABLE (replaces user_clients with roles)
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'VIEWER',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, org_id)
);

-- CHANNELS TABLE
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  key public.channel_key NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- FILTERS TABLE
CREATE TABLE public.filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  type public.filter_type NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- CAMPAIGNS TABLE
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  utm_source TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- POSTS TABLE (replaces calendar_posts)
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  status public.post_status DEFAULT 'idea',
  title TEXT NOT NULL,
  content TEXT,
  publish_at TIMESTAMPTZ,
  persona TEXT,
  theme TEXT,
  tags TEXT[],
  utm_source TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  insights TEXT,
  variations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- ASSETS TABLE
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  kind public.asset_kind NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- APPROVALS TABLE
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  approved_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected', 'pending')),
  comments TEXT,
  approved_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AUDIT_LOG TABLE
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  diff JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CREATE INDEXES
CREATE INDEX idx_orgs_slug ON public.orgs(slug);
CREATE INDEX idx_memberships_user_org ON public.memberships(user_id, org_id);
CREATE INDEX idx_memberships_org_role ON public.memberships(org_id, role);
CREATE INDEX idx_posts_org_status ON public.posts(org_id, status);
CREATE INDEX idx_posts_org_publish_at ON public.posts(org_id, publish_at);
CREATE INDEX idx_posts_campaign ON public.posts(campaign_id);
CREATE INDEX idx_channels_org_active ON public.channels(org_id, is_active);
CREATE INDEX idx_filters_org_type ON public.filters(org_id, type);
CREATE INDEX idx_assets_post ON public.assets(post_id);
CREATE INDEX idx_approvals_post ON public.approvals(post_id);
CREATE INDEX idx_audit_org_created ON public.audit_log(org_id, created_at);

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- FUNCTIONS FOR RLS
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((auth.jwt() ->> 'role') = 'platform_admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_has_org_access(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND org_id = target_org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS POLICIES FOR ORGS
CREATE POLICY "Platform admins can manage all orgs" ON public.orgs
  FOR ALL USING (public.is_platform_admin());

CREATE POLICY "Users can view their org" ON public.orgs
  FOR SELECT USING (public.user_has_org_access(id));

-- RLS POLICIES FOR MEMBERSHIPS
CREATE POLICY "Platform admins can manage all memberships" ON public.memberships
  FOR ALL USING (public.is_platform_admin());

CREATE POLICY "Users can view memberships of their orgs" ON public.memberships
  FOR SELECT USING (public.user_has_org_access(org_id));

CREATE POLICY "Org owners/admins can manage memberships" ON public.memberships
  FOR ALL USING (
    public.user_has_org_access(org_id) AND 
    public.user_org_role(org_id) IN ('OWNER', 'ADMIN')
  );

-- RLS POLICIES FOR CHANNELS
CREATE POLICY "Platform admins can manage all channels" ON public.channels
  FOR ALL USING (public.is_platform_admin());

CREATE POLICY "Users can view channels of their orgs" ON public.channels
  FOR SELECT USING (public.user_has_org_access(org_id));

CREATE POLICY "Org admins/owners can manage channels" ON public.channels
  FOR ALL USING (
    public.user_has_org_access(org_id) AND 
    public.user_org_role(org_id) IN ('OWNER', 'ADMIN')
  );

-- RLS POLICIES FOR FILTERS
CREATE POLICY "Platform admins can manage all filters" ON public.filters
  FOR ALL USING (public.is_platform_admin());

CREATE POLICY "Users can view filters of their orgs" ON public.filters
  FOR SELECT USING (public.user_has_org_access(org_id));

CREATE POLICY "Org admins/owners can manage filters" ON public.filters
  FOR ALL USING (
    public.user_has_org_access(org_id) AND 
    public.user_org_role(org_id) IN ('OWNER', 'ADMIN')
  );

-- RLS POLICIES FOR CAMPAIGNS
CREATE POLICY "Platform admins can manage all campaigns" ON public.campaigns
  FOR ALL USING (public.is_platform_admin());

CREATE POLICY "Users can view campaigns of their orgs" ON public.campaigns
  FOR SELECT USING (public.user_has_org_access(org_id));

CREATE POLICY "Org admins/owners can manage campaigns" ON public.campaigns
  FOR ALL USING (
    public.user_has_org_access(org_id) AND 
    public.user_org_role(org_id) IN ('OWNER', 'ADMIN')
  );

-- RLS POLICIES FOR POSTS
CREATE POLICY "Platform admins can manage all posts" ON public.posts
  FOR ALL USING (public.is_platform_admin());

CREATE POLICY "Users can view posts of their orgs" ON public.posts
  FOR SELECT USING (public.user_has_org_access(org_id));

CREATE POLICY "Editors can create/update posts" ON public.posts
  FOR INSERT WITH CHECK (
    public.user_has_org_access(org_id) AND 
    public.user_org_role(org_id) IN ('OWNER', 'ADMIN', 'EDITOR')
  );

CREATE POLICY "Editors can update their posts" ON public.posts
  FOR UPDATE USING (
    public.user_has_org_access(org_id) AND 
    public.user_org_role(org_id) IN ('OWNER', 'ADMIN', 'EDITOR')
  );

CREATE POLICY "Admins/owners can delete posts" ON public.posts
  FOR DELETE USING (
    public.user_has_org_access(org_id) AND 
    public.user_org_role(org_id) IN ('OWNER', 'ADMIN')
  );

-- RLS POLICIES FOR ASSETS
CREATE POLICY "Platform admins can manage all assets" ON public.assets
  FOR ALL USING (public.is_platform_admin());

CREATE POLICY "Users can view assets of their orgs" ON public.assets
  FOR SELECT USING (public.user_has_org_access(org_id));

CREATE POLICY "Editors can manage assets" ON public.assets
  FOR ALL USING (
    public.user_has_org_access(org_id) AND 
    public.user_org_role(org_id) IN ('OWNER', 'ADMIN', 'EDITOR')
  );

-- RLS POLICIES FOR APPROVALS
CREATE POLICY "Platform admins can manage all approvals" ON public.approvals
  FOR ALL USING (public.is_platform_admin());

CREATE POLICY "Users can view approvals of their orgs" ON public.approvals
  FOR SELECT USING (public.user_has_org_access(org_id));

CREATE POLICY "Admins/owners can approve posts" ON public.approvals
  FOR INSERT WITH CHECK (
    public.user_has_org_access(org_id) AND 
    public.user_org_role(org_id) IN ('OWNER', 'ADMIN')
  );

-- RLS POLICIES FOR AUDIT_LOG
CREATE POLICY "Platform admins can view all audit logs" ON public.audit_log
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY "Org members can view their org audit logs" ON public.audit_log
  FOR SELECT USING (public.user_has_org_access(org_id));

-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orgs_updated_at BEFORE UPDATE ON public.orgs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER memberships_updated_at BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER channels_updated_at BEFORE UPDATE ON public.channels
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER filters_updated_at BEFORE UPDATE ON public.filters
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER assets_updated_at BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER approvals_updated_at BEFORE UPDATE ON public.approvals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- AUDIT TRIGGER FUNCTION
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE AUDIT TRIGGERS
CREATE TRIGGER audit_orgs AFTER INSERT OR UPDATE OR DELETE ON public.orgs
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_posts AFTER INSERT OR UPDATE OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_campaigns AFTER INSERT OR UPDATE OR DELETE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_memberships AFTER INSERT OR UPDATE OR DELETE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- SEED DATA
INSERT INTO public.orgs (id, name, slug, created_by, updated_by) VALUES
  ('demo-org-id', 'Demo Agency', 'demo', NULL, NULL),
  ('varejo-org-id', 'Varejo Brasil', 'varejo-br', NULL, NULL);

INSERT INTO public.channels (org_id, key, name) VALUES
  ('demo-org-id', 'instagram', 'Instagram'),
  ('demo-org-id', 'linkedin', 'LinkedIn'),
  ('demo-org-id', 'x', 'X (Twitter)'),
  ('varejo-org-id', 'instagram', 'Instagram'),
  ('varejo-org-id', 'tiktok', 'TikTok'),
  ('varejo-org-id', 'youtube', 'YouTube');

INSERT INTO public.filters (org_id, type, name, value, color) VALUES
  ('demo-org-id', 'theme', 'Institucional', 'institucional', '#2196F3'),
  ('demo-org-id', 'theme', 'Sazonal', 'sazonal', '#4CAF50'),
  ('demo-org-id', 'persona', 'Pacientes', 'pacientes', '#FF9800'),
  ('varejo-org-id', 'theme', 'Promocional', 'promocional', '#E91E63'),
  ('varejo-org-id', 'persona', 'Jovens', 'jovens', '#9C27B0');

INSERT INTO public.campaigns (org_id, name, description, utm_source, utm_campaign) VALUES
  ('demo-org-id', 'Outubro Rosa 2024', 'Campanha de conscientização sobre câncer de mama', 'instagram', 'outubro-rosa'),
  ('demo-org-id', 'Dia do Médico', 'Homenagem aos profissionais de saúde', 'social', 'dia-medico'),
  ('varejo-org-id', 'Black Friday 2024', 'Maior campanha de vendas do ano', 'social', 'black-friday');

INSERT INTO public.posts (org_id, campaign_id, title, content, status, persona, theme, publish_at) VALUES
  ('demo-org-id', (SELECT id FROM campaigns WHERE name = 'Outubro Rosa 2024'), 'Diagnóstico Preciso', 'Tecnologia de ponta para diagnósticos precisos.', 'published', 'pacientes', 'institucional', '2024-10-02 10:00:00'),
  ('demo-org-id', (SELECT id FROM campaigns WHERE name = 'Dia do Médico'), 'Homenagem aos Médicos', 'Reconhecendo a dedicação dos nossos profissionais.', 'approved', 'pacientes', 'institucional', '2024-10-18 15:00:00'),
  ('varejo-org-id', (SELECT id FROM campaigns WHERE name = 'Black Friday 2024'), 'Ofertas Imperdíveis', 'As melhores ofertas estão chegando!', 'draft', 'jovens', 'promocional', '2024-11-29 08:00:00');