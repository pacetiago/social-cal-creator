import { useState } from 'react';
import { useClients, Client } from '@/hooks/useClients';
import { useCompanies, Company } from '@/hooks/useCompanies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClientFiltersProps {
  orgId?: string;
  onClientChange: (clientId: string) => void;
  onCompanyChange: (companyId: string) => void;
  selectedClientId?: string;
  selectedCompanyId?: string;
}

export function ClientFilters({ 
  orgId, 
  onClientChange, 
  onCompanyChange, 
  selectedClientId, 
  selectedCompanyId 
}: ClientFiltersProps) {
  const { clients, loading: clientsLoading } = useClients(orgId);
  const { companies, loading: companiesLoading } = useCompanies(selectedClientId);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Cliente</label>
          <Select 
            value={selectedClientId || ""} 
            onValueChange={onClientChange}
            disabled={clientsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os clientes</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClientId && (
          <div>
            <label className="text-sm font-medium mb-2 block">Empresa</label>
            <Select 
              value={selectedCompanyId || ""} 
              onValueChange={onCompanyChange}
              disabled={companiesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as empresas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: company.color }}
                      />
                      {company.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {(selectedClient || selectedCompany) && (
          <div className="pt-2 border-t">
            <label className="text-sm font-medium mb-2 block">Filtros Aplicados</label>
            <div className="flex flex-wrap gap-2">
              {selectedClient && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Cliente: {selectedClient.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => {
                      onClientChange("");
                      onCompanyChange("");
                    }}
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {selectedCompany && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedCompany.color }}
                  />
                  {selectedCompany.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => onCompanyChange("")}
                  >
                    ×
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}