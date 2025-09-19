import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Channel, ChannelKey } from '@/types/multi-tenant';
import { useToast } from '@/hooks/use-toast';

export function useChannels(orgId?: string) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchChannels = async () => {
    if (!orgId) {
      setChannels([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('channels')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('name');

      if (fetchError) throw fetchError;

      setChannels(data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch channels';
      setError(message);
      console.error('Channels fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addChannel = async (channelData: { key: ChannelKey; name: string; config?: Record<string, any> }) => {
    if (!orgId) return { data: null, error: 'Organization ID is required' };

    try {
      const { data, error: insertError } = await supabase
        .from('channels')
        .insert([{
          org_id: orgId,
          ...channelData
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setChannels(prev => [...prev, data]);
      
      toast({
        title: 'Canal adicionado',
        description: 'O canal foi configurado com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add channel';
      toast({
        title: 'Erro ao adicionar canal',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const updateChannel = async (id: string, updates: Partial<Channel>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('channels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setChannels(prev => prev.map(channel => channel.id === id ? data : channel));
      
      toast({
        title: 'Canal atualizado',
        description: 'As configurações foram salvas com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update channel';
      toast({
        title: 'Erro ao atualizar canal',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const toggleChannel = async (id: string, isActive: boolean) => {
    return updateChannel(id, { is_active: isActive });
  };

  useEffect(() => {
    fetchChannels();
  }, [orgId]);

  return {
    channels,
    loading,
    error,
    addChannel,
    updateChannel,
    toggleChannel,
    refetch: fetchChannels
  };
}