import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post, PostWithRelations, PostStatus } from '@/types/multi-tenant';
import { useToast } from '@/hooks/use-toast';

interface UsePostsOptions {
  orgId?: string;
  status?: PostStatus[];
  channelId?: string;
  campaignId?: string;
}

export function usePosts(options: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('posts')
        .select(`
          *,
          campaign:campaigns(*),
          channel:channels(*),
          assets(*),
          approvals(*)
        `)
        .order('created_at', { ascending: false });

      if (options.orgId) {
        query = query.eq('org_id', options.orgId);
      }

      if (options.status && options.status.length > 0) {
        query = query.in('status', options.status);
      }

      if (options.channelId) {
        query = query.eq('channel_id', options.channelId);
      }

      if (options.campaignId) {
        query = query.eq('campaign_id', options.campaignId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPosts((data || []) as PostWithRelations[]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(message);
      console.error('Posts fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addPost = async (postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert([postData])
        .select(`
          *,
          campaign:campaigns(*),
          channel:channels(*),
          assets(*),
          approvals(*)
        `)
        .single();

      if (insertError) throw insertError;

      setPosts(prev => [data as PostWithRelations, ...prev]);
      
      toast({
        title: 'Post criado',
        description: 'O post foi criado com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create post';
      toast({
        title: 'Erro ao criar post',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          campaign:campaigns(*),
          channel:channels(*),
          assets(*),
          approvals(*)
        `)
        .single();

      if (updateError) throw updateError;

      setPosts(prev => prev.map(post => post.id === id ? data as PostWithRelations : post));
      
      toast({
        title: 'Post atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update post';
      toast({
        title: 'Erro ao atualizar post',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setPosts(prev => prev.filter(post => post.id !== id));
      
      toast({
        title: 'Post excluído',
        description: 'O post foi removido com sucesso.',
      });

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete post';
      toast({
        title: 'Erro ao excluir post',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  };

  const updatePostStatus = async (id: string, status: PostStatus) => {
    return updatePost(id, { status });
  };

  useEffect(() => {
    fetchPosts();
  }, [options.orgId, options.status?.join(','), options.channelId, options.campaignId]);

  return {
    posts,
    loading,
    error,
    addPost,
    updatePost,
    deletePost,
    updatePostStatus,
    refetch: fetchPosts
  };
}