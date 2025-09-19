import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/types/multi-tenant';
import { useToast } from '@/hooks/use-toast';

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrganizations = async () => {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('orgs')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;

      setOrganizations(data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch organizations';
      setError(message);
      console.error('Organizations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addOrganization = async (orgData: { name: string; slug: string }) => {
    try {
      const { data, error: insertError } = await supabase
        .from('orgs')
        .insert([{
          name: orgData.name,
          slug: orgData.slug,
          status: 'active',
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setOrganizations(prev => [...prev, data]);
      
      toast({
        title: 'Organização criada',
        description: 'A organização foi criada com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create organization';
      toast({
        title: 'Erro ao criar organização',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('orgs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setOrganizations(prev => prev.map(org => org.id === id ? data : org));
      
      toast({
        title: 'Organização atualizada',
        description: 'As informações foram salvas com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update organization';
      toast({
        title: 'Erro ao atualizar organização',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('orgs')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setOrganizations(prev => prev.filter(org => org.id !== id));
      
      toast({
        title: 'Organização removida',
        description: 'A organização foi removida com sucesso.',
      });

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete organization';
      toast({
        title: 'Erro ao remover organização',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    organizations,
    loading,
    error,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    refetch: fetchOrganizations
  };
}