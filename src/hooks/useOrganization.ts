import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Organization, Membership, UserRole } from '@/types/multi-tenant';
import { useAuth } from './useAuth';

export function useOrganization() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganization() {
      if (!slug) {
        setError('Organization slug is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch organization by slug
        const { data: orgData, error: orgError } = await supabase
          .from('orgs')
          .select('*')
          .eq('slug', slug)
          .single();

        if (orgError) throw orgError;
        
        setOrganization(orgData);

        // If user is logged in, check membership
        if (user) {
          const { data: membershipData, error: membershipError } = await supabase
            .from('memberships')
            .select('*')
            .eq('org_id', orgData.id)
            .eq('user_id', user.id)
            .single();

          if (membershipError && membershipError.code !== 'PGRST116') {
            // PGRST116 is "not found" error, which is expected if user is not a member
            console.warn('Membership check error:', membershipError);
          }

          if (membershipData) {
            setMembership(membershipData);
            setUserRole(membershipData.role);
          }
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch organization');
        console.error('Organization fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrganization();
  }, [slug, user?.id]);

  const hasAccess = !!membership;
  const hasRole = (role: UserRole) => userRole === role;
  const hasAnyRole = (roles: UserRole[]) => userRole && roles.includes(userRole);
  const canManage = hasAnyRole(['OWNER', 'ADMIN']);
  const canEdit = hasAnyRole(['OWNER', 'ADMIN', 'EDITOR']);
  const canApprove = hasAnyRole(['OWNER', 'ADMIN']);

  return {
    organization,
    membership,
    userRole,
    loading,
    error,
    hasAccess,
    hasRole,
    hasAnyRole,
    canManage,
    canEdit,
    canApprove,
    refetch: () => {
      if (slug) {
        setLoading(true);
        // Trigger re-fetch by updating a dependency
      }
    }
  };
}