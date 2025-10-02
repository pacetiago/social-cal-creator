import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuditLog {
  id: string;
  action: string;
  target_table: string;
  target_id: string | null;
  actor_id: string | null;
  actor_name?: string;
  org_id: string | null;
  org_name?: string;
  created_at: string;
  diff: any;
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch audit logs with user and org info
      const { data: auditData, error: auditError } = await supabase
        .from('audit_log')
        .select(`
          id,
          action,
          target_table,
          target_id,
          actor_id,
          org_id,
          created_at,
          diff,
          metadata
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (auditError) throw auditError;

      // Fetch user names
      const actorIds = [...new Set(auditData?.map(log => log.actor_id).filter(Boolean) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', actorIds);

      // Fetch org names
      const orgIds = [...new Set(auditData?.map(log => log.org_id).filter(Boolean) || [])];
      const { data: orgs } = await supabase
        .from('orgs')
        .select('id, name')
        .in('id', orgIds);

      // Map data
      const logsWithNames: AuditLog[] = (auditData || []).map(log => {
        const profile = profiles?.find(p => p.id === log.actor_id);
        const org = orgs?.find(o => o.id === log.org_id);
        
        return {
          ...log,
          actor_name: profile?.full_name || profile?.email || 'Usuário desconhecido',
          org_name: org?.name || 'Organização desconhecida'
        };
      });

      setLogs(logsWithNames);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar logs';
      setError(message);
      toast({
        title: 'Erro ao carregar logs de auditoria',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs
  };
}
