import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CalendarPost } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';

export function useSupabaseCalendarPosts() {
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('calendar_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPosts: CalendarPost[] = data.map(post => ({
        id: post.id,
        day: post.day,
        month: post.month,
        year: post.year,
        clientId: post.client_id,
        companyId: post.company_id,
        networks: post.networks || [],
        channels: post.channels || [],
        mediaType: post.media_type,
        editorialLine: post.editorial_line,
        subject: post.subject,
        content: post.content,
        responsibility: post.responsibility,
        insight: post.insight || undefined,
        createdAt: new Date(post.created_at),
        updatedAt: new Date(post.updated_at)
      }));

      setPosts(formattedPosts);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar postagens';
      setError(message);
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPost = async (postData: Omit<CalendarPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('calendar_posts')
        .insert({
          day: postData.day,
          month: postData.month,
          year: postData.year,
          client_id: postData.clientId,
          company_id: postData.companyId,
          networks: postData.networks,
          channels: postData.channels,
          media_type: postData.mediaType,
          editorial_line: postData.editorialLine,
          subject: postData.subject,
          content: postData.content,
          responsibility: postData.responsibility,
          insight: postData.insight || null
        })
        .select()
        .single();

      if (error) throw error;

      const newPost: CalendarPost = {
        id: data.id,
        day: data.day,
        month: data.month,
        year: data.year,
        clientId: data.client_id,
        companyId: data.company_id,
        networks: data.networks || [],
        channels: data.channels || [],
        mediaType: data.media_type,
        editorialLine: data.editorial_line,
        subject: data.subject,
        content: data.content,
        responsibility: data.responsibility,
        insight: data.insight || undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      setPosts(prev => [newPost, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Postagem criada com sucesso!"
      });

      return newPost;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar postagem';
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const updatePost = async (id: string, postData: Partial<Omit<CalendarPost, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const updateData: any = {};
      
      if (postData.day !== undefined) updateData.day = postData.day;
      if (postData.month !== undefined) updateData.month = postData.month;
      if (postData.year !== undefined) updateData.year = postData.year;
      if (postData.clientId !== undefined) updateData.client_id = postData.clientId;
      if (postData.companyId !== undefined) updateData.company_id = postData.companyId;
      if (postData.networks !== undefined) updateData.networks = postData.networks;
      if (postData.channels !== undefined) updateData.channels = postData.channels;
      if (postData.mediaType !== undefined) updateData.media_type = postData.mediaType;
      if (postData.editorialLine !== undefined) updateData.editorial_line = postData.editorialLine;
      if (postData.subject !== undefined) updateData.subject = postData.subject;
      if (postData.content !== undefined) updateData.content = postData.content;
      if (postData.responsibility !== undefined) updateData.responsibility = postData.responsibility;
      if (postData.insight !== undefined) updateData.insight = postData.insight;

      const { data, error } = await supabase
        .from('calendar_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedPost: CalendarPost = {
        id: data.id,
        day: data.day,
        month: data.month,
        year: data.year,
        clientId: data.client_id,
        companyId: data.company_id,
        networks: data.networks || [],
        channels: data.channels || [],
        mediaType: data.media_type,
        editorialLine: data.editorial_line,
        subject: data.subject,
        content: data.content,
        responsibility: data.responsibility,
        insight: data.insight || undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      setPosts(prev => prev.map(post => post.id === id ? updatedPost : post));
      
      toast({
        title: "Sucesso",
        description: "Postagem atualizada com sucesso!"
      });

      return updatedPost;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar postagem';
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Postagem excluída com sucesso!"
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir postagem';
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    addPost,
    updatePost,
    deletePost,
    refetch: fetchPosts
  };
}