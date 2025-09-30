export type UserRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
export type PostStatus = 'idea' | 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'production';
export type MediaType = 'carousel' | 'static_post' | 'photo' | 'reel' | 'video' | 'story';
export type ChannelKey = 'instagram' | 'linkedin' | 'x' | 'tiktok' | 'youtube' | 'blog' | 'ebook' | 'facebook' | 'roteiro';
export type AssetKind = 'image' | 'video' | 'doc';
export type FilterType = 'theme' | 'persona' | 'tag';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string; // Using string to match database type
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Membership {
  id: string;
  user_id: string;
  org_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Channel {
  id: string;
  org_id: string;
  key: ChannelKey;
  name: string;
  is_active: boolean;
  config: any; // Using any to match Supabase Json type
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Filter {
  id: string;
  org_id: string;
  type: FilterType;
  name: string;
  value: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Campaign {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_content?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Post {
  id: string;
  org_id: string;
  campaign_id?: string;
  channel_id?: string;
  channel_ids?: string[]; // Support for multiple channels
  client_id?: string;
  company_id?: string;
  status: PostStatus;
  title: string;
  content?: string;
  publish_at?: string;
  persona?: string;
  theme?: string;
  media_type?: MediaType;
  tags?: string[];
  utm_source?: string;
  utm_campaign?: string;
  utm_content?: string;
  insights?: string;
  variations: any[];
  responsibility?: 'client' | 'agency';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Asset {
  id: string;
  org_id: string;
  post_id?: string;
  kind: AssetKind;
  name: string;
  file_path?: string;
  file_url?: string;
  file_size?: number;
  mime_type?: string;
  metadata: any; // Using any to match Supabase Json type
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Approval {
  id: string;
  org_id: string;
  post_id: string;
  approved_by: string;
  status: string; // Using string to match database type
  comments?: string;
  approved_at: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  org_id?: string;
  actor_id?: string;
  action: string;
  target_table: string;
  target_id?: string;
  diff: any; // Using any to match Supabase Json type
  metadata: any; // Using any to match Supabase Json type
  created_at: string;
}

// Extended types with relations
export interface PostWithRelations extends Post {
  campaign?: Campaign;
  channel?: Channel;
  assets?: Asset[];
  approvals?: Approval[];
}

export interface OrganizationWithRelations extends Organization {
  memberships?: Membership[];
  channels?: Channel[];
  filters?: Filter[];
  campaigns?: Campaign[];
}

// Permission helpers
export type Permission = 'view' | 'create' | 'update' | 'delete' | 'approve';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  VIEWER: ['view'],
  EDITOR: ['view', 'create', 'update'],
  ADMIN: ['view', 'create', 'update', 'delete', 'approve'],
  OWNER: ['view', 'create', 'update', 'delete', 'approve']
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canManageMembers(role: UserRole): boolean {
  return ['OWNER', 'ADMIN'].includes(role);
}

export function canApprove(role: UserRole): boolean {
  return ['OWNER', 'ADMIN'].includes(role);
}