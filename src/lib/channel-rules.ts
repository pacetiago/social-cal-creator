import { ChannelKey } from '@/types/multi-tenant';

export interface ChannelRule {
  maxLength?: number;
  allowHashtags?: boolean;
  allowMentions?: boolean;
  allowLinks?: boolean;
  maxHashtags?: number;
  recommendedLength?: number;
  warnings: string[];
  errors: string[];
}

export interface ChannelLimits {
  [key: string]: {
    maxLength: number;
    recommendedLength: number;
    allowHashtags: boolean;
    allowMentions: boolean;
    allowLinks: boolean;
    maxHashtags?: number;
    specificRules?: string[];
  };
}

export const CHANNEL_LIMITS: Record<ChannelKey, ChannelLimits[string]> = {
  instagram: {
    maxLength: 2200,
    recommendedLength: 125,
    allowHashtags: true,
    allowMentions: true,
    allowLinks: false, // Links in bio only
    maxHashtags: 30,
    specificRules: [
      'Links não são clicáveis no feed - use link na bio',
      'Máximo de 30 hashtags por post',
      'Primeiras 125 caracteres aparecem sem "ver mais"'
    ]
  },
  linkedin: {
    maxLength: 3000,
    recommendedLength: 150,
    allowHashtags: true,
    allowMentions: true,
    allowLinks: true,
    maxHashtags: 5,
    specificRules: [
      'Use até 5 hashtags para melhor alcance',
      'Primeiras 2 linhas aparecem no feed',
      'Links são permitidos e geram preview'
    ]
  },
  x: {
    maxLength: 280,
    recommendedLength: 250,
    allowHashtags: true,
    allowMentions: true,
    allowLinks: true,
    maxHashtags: 3,
    specificRules: [
      'Threads podem ter múltiplos tweets',
      'Links encurtam automaticamente',
      'Use até 2-3 hashtags'
    ]
  },
  tiktok: {
    maxLength: 2200,
    recommendedLength: 100,
    allowHashtags: true,
    allowMentions: true,
    allowLinks: false,
    maxHashtags: 100,
    specificRules: [
      'Foco no conteúdo visual',
      'Hashtags são cruciais para descoberta',
      'Links apenas na bio'
    ]
  },
  youtube: {
    maxLength: 5000,
    recommendedLength: 200,
    allowHashtags: true,
    allowMentions: true,
    allowLinks: true,
    maxHashtags: 15,
    specificRules: [
      'Primeiras 2 linhas são visíveis sem expandir',
      'Use timestamps para vídeos longos',
      'Links são permitidos na descrição'
    ]
  },
  blog: {
    maxLength: 10000,
    recommendedLength: 300,
    allowHashtags: false,
    allowMentions: false,
    allowLinks: true,
    specificRules: [
      'Conteúdo longo é bem-vindo',
      'Use subtítulos para organizar',
      'Links internos e externos são recomendados'
    ]
  },
  ebook: {
    maxLength: 50000,
    recommendedLength: 1000,
    allowHashtags: false,
    allowMentions: false,
    allowLinks: true,
    specificRules: [
      'Formato de documento longo',
      'Organize em capítulos',
      'Inclua índice e referências'
    ]
  },
  facebook: {
    maxLength: 63206,
    recommendedLength: 300,
    allowHashtags: true,
    allowMentions: true,
    allowLinks: true,
    maxHashtags: 10,
    specificRules: [
      'Primeiras 2 linhas aparecem no feed',
      'Use hashtags com moderação',
      'Links geram preview automático'
    ]
  },
  roteiro: {
    maxLength: 10000,
    recommendedLength: 500,
    allowHashtags: false,
    allowMentions: false,
    allowLinks: false,
    specificRules: [
      'Estruture com início, meio e fim',
      'Inclua indicações técnicas',
      'Defina tom e linguagem'
    ]
  }
};

export function validateContent(content: string, channel: ChannelKey): ChannelRule {
  const limits = CHANNEL_LIMITS[channel];
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check length limits
  if (content.length > limits.maxLength) {
    errors.push(`Conteúdo muito longo (${content.length}/${limits.maxLength} caracteres)`);
  } else if (content.length > limits.recommendedLength) {
    warnings.push(`Conteúdo pode ser encurtado (${content.length}/${limits.recommendedLength} caracteres recomendados)`);
  }

  // Check hashtags
  const hashtags = content.match(/#\w+/g) || [];
  if (hashtags.length > 0) {
    if (!limits.allowHashtags) {
      warnings.push('Este canal não suporta hashtags');
    } else if (limits.maxHashtags && hashtags.length > limits.maxHashtags) {
      warnings.push(`Muitas hashtags (${hashtags.length}/${limits.maxHashtags})`);
    }
  }

  // Check mentions
  const mentions = content.match(/@\w+/g) || [];
  if (mentions.length > 0 && !limits.allowMentions) {
    warnings.push('Este canal não suporta menções');
  }

  // Check links
  const links = content.match(/https?:\/\/[^\s]+/g) || [];
  if (links.length > 0 && !limits.allowLinks) {
    warnings.push('Links não são clicáveis neste canal');
  }

  // Channel-specific warnings
  if (limits.specificRules) {
    warnings.push(...limits.specificRules);
  }

  return {
    maxLength: limits.maxLength,
    allowHashtags: limits.allowHashtags,
    allowMentions: limits.allowMentions,
    allowLinks: limits.allowLinks,
    maxHashtags: limits.maxHashtags,
    recommendedLength: limits.recommendedLength,
    warnings,
    errors
  };
}

export function getChannelInfo(channel: ChannelKey) {
  return CHANNEL_LIMITS[channel];
}

export function getContentMetrics(content: string) {
  const hashtags = content.match(/#\w+/g) || [];
  const mentions = content.match(/@\w+/g) || [];
  const links = content.match(/https?:\/\/[^\s]+/g) || [];
  const words = content.trim().split(/\s+/).length;
  const lines = content.split('\n').length;

  return {
    characters: content.length,
    words,
    lines,
    hashtags: hashtags.length,
    mentions: mentions.length,
    links: links.length,
    hashtagList: hashtags,
    mentionList: mentions,
    linkList: links
  };
}