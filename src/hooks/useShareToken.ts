import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useShareToken(orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateShareToken = async (): Promise<string | null> => {
    if (!orgId) {
      toast({
        title: 'Erro',
        description: 'ID da organização não encontrado',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('generate_share_token', { target_org_id: orgId });

      if (rpcError) throw rpcError;

      toast({
        title: 'Link público gerado!',
        description: 'O link do calendário foi copiado para a área de transferência.',
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate share token';
      setError(message);
      toast({
        title: 'Erro ao gerar link',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generatePublicLink = async (): Promise<void> => {
    const token = await generateShareToken();
    if (token) {
      const publicUrl = `${window.location.origin}/client/calendar?share=${token}`;
      try {
        await navigator.clipboard.writeText(publicUrl);
        toast({
          title: 'Link copiado!',
          description: 'O link foi copiado para a área de transferência.',
        });
      } catch (err) {
        toast({
          title: 'Erro ao copiar',
          description: 'Não foi possível copiar o link automaticamente.',
          variant: 'destructive',
        });
      }
    }
  };

  return {
    generateShareToken,
    generatePublicLink,
    loading,
    error
  };
}