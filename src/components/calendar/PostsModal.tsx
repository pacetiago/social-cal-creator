import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Post, PostStatus } from '@/types/multi-tenant';
import { cn } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';

interface PostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  date: Date;
  onPostClick: (post: Post) => void;
  channels?: any[];
}

export function PostsModal({ isOpen, onClose, posts, date, onPostClick, channels }: PostsModalProps) {
  const getStatusColor = (status: PostStatus) => {
    switch (status) {
      case 'idea': return 'bg-gray-500';
      case 'draft': return 'bg-yellow-500';
      case 'review': return 'bg-orange-500';
      case 'approved': return 'bg-blue-500';
      case 'production': return 'bg-teal-500';
      case 'scheduled': return 'bg-green-500';
      case 'published': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: PostStatus) => {
    const labels: Record<PostStatus, string> = {
      idea: 'Ideia',
      draft: 'Rascunho',
      review: 'Em Revisão',
      approved: 'Aprovado',
      production: 'Em Produção',
      scheduled: 'Agendado',
      published: 'Publicado'
    };
    return labels[status] || status;
  };

  const getChannelIcon = (channelKey: string) => {
    switch (channelKey?.toLowerCase()) {
      case 'instagram': return '📷';
      case 'facebook': return '📘';
      case 'linkedin': return '💼';
      case 'x': case 'twitter': return '🐦';
      case 'youtube': return '📺';
      case 'tiktok': return '🎵';
      case 'blog': return '📝';
      case 'ebook': return '📖';
      case 'roteiro': return '🎬';
      default: return '📱';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Posts de {formatDate(date)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => {
                onPostClick(post);
                onClose();
              }}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("w-3 h-3 rounded-full", getStatusColor(post.status))} />
                      <Badge variant="secondary">{getStatusLabel(post.status)}</Badge>
                      {post.responsibility && (
                        <Badge variant="outline">
                          {post.responsibility === 'client' ? 'Cliente' : 'Agência'}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    {post.content && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {post.content}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {post.publish_at && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(post.publish_at).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}

                  {(post as any).channel && (
                    <div className="flex items-center gap-1">
                      <span>{getChannelIcon((post as any).channel.key)}</span>
                      <span className="text-muted-foreground">{(post as any).channel.name}</span>
                    </div>
                  )}

                  {(post as any).channel_ids && Array.isArray((post as any).channel_ids) && (post as any).channel_ids.length > 0 && (
                    <div className="flex items-center gap-2">
                      {(post as any).channel_ids.map((channelId: string) => {
                        const channel = channels?.find(c => c.id === channelId);
                        if (!channel) return null;
                        return (
                          <div key={channelId} className="flex items-center gap-1">
                            <span>{getChannelIcon(channel.key)}</span>
                            <span className="text-muted-foreground text-xs">{channel.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(post as any).client && (
                    <span className="text-muted-foreground">
                      Cliente: {(post as any).client.name}
                    </span>
                  )}

                  {(post as any).company && (
                    <Badge 
                      variant="outline"
                      style={{ 
                        backgroundColor: `${(post as any).company.color}20`,
                        borderColor: (post as any).company.color 
                      }}
                    >
                      {(post as any).company.name}
                    </Badge>
                  )}
                </div>

                {(post.theme || post.persona || post.media_type) && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {post.theme && (
                      <Badge variant="secondary" className="text-xs">
                        Tema: {post.theme}
                      </Badge>
                    )}
                    {post.persona && (
                      <Badge variant="secondary" className="text-xs">
                        Persona: {post.persona}
                      </Badge>
                    )}
                    {post.media_type && (
                      <Badge variant="secondary" className="text-xs">
                        {post.media_type}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}