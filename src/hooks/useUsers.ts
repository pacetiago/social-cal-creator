import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  email: string;
  full_name?: string;
  platform_role?: string;
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

      const isPlatformAdmin = userRoles?.some(r => r.role === 'platform_admin' || r.role === 'platform_owner');

      // If user is platform admin, use edge function to get all users
      if (isPlatformAdmin) {
        console.log('Platform admin user detected, fetching all users via edge function');
        
        const { data: functionData, error: functionError } = await supabase.functions.invoke('list-users', {
          body: {}
        });

        if (functionError) {
          console.error('Edge function error:', functionError);
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

  const updateUserRole = async (userId: string, newRole: 'platform_owner' | 'platform_admin' | 'platform_viewer' | 'user') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('update-user-role', {
        body: { userId, role: newRole }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to update user role');
      }

      // Refresh users list after update
      await fetchUsers();
      
      toast({
        title: 'Função atualizada',
        description: 'A função do usuário foi atualizada com sucesso.',
      });

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user role';
      console.error('Update user role error:', err);
      toast({
        title: 'Erro ao atualizar função',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    updateUserRole,
    refetch: fetchUsers
  };
}
