-- Add FK for assets.post_id -> posts.id and supporting index, safely if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assets_post_id_fkey'
  ) THEN
    ALTER TABLE public.assets
    ADD CONSTRAINT assets_post_id_fkey
    FOREIGN KEY (post_id)
    REFERENCES public.posts(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Index to speed up joins/lookups
CREATE INDEX IF NOT EXISTS idx_assets_post_id ON public.assets(post_id);
