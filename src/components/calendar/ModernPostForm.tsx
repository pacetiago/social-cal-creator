import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Post, Channel, Campaign, PostStatus } from '@/types/multi-tenant';
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
}

export function ModernPostForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  channels, 
  campaigns,
  defaultDate 
}: ModernPostFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    status: (initialData?.status || 'idea') as PostStatus,
    channel_id: initialData?.channel_id || '',
    campaign_id: initialData?.campaign_id || '',
    publish_at: initialData?.publish_at ? new Date(initialData.publish_at) : defaultDate || null,
    theme: initialData?.theme || '',
    persona: initialData?.persona || '',
    insights: initialData?.insights || ''
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
        channel_id: formData.channel_id || null,
        campaign_id: formData.campaign_id || null,
        publish_at: formData.publish_at?.toISOString() || null,
        theme: formData.theme,
        persona: formData.persona,
        insights: formData.insights,
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
      channel_id: '',
      campaign_id: '',
      publish_at: null,
      theme: '',
      persona: '',
      insights: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as PostStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.publish_at}
                    onSelect={(date) => setFormData(prev => ({ ...prev, publish_at: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="channel">Canal</Label>
              <Select
                value={formData.channel_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, channel_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um canal..." />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="campaign">Campanha</Label>
              <Select
                value={formData.campaign_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, campaign_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma campanha..." />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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