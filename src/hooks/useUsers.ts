import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Check if current user is platform admin by checking user_roles table
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id);

      const isPlatformAdmin = userRoles?.some(r => r.role === 'platform_admin');

      // If user is platform admin, use edge function to get all users
      if (isPlatformAdmin) {
        console.log('Platform admin user detected, fetching all users via edge function');
        
        const { data: functionData, error: functionError } = await supabase.functions.invoke('list-users', {
          body: {}
        });

        if (functionError) {
          console.error('Edge function error:', functionError);
          // Fallback to regular query if edge function fails
          throw functionError;
        }

        if (functionData?.users) {
          setUsers(functionData.users);
          setError(null);
          return;
        }
      }

      // Fallback: Regular RLS-constrained query for non-platform admins
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setUsers(data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(message);
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setUsers(prev => prev.map(user => user.id === id ? data : user));
      
      toast({
        title: 'Usuário atualizado',
        description: 'As informações foram salvas com sucesso.',
      });

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      toast({
        title: 'Erro ao atualizar usuário',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error: message };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    updateUser,
    refetch: fetchUsers
  };
}