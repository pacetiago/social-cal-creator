import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/multi-tenant';

interface Membership {
  id: string;
  org_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

export function useMemberships(orgId?: string) {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMemberships = async () => {
    if (!orgId) {
      setMemberships([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('memberships')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at');

      if (fetchError) throw fetchError;

      // Fetch user emails separately
      const membershipsList = await Promise.all(
        (data || []).map(async (membership) => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', membership.user_id)
            .single();

          return {
            ...membership,
            user_email: profile?.email || '',
            user_name: profile?.full_name || profile?.email || ''
          };
        })
      );

      setMemberships(membershipsList);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch memberships';
      setError(message);
      console.error('Memberships fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMembership = async (membershipData: { user_email: string; role: UserRole }) => {
    if (!orgId) return { data: null, error: 'Organization ID is required' };

    try {
      // First find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', membershipData.user_email)
        .maybeSingle();

      if (userError) {
        throw new Error(`Erro ao buscar usuário: ${userError.message}`);
      }

      if (!userData) {
        throw new Error('Usuário não encontrado. O usuário deve se registrar primeiro na plataforma antes de ser adicionado à organização.');
      }

      const { data, error: insertError } = await supabase
        .from('memberships')
        .insert([{
          org_id: orgId,
          user_id: userData.id,
          role: membershipData.role,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchMemberships(); // Refresh the list
      
      toast({
        title: 'Membro adicionado',
        description: 'O usuário foi adicionado à organização com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add membership';
      toast({
        title: 'Erro ao adicionar membro',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const updateMembership = async (id: string, updates: { role: UserRole }) => {
    try {
      const { data, error: updateError } = await supabase
        .from('memberships')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchMemberships(); // Refresh the list
      
      toast({
        title: 'Membro atualizado',
        description: 'O papel do usuário foi atualizado com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update membership';
      toast({
        title: 'Erro ao atualizar membro',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  const removeMembership = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('memberships')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setMemberships(prev => prev.filter(membership => membership.id !== id));
      
      toast({
        title: 'Membro removido',
        description: 'O usuário foi removido da organização com sucesso.',
      });

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove membership';
      toast({
        title: 'Erro ao remover membro',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, [orgId]);

  return {
    memberships,
    loading,
    error,
    addMembership,
    updateMembership,
    removeMembership,
    refetch: fetchMemberships
  };
}