-- Link assets to posts so they appear in embedded queries (CalendarView expects post.assets)
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

-- Speed up lookups by post
CREATE INDEX IF NOT EXISTS idx_assets_post_id ON public.assets(post_id);