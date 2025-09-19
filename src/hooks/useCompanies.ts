import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  client_id: string;
  name: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export function useCompanies(clientId?: string) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    if (!clientId) {
      setCompanies([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('name');

      if (fetchError) throw fetchError;

      setCompanies(data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch companies';
      setError(message);
      console.error('Companies fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCompany = async (companyData: { name: string; color: string }) => {
    if (!clientId) return { data: null, error: 'Client ID is required' };

    try {
      const { data, error: insertError } = await supabase
        .from('companies')
        .insert([{
          client_id: clientId,
          name: companyData.name,
          color: companyData.color,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setCompanies(prev => [...prev, data]);
      
      toast({
        title: 'Empresa adicionada',
        description: 'A empresa foi criada com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add company';
      toast({
        title: 'Erro ao adicionar empresa',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setCompanies(prev => prev.map(company => company.id === id ? data : company));
      
      toast({
        title: 'Empresa atualizada',
        description: 'As informações foram salvas com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update company';
      toast({
        title: 'Erro ao atualizar empresa',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('companies')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      setCompanies(prev => prev.filter(company => company.id !== id));
      
      toast({
        title: 'Empresa removida',
        description: 'A empresa foi desativada com sucesso.',
      });

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete company';
      toast({
        title: 'Erro ao remover empresa',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [clientId]);

  return {
    companies,
    loading,
    error,
    addCompany,
    updateCompany,
    deleteCompany,
    refetch: fetchCompanies
  };
}