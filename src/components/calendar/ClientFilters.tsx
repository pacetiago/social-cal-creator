import { Filter, Building, User, Briefcase, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { Client } from '@/hooks/useClients';
import { Company } from '@/hooks/useCompanies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { MediaType } from '@/types/multi-tenant';

interface ClientFiltersProps {
  selectedClient: string;
  selectedCompany: string;
  selectedResponsibility: string;
  onClientChange: (clientId: string) => void;
  onCompanyChange: (companyId: string) => void;
  onResponsibilityChange: (responsibility: string) => void;
  clients: Client[];
  companies: Company[];
  // New optional filters
  mediaType?: string;
  contentQuery?: string;
  startDate?: Date;
  endDate?: Date;
  onMediaTypeChange?: (mediaType: string) => void;
  onContentQueryChange?: (q: string) => void;
  onDateRangeChange?: (start?: Date, end?: Date) => void;
  onClear?: () => void;
}

const mediaTypes: MediaType[] = ['Carrossel','Imagem','Texto blog','Vídeo','Post Estático','Post/Fotos','Reels','Story'];

export function ClientFilters({
  selectedClient,
  selectedCompany,
  selectedResponsibility,
  onClientChange,
  onCompanyChange,
  onResponsibilityChange,
  clients,
  companies,
  mediaType = '',
  contentQuery = '',
  startDate,
  endDate,
  onMediaTypeChange,
  onContentQueryChange,
  onDateRangeChange,
  onClear
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Mídia</label>
          <Select value={mediaType} onValueChange={(v) => onMediaTypeChange?.(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover text-popover-foreground border">
              <SelectItem value="">Todos os tipos</SelectItem>
              {mediaTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4"/> Conteúdo</label>
          <Input 
            placeholder="Buscar por título ou conteúdo..." 
            value={contentQuery} 
            onChange={(e) => onContentQueryChange?.(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data inicial</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start", !startDate && "text-muted-foreground")}> 
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? startDate.toLocaleDateString('pt-BR') : 'Selecionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(d) => onDateRangeChange?.(d || undefined, endDate)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Data final</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? endDate.toLocaleDateString('pt-BR') : 'Selecionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(d) => onDateRangeChange?.(startDate, d || undefined)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="outline" className="w-full" onClick={() => onClear?.()}>
            Limpar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
