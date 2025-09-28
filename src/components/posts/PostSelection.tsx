import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, CheckCircle, X } from 'lucide-react';
import { Post } from '@/types/multi-tenant';
import { cn } from '@/lib/utils';

interface PostSelectionProps {
  posts: Post[];
  onBulkDelete: (postIds: string[]) => void;
  onBulkApprove: (postIds: string[]) => void;
  onCancel: () => void;
}

export function PostSelection({ posts, onBulkDelete, onBulkApprove, onCancel }: PostSelectionProps) {
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(p => p.id));
    }
  };

  const handleSelectPost = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleBulkAction = (action: 'delete' | 'approve') => {
    if (selectedPosts.length === 0) return;
    
    if (action === 'delete') {
      onBulkDelete(selectedPosts);
    } else {
      onBulkApprove(selectedPosts);
    }
    
    setSelectedPosts([]);
  };

  return (
    <div className="space-y-4">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedPosts.length === posts.length && posts.length > 0}
            onCheckedChange={handleSelectAll}
            className="mr-2"
          />
          <span className="text-sm font-medium">
            {selectedPosts.length} de {posts.length} selecionados
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedPosts.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('approve')}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Aprovar ({selectedPosts.length})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir ({selectedPosts.length})
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>

      {/* Posts list with selection */}
      <div className="space-y-2">
        {posts.map((post) => (
          <div
            key={post.id}
            className={cn(
              "flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
              selectedPosts.includes(post.id) && "bg-muted border-primary"
            )}
            onClick={() => handleSelectPost(post.id)}
          >
            <Checkbox
              checked={selectedPosts.includes(post.id)}
              onCheckedChange={() => handleSelectPost(post.id)}
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{post.title}</h3>
                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                  {post.status}
                </Badge>
                {post.responsibility && (
                  <Badge variant="outline">
                    {post.responsibility === 'client' ? 'Cliente' : 'Agência'}
                  </Badge>
                )}
              </div>
              
              {post.content && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {post.content}
                </p>
              )}
              
              {post.publish_at && (
                <p className="text-sm text-muted-foreground mt-1">
                  Publicar em: {new Date(post.publish_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}