import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Client, Company } from '@/types/calendar';
import { sampleClients } from '@/data/clientsData';

export function useSupabaseClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      // Fetch clients with their companies
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      if (clientsError) throw clientsError;

      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*');

      if (companiesError) throw companiesError;

      // Group companies by client
      const clientsWithCompanies: Client[] = clientsData.map(client => ({
        id: client.id,
        name: client.name,
        companies: companiesData
          .filter(company => company.client_id === client.id)
          .map(company => ({
            id: company.id,
            name: company.name,
            color: company.color,
            groupName: company.group_name || undefined,
          }))
      }));

      setClients(clientsWithCompanies);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
      // Fallback para dados locais quando ocorrer erro (ex.: RLS bloqueando leitura pública)
      setClients(sampleClients);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const getAllCompanies = (): Company[] => {
    return clients.flatMap(client => client.companies);
  };

  const getClientById = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };

  const getCompanyById = (clientId: string, companyId: string): Company | undefined => {
    const client = getClientById(clientId);
    return client?.companies.find(company => company.id === companyId);
  };

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    getAllCompanies,
    getClientById,
    getCompanyById
  };
}