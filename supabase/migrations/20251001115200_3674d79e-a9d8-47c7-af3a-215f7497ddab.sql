-- Add new media_type values to the enum
ALTER TYPE media_type ADD VALUE IF NOT EXISTS 'Post Estático';
ALTER TYPE media_type ADD VALUE IF NOT EXISTS 'Post/Fotos';
ALTER TYPE media_type ADD VALUE IF NOT EXISTS 'Reels';
ALTER TYPE media_type ADD VALUE IF NOT EXISTS 'Story';

-- Add 'production' to post_status enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'production' AND enumtypid = 'post_status'::regtype) THEN
    ALTER TYPE post_status ADD VALUE 'production';
  END IF;
END $$;