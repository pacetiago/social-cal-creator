import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/types/multi-tenant';

export function useUserOrganizations() {
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserOrganizations = async () => {
    try {
      setLoading(true);
      
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user?.id) {
        setUserOrganizations([]);
        setError(null);
        return;
      }
      
      const { data, error: fetchError } = await supabase
        .from('memberships')
        .select(`
          orgs!memberships_org_id_fkey (
            id,
            name,
            slug,
            status,
            created_at,
            updated_at,
            created_by,
            updated_by
          )
        `)
        .eq('user_id', user.user.id);

      if (fetchError) throw fetchError;

      const organizations = data
        ?.map(membership => membership.orgs)
        .filter(Boolean) as Organization[] || [];

      setUserOrganizations(organizations);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user organizations';
      setError(message);
      console.error('User organizations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrganizations();
  }, []);

  return {
    userOrganizations,
    loading,
    error,
    refetch: fetchUserOrganizations
  };
}