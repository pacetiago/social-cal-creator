-- Adicionar novo valor ao enum post_status
ALTER TYPE post_status ADD VALUE IF NOT EXISTS 'production';

-- Adicionar coluna media_type na tabela posts
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
    CREATE TYPE media_type AS ENUM ('carousel', 'static_post', 'photo', 'reel', 'video', 'story');
  END IF;
END $$;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_type media_type;