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
    <Card className="p-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Cliente</label>
          <Select value={selectedClient} onValueChange={onClientChange}>
            <SelectTrigger className="w-full">
              <Building className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover text-popover-foreground border">
              <SelectItem value="">Todos os clientes</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Empresa</label>
          <Select 
            value={selectedCompany} 
            onValueChange={onCompanyChange}
            disabled={!selectedClient}
          >
            <SelectTrigger className="w-full">
              <User className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover text-popover-foreground border">
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
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Responsabilidade</label>
          <Select value={selectedResponsibility} onValueChange={onResponsibilityChange}>
            <SelectTrigger className="w-full">
              <Briefcase className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover text-popover-foreground border">
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="agency">Agência</SelectItem>
              <SelectItem value="client">Cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}