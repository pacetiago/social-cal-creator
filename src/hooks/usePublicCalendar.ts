import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client } from './useClients';
import { Company } from './useCompanies';
import { Channel, Campaign, PostWithRelations } from '@/types/multi-tenant';

interface PublicCalendarData {
  organization: any;
  clients: Client[];
  companies: Company[];
  channels: Channel[];
  campaigns: Campaign[];
  posts: PostWithRelations[];
}

interface UsePublicCalendarOptions {
  token?: string;
  clientId?: string;
  companyId?: string;
  responsibility?: string;
}

export function usePublicCalendar(options: UsePublicCalendarOptions = {}) {
  const [data, setData] = useState<PublicCalendarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const fetchData = async () => {
    if (!options.token) {
      setIsValidToken(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching public calendar data with token:', options.token.substring(0, 10) + '...');

      const { data: result, error: functionError } = await supabase.functions.invoke('public-calendar', {
        body: {
          token: options.token,
          action: 'get-data',
          filters: {
            clientId: options.clientId || undefined,
            companyId: options.companyId || undefined,
            responsibility: options.responsibility || undefined
          }
        }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Failed to fetch data');
      }

      if (result.error) {
        throw new Error(result.error);
      }

      console.log('Public calendar data fetched:', result);
      setData(result);
      setIsValidToken(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch public calendar data';
      setError(message);
      setIsValidToken(false);
      console.error('Public calendar fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateToken = async (token: string) => {
    try {
      const { data: result, error: functionError } = await supabase.functions.invoke('public-calendar', {
        body: {
          token,
          action: 'validate'
        }
      });

      if (functionError) throw functionError;
      if (result.error) throw new Error(result.error);

      return result.valid;
    } catch (err) {
      console.error('Token validation error:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, [options.token, options.clientId, options.companyId, options.responsibility]);

  return {
    data,
    loading,
    error,
    isValidToken,
    validateToken,
    refetch: fetchData
  };
}