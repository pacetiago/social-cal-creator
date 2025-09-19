export type SocialNetwork = 'Facebook' | 'Instagram' | 'LinkedIn' | 'Site';
export type EditorialLine = 'SAZONAL' | 'INSTITUCIONAL' | 'BLOG';
export type MediaType = 'Imagem' | 'Vídeo' | 'Carrossel' | 'Texto blog';
export type ChannelType = 'Feed' | 'Story' | 'Feed e Story' | 'Site';

export interface Company {
  id: string;
  name: string;
  color: string;
  groupName?: string;
}

export interface Client {
  id: string;
  name: string;
  companies: Company[];
}

export interface CalendarPost {
  id: string;
  day: number;
  month: number;
  year: number;
  clientId: string;
  companyId: string;
  networks: SocialNetwork[];
  channels: ChannelType[];
  mediaType: MediaType;
  editorialLine: EditorialLine;
  subject: string;
  content: string;
  insight?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarFilters {
  clientId?: string;
  companyId?: string;
  networks: SocialNetwork[];
  editorialLines: EditorialLine[];
  mediaTypes: MediaType[];
}

export interface CalendarStats {
  totalPosts: number;
  postsByNetwork: Record<SocialNetwork, number>;
  postsByEditorialLine: Record<EditorialLine, number>;
  postsByMediaType: Record<MediaType, number>;
}