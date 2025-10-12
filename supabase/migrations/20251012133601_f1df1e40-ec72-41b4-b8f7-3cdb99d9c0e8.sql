-- Ensure assets are linked to posts so PostgREST can embed assets(*) in post queries
DO $$ BEGIN
  -- Add foreign key if not exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'assets'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name = 'assets_post_id_fkey'
  ) THEN
    ALTER TABLE public.assets
    ADD CONSTRAINT assets_post_id_fkey
    FOREIGN KEY (post_id)
    REFERENCES public.posts(id)
    ON DELETE CASCADE;
  END IF;

  -- Create index to speed up joins/embedding
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'idx_assets_post_id'
  ) THEN
    CREATE INDEX idx_assets_post_id ON public.assets(post_id);
  END IF;
END $$;