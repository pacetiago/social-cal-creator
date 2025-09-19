import { useState } from 'react';
import { Filter, Calendar, Building, User, Briefcase } from 'lucide-react';
import { useClients, Client } from '@/hooks/useClients';
import { useCompanies, Company } from '@/hooks/useCompanies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClientFiltersProps {
  selectedClient: string;
  selectedCompany: string;
  selectedResponsibility: string;
  onClientChange: (clientId: string) => void;
  onCompanyChange: (companyId: string) => void;
  onResponsibilityChange: (responsibility: string) => void;
  clients: Client[];
  companies: Company[];
}

export function ClientFilters({ 
  selectedClient, 
  selectedCompany, 
  selectedResponsibility,
  onClientChange, 
  onCompanyChange, 
  onResponsibilityChange,
  clients, 
  companies 
}: ClientFiltersProps) {
  return (
    <div className="flex gap-4 items-center">
      <Select value={selectedClient} onValueChange={onClientChange}>
        <SelectTrigger className="w-[200px]">
          <Building className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Cliente" />
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

      <Select 
        value={selectedCompany} 
        onValueChange={onCompanyChange}
        disabled={!selectedClient}
      >
        <SelectTrigger className="w-[200px]">
          <User className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Empresa" />
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
      
      <Select value={selectedResponsibility} onValueChange={onResponsibilityChange}>
        <SelectTrigger className="w-[200px]">
          <Briefcase className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Responsabilidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          <SelectItem value="agency">Agência</SelectItem>
          <SelectItem value="client">Cliente</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}