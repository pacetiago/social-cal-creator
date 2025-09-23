import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Post, Channel, Campaign, PostStatus } from '@/types/multi-tenant';
import { useClients, Client } from '@/hooks/useClients';
import { useCompanies, Company } from '@/hooks/useCompanies';
import { CalendarIcon, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ModernPostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  initialData?: Post | null;
  channels: Channel[];
  campaigns: Campaign[];
  defaultDate?: Date;
  orgId?: string;
  clients?: Client[];
}

export function ModernPostForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  channels, 
  campaigns,
  defaultDate,
  orgId,
  clients: clientsProp
}: ModernPostFormProps) {
  const clientsHook = useClients(orgId);
  const clients: Client[] = (clientsProp ?? clientsHook.clients);
  const clientsLoading = clientsProp ? false : clientsHook.loading;
  const clientsError = clientsProp ? null : clientsHook.error;
  const [selectedClientId, setSelectedClientId] = useState(initialData?.client_id || '');
  const { companies, loading: companiesLoading } = useCompanies(selectedClientId || undefined);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    status: (initialData?.status || 'idea') as PostStatus,
    channel_ids: initialData?.channel_ids || [initialData?.channel_id].filter(Boolean) || [],
    campaign_id: initialData?.campaign_id || '',
    client_id: initialData?.client_id || '',
    company_id: initialData?.company_id || '',
    publish_at: initialData?.publish_at ? new Date(initialData.publish_at) : defaultDate || null,
    theme: initialData?.theme || '',
    persona: initialData?.persona || '',
    insights: initialData?.insights || '',
    responsibility: initialData?.responsibility || 'agency'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    setLoading(true);
    
    try {
      await onSave({
        title: formData.title,
        content: formData.content,
        status: formData.status,
        channel_id: formData.channel_ids[0] || null, // For compatibility, use first channel
        channel_ids: formData.channel_ids,
        campaign_id: formData.campaign_id || null,
        client_id: formData.client_id || null,
        company_id: formData.company_id || null,
        publish_at: formData.publish_at?.toISOString() || null,
        theme: formData.theme,
        persona: formData.persona,
        insights: formData.insights,
        responsibility: formData.responsibility,
        utm_source: null,
        utm_campaign: null,
        utm_content: null,
        tags: [],
        variations: [],
        created_by: null,
        updated_by: null,
        org_id: '' // This will be set by the hook
      });
      
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      status: 'idea',
      channel_ids: [],
      campaign_id: '',
      client_id: '',
      company_id: '',
      publish_at: null,
      theme: '',
      persona: '',
      insights: '',
      responsibility: 'agency'
    });
    setSelectedClientId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border z-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {initialData ? 'Editar Post' : 'Novo Post'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título do post..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Cliente</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, client_id: value, company_id: '' }));
                  setSelectedClientId(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover text-popover-foreground border">
                  {clientsLoading && (
                    <SelectItem value="__loading" disabled>
                      Carregando...
                    </SelectItem>
                  )}
                  {!clientsLoading && clients.length === 0 && (
                    <SelectItem value="__empty" disabled>
                      Nenhum cliente encontrado
                    </SelectItem>
                  )}
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="company">Empresa</Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, company_id: value }))}
                disabled={!selectedClientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa..." />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover text-popover-foreground border">
                  {companiesLoading && (
                    <SelectItem value="__loading" disabled>
                      Carregando...
                    </SelectItem>
                  )}
                  {!companiesLoading && companies.length === 0 && (
                    <SelectItem value="__empty" disabled>
                      Nenhuma empresa encontrada
                    </SelectItem>
                  )}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="responsibility">Responsabilidade</Label>
              <Select
                value={formData.responsibility}
                onValueChange={(value) => setFormData(prev => ({ ...prev, responsibility: value as 'client' | 'agency' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover text-popover-foreground border">
                  <SelectItem value="agency">Agência</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as PostStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover text-popover-foreground border">
                  <SelectItem value="idea">Ideia</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="review">Em Revisão</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="publish_at">Data de Publicação</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.publish_at ? (
                      format(formData.publish_at, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50">
                  <Calendar
                    mode="single"
                    selected={formData.publish_at}
                    onSelect={(date) => setFormData(prev => ({ ...prev, publish_at: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="channels">Canais (múltipla seleção)</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {channels.map((channel) => (
                  <div key={channel.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`channel-${channel.id}`}
                      checked={formData.channel_ids.includes(channel.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            channel_ids: [...prev.channel_ids, channel.id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            channel_ids: prev.channel_ids.filter(id => id !== channel.id)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`channel-${channel.id}`} className="text-sm font-normal">
                      {channel.name}
                    </Label>
                  </div>
                ))}
                {channels.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum canal disponível</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme">Tema</Label>
              <Input
                id="theme"
                value={formData.theme}
                onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                placeholder="Tema do post..."
              />
            </div>

            <div>
              <Label htmlFor="persona">Persona</Label>
              <Input
                id="persona"
                value={formData.persona}
                onChange={(e) => setFormData(prev => ({ ...prev, persona: e.target.value }))}
                placeholder="Persona alvo..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Digite o conteúdo do post..."
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="insights">Insights</Label>
            <Textarea
              id="insights"
              value={formData.insights}
              onChange={(e) => setFormData(prev => ({ ...prev, insights: e.target.value }))}
              placeholder="Insights e observações..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Post'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}