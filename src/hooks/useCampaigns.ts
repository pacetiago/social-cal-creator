import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/types/multi-tenant';
import { useToast } from '@/hooks/use-toast';

export function useCampaigns(orgId?: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    if (!orgId) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setCampaigns(data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch campaigns';
      setError(message);
      console.error('Campaigns fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCampaign = async (campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'org_id'>) => {
    if (!orgId) return { data: null, error: 'Organization ID is required' };

    try {
      const { data, error: insertError } = await supabase
        .from('campaigns')
        .insert([{
          org_id: orgId,
          ...campaignData
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setCampaigns(prev => [data, ...prev]);
      
      toast({
        title: 'Campanha criada',
        description: 'A campanha foi criada com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create campaign';
      toast({
        title: 'Erro ao criar campanha',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setCampaigns(prev => prev.map(campaign => campaign.id === id ? data : campaign));
      
      toast({
        title: 'Campanha atualizada',
        description: 'As alterações foram salvas com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update campaign';
      toast({
        title: 'Erro ao atualizar campanha',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
      
      toast({
        title: 'Campanha excluída',
        description: 'A campanha foi removida com sucesso.',
      });

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete campaign';
      toast({
        title: 'Erro ao excluir campanha',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [orgId]);

  return {
    campaigns,
    loading,
    error,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    refetch: fetchCampaigns
  };
}