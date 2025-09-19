-- Adicionar novos tipos de canal: blog, ebook, facebook, youtube e roteiro
-- Primeiro, adicionar os novos valores ao enum

ALTER TYPE channel_key ADD VALUE IF NOT EXISTS 'blog';
ALTER TYPE channel_key ADD VALUE IF NOT EXISTS 'ebook';
ALTER TYPE channel_key ADD VALUE IF NOT EXISTS 'facebook';
ALTER TYPE channel_key ADD VALUE IF NOT EXISTS 'youtube';
ALTER TYPE channel_key ADD VALUE IF NOT EXISTS 'roteiro';