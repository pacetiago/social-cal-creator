import { useState } from "react";
import { CalendarPost, SocialNetwork, EditorialLine, MediaType, ChannelType, Client, Company, ResponsibilityType } from "@/types/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Save, X, Users, Building2 } from "lucide-react";

interface PostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Omit<CalendarPost, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: CalendarPost | null;
  clients: Client[];
  defaultClientId?: string;
  defaultCompanyId?: string;
}

const socialNetworks: SocialNetwork[] = ['Facebook', 'Instagram', 'LinkedIn', 'Site'];
const editorialLines: EditorialLine[] = ['SAZONAL', 'INSTITUCIONAL', 'BLOG', 'ROTEIRO'];
const responsibilityTypes: ResponsibilityType[] = ['Agência', 'Cliente'];
const mediaTypes: MediaType[] = ['Imagem', 'Vídeo', 'Carrossel', 'Texto blog'];
const channelTypes: ChannelType[] = ['Feed', 'Story', 'Feed e Story', 'Site'];

export function PostForm({ isOpen, onClose, onSave, initialData, clients, defaultClientId, defaultCompanyId }: PostFormProps) {
  const [formData, setFormData] = useState({
    day: initialData?.day || 1,
    month: initialData?.month || 9, // October (0-indexed)
    year: initialData?.year || 2025,
    clientId: initialData?.clientId || defaultClientId || '',
    companyId: initialData?.companyId || defaultCompanyId || '',
    networks: initialData?.networks || [],
    channels: initialData?.channels || [],
    mediaType: initialData?.mediaType || '' as MediaType,
    editorialLine: initialData?.editorialLine || '' as EditorialLine,
    subject: initialData?.subject || '',
    content: initialData?.content || '',
    responsibility: initialData?.responsibility || 'Agência' as ResponsibilityType,
    insight: initialData?.insight || '',
  });

  const selectedClient = clients.find(c => c.id === formData.clientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mediaType || !formData.editorialLine || !formData.subject || !formData.content || !formData.clientId || !formData.companyId) {
      return;
    }

    onSave({
      ...formData,
      networks: formData.networks as SocialNetwork[],
      channels: formData.channels as ChannelType[],
      mediaType: formData.mediaType as MediaType,
      editorialLine: formData.editorialLine as EditorialLine,
      responsibility: formData.responsibility as ResponsibilityType,
    });
    
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      day: 1,
      month: 9,
      year: 2025,
      clientId: defaultClientId || '',
      companyId: defaultCompanyId || '',
      networks: [],
      channels: [],
      mediaType: '' as MediaType,
      editorialLine: '' as EditorialLine,
      subject: '',
      content: '',
      responsibility: 'Agência' as ResponsibilityType,
      insight: '',
    });
    onClose();
  };

  const handleNetworkChange = (network: SocialNetwork, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      networks: checked 
        ? [...prev.networks, network]
        : prev.networks.filter(n => n !== network)
    }));
  };

  const handleChannelChange = (channel: ChannelType, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {initialData ? 'Editar Postagem' : 'Nova Postagem'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client and Company Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Cliente
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value, companyId: '' }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente..." />
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

            <div>
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Empresa
              </Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: value }))}
                disabled={!selectedClient}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa..." />
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
          </div>

          {/* Day */}
          <div>
            <Label htmlFor="day">Dia do Mês</Label>
            <Input
              id="day"
              type="number"
              min="1"
              max="31"
              value={formData.day}
              onChange={(e) => setFormData(prev => ({ ...prev, day: parseInt(e.target.value) }))}
              required
            />
          </div>

          {/* Social Networks */}
          <Card className="p-4">
            <Label className="text-base font-semibold mb-3 block">Redes Sociais</Label>
            <div className="grid grid-cols-2 gap-3">
              {socialNetworks.map((network) => (
                <div key={network} className="flex items-center space-x-2">
                  <Checkbox
                    id={network}
                    checked={formData.networks.includes(network)}
                    onCheckedChange={(checked) => handleNetworkChange(network, checked as boolean)}
                  />
                  <Label htmlFor={network} className="text-sm font-medium">
                    {network}
                  </Label>
                </div>
              ))}
            </div>
          </Card>

          {/* Channels */}
          <Card className="p-4">
            <Label className="text-base font-semibold mb-3 block">Canais</Label>
            <div className="grid grid-cols-2 gap-3">
              {channelTypes.map((channel) => (
                <div key={channel} className="flex items-center space-x-2">
                  <Checkbox
                    id={channel}
                    checked={formData.channels.includes(channel)}
                    onCheckedChange={(checked) => handleChannelChange(channel, checked as boolean)}
                  />
                  <Label htmlFor={channel} className="text-sm font-medium">
                    {channel}
                  </Label>
                </div>
              ))}
            </div>
          </Card>

          {/* Editorial Line, Media Type, and Responsibility */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="editorialLine">Linha Editorial</Label>
              <Select
                value={formData.editorialLine}
                onValueChange={(value) => setFormData(prev => ({ ...prev, editorialLine: value as EditorialLine }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {editorialLines.map((line) => (
                    <SelectItem key={line} value={line}>
                      {line}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mediaType">Tipo de Mídia</Label>
              <Select
                value={formData.mediaType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, mediaType: value as MediaType }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {mediaTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="responsibility">Responsabilidade</Label>
              <Select
                value={formData.responsibility}
                onValueChange={(value) => setFormData(prev => ({ ...prev, responsibility: value as ResponsibilityType }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {responsibilityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Digite o assunto da postagem..."
              required
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Digite o conteúdo da postagem..."
              rows={6}
              required
            />
          </div>

          {/* Insight */}
          <div>
            <Label htmlFor="insight">Insight (Opcional)</Label>
            <Textarea
              id="insight"
              value={formData.insight}
              onChange={(e) => setFormData(prev => ({ ...prev, insight: e.target.value }))}
              placeholder="Digite insights ou observações especiais..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Postagem
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}