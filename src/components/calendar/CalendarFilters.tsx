import { CalendarFilters as FiltersType, SocialNetwork, EditorialLine, MediaType, Client, Company } from "@/types/calendar";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, X, Building2, Users } from "lucide-react";

interface CalendarFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  clients: Client[];
  selectedClient?: Client;
  selectedCompany?: Company;
  onClientChange: (clientId: string) => void;
  onCompanyChange: (companyId: string) => void;
  currentMonth?: number;
  onMonthChange?: (month: number) => void;
}

const socialNetworks: SocialNetwork[] = ['Facebook', 'Instagram', 'LinkedIn', 'Site'];
const editorialLines: EditorialLine[] = ['SAZONAL', 'INSTITUCIONAL', 'BLOG', 'ROTEIRO'];
const mediaTypes: MediaType[] = ['Imagem', 'Vídeo', 'Carrossel', 'Texto blog'];

export function CalendarFilters({ 
  filters, 
  onFiltersChange, 
  clients, 
  selectedClient, 
  selectedCompany,
  onClientChange,
  onCompanyChange,
  currentMonth,
  onMonthChange
}: CalendarFiltersProps) {
  const { user } = useAuth();
  const hasActiveFilters = 
    filters.networks.length > 0 || 
    filters.editorialLines.length > 0 || 
    filters.mediaTypes.length > 0 ||
    filters.clientId ||
    filters.companyId ||
    (currentMonth !== undefined && currentMonth !== new Date().getMonth() + 1);

  const clearAllFilters = () => {
    onFiltersChange({
      networks: [],
      editorialLines: [],
      mediaTypes: [],
      clientId: undefined,
      companyId: undefined
    });
    onClientChange('');
    onCompanyChange('');
    if (onMonthChange) {
      onMonthChange(new Date().getMonth() + 1);
    }
  };

  const removeNetworkFilter = (network: SocialNetwork) => {
    onFiltersChange({
      ...filters,
      networks: filters.networks.filter(n => n !== network),
    });
  };

  const removeEditorialLineFilter = (line: EditorialLine) => {
    onFiltersChange({
      ...filters,
      editorialLines: filters.editorialLines.filter(l => l !== line),
    });
  };

  const removeMediaTypeFilter = (type: MediaType) => {
    onFiltersChange({
      ...filters,
      mediaTypes: filters.mediaTypes.filter(t => t !== type),
    });
  };

  const addNetworkFilter = (network: string) => {
    if (network === 'all') return;
    if (!filters.networks.includes(network as SocialNetwork)) {
      onFiltersChange({
        ...filters,
        networks: [...filters.networks, network as SocialNetwork],
      });
    }
  };

  const addEditorialLineFilter = (line: string) => {
    if (line === 'all') return;
    if (!filters.editorialLines.includes(line as EditorialLine)) {
      onFiltersChange({
        ...filters,
        editorialLines: [...filters.editorialLines, line as EditorialLine],
      });
    }
  };

  const addMediaTypeFilter = (type: string) => {
    if (type === 'all') return;
    if (!filters.mediaTypes.includes(type as MediaType)) {
      onFiltersChange({
        ...filters,
        mediaTypes: [...filters.mediaTypes, type as MediaType],
      });
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 mb-4">
      {/* Client and Company Filters */}
      {clients.length > 0 && (
        <>
          {/* Client Filter */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Users className="h-4 w-4" />
              Cliente
            </label>
            <Select value={selectedClient?.id || ''} onValueChange={onClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {selectedClient && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresa
          </label>
          <Select 
            value={selectedCompany?.id || ''} 
            onValueChange={onCompanyChange}
            disabled={!selectedClient}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar empresa..." />
            </SelectTrigger>
            <SelectContent>
              {selectedClient?.companies.map((company) => (
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

        {/* Social Networks Filter */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Redes Sociais
          </label>
          <Select onValueChange={addNetworkFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Adicionar rede..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as redes</SelectItem>
              {socialNetworks.map((network) => (
                <SelectItem key={network} value={network}>
                  {network}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Editorial Lines Filter */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Linha Editorial
          </label>
          <Select onValueChange={addEditorialLineFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Adicionar linha..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as linhas</SelectItem>
              {editorialLines.map((line) => (
                <SelectItem key={line} value={line}>
                  {line}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Media Types Filter */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Tipo de Mídia
          </label>
          <Select onValueChange={addMediaTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Adicionar mídia..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {mediaTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month Filter */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Mês
          </label>
          <Select value={currentMonth?.toString()} onValueChange={(value) => onMonthChange?.(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar mês..." />
            </SelectTrigger>
            <SelectContent>
              {[
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
               ].map((month, index) => (
                 <SelectItem key={index + 1} value={(index + 1).toString()}>
                   {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-3">
          {filters.networks.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground mb-2 block">
                Redes Sociais:
              </span>
              <div className="flex flex-wrap gap-2">
                {filters.networks.map((network) => (
                  <Badge
                    key={network}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => removeNetworkFilter(network)}
                  >
                    {network}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {filters.editorialLines.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground mb-2 block">
                Linhas Editoriais:
              </span>
              <div className="flex flex-wrap gap-2">
                {filters.editorialLines.map((line) => (
                  <Badge
                    key={line}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => removeEditorialLineFilter(line)}
                  >
                    {line}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {filters.mediaTypes.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground mb-2 block">
                Tipos de Mídia:
              </span>
              <div className="flex flex-wrap gap-2">
                {filters.mediaTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => removeMediaTypeFilter(type)}
                  >
                    {type}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}