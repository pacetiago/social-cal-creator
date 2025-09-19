import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  org_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export function useClients(orgId?: string) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClients = async () => {
    if (!orgId) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('name');

      if (fetchError) throw fetchError;

      setClients(data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch clients';
      setError(message);
      console.error('Clients fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: { name: string }) => {
    if (!orgId) return { data: null, error: 'Organization ID is required' };

    try {
      const { data, error: insertError } = await supabase
        .from('clients')
        .insert([{
          org_id: orgId,
          name: clientData.name,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setClients(prev => [...prev, data]);
      
      toast({
        title: 'Cliente adicionado',
        description: 'O cliente foi criado com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add client';
      toast({
        title: 'Erro ao adicionar cliente',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setClients(prev => prev.map(client => client.id === id ? data : client));
      
      toast({
        title: 'Cliente atualizado',
        description: 'As informações foram salvas com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update client';
      toast({
        title: 'Erro ao atualizar cliente',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('clients')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      setClients(prev => prev.filter(client => client.id !== id));
      
      toast({
        title: 'Cliente removido',
        description: 'O cliente foi desativado com sucesso.',
      });

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete client';
      toast({
        title: 'Erro ao remover cliente',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  };

  useEffect(() => {
    fetchClients();
  }, [orgId]);

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    refetch: fetchClients
  };
}