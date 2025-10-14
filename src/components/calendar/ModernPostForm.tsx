import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Post, Channel, Campaign, PostStatus, MediaType } from '@/types/multi-tenant';
import { useClients, Client } from '@/hooks/useClients';
import { useCompanies, Company } from '@/hooks/useCompanies';
import { usePosts } from '@/hooks/usePosts';
import { CalendarIcon, Save, X, Trash2, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  onDelete?: (postId: string) => Promise<void>;
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
  clients: clientsProp,
  onDelete
}: ModernPostFormProps) {
  const { toast } = useToast();
  const clientsHook = useClients(orgId);
  const clients: Client[] = (clientsProp ?? clientsHook.clients);
  const clientsLoading = clientsProp ? false : clientsHook.loading;
  const clientsError = clientsProp ? null : clientsHook.error;
  const [selectedClientId, setSelectedClientId] = useState('');
  const { companies, loading: companiesLoading } = useCompanies(selectedClientId || undefined);
  const { deletePost } = usePosts({ orgId });
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'idea' as PostStatus,
    channel_ids: [] as string[],
    campaign_id: '',
    client_id: '',
    company_id: '',
    company_ids: [] as string[],
    publish_at: null as Date | null,
    theme: '',
    persona: '',
    insights: '',
    responsibility: 'agency' as 'agency' | 'client',
    media_type: '' as MediaType | '',
    tags: [] as string[]
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});

  // Gera URLs assinadas para anexos existentes (bucket privado)
  useEffect(() => {
    const loadUrls = async () => {
      const assets = (initialData as any)?.assets as any[] | undefined;
      if (!assets || assets.length === 0) {
        setAssetUrls({});
        return;
      }
      const map: Record<string, string> = {};
      for (const asset of assets) {
        try {
          if (asset.file_path) {
            const { data, error } = await supabase.storage
              .from('post-attachments')
              .createSignedUrl(asset.file_path, 60 * 60); // 1 hora
            if (!error && data?.signedUrl) {
              map[asset.id] = data.signedUrl;
            } else if (asset.file_url) {
              map[asset.id] = asset.file_url;
            }
          } else if (asset.file_url) {
            map[asset.id] = asset.file_url;
          }
        } catch (e) {
          // fallback para file_url se existir
          if (asset.file_url) map[asset.id] = asset.file_url;
        }
      }
      setAssetUrls(map);
    };
    loadUrls();
  }, [initialData]);
  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Editing existing post - fix channel_ids loading
        let channelIds: string[] = [];
        if (initialData.channel_ids && Array.isArray(initialData.channel_ids) && initialData.channel_ids.length > 0) {
          channelIds = initialData.channel_ids;
        } else if (initialData.channel_id) {
          channelIds = [initialData.channel_id];
        }
        
        setFormData({
          title: initialData.title || '',
          content: initialData.content || '',
          status: (initialData.status || 'idea') as PostStatus,
          channel_ids: channelIds,
          campaign_id: initialData.campaign_id || '',
          client_id: initialData.client_id || '',
          company_id: initialData.company_id || '',
          company_ids: initialData.company_id ? [initialData.company_id] : [],
          publish_at: initialData.publish_at ? new Date(initialData.publish_at) : null,
          theme: initialData.theme || '',
          persona: initialData.persona || '',
          insights: initialData.insights || '',
          responsibility: initialData.responsibility || 'agency',
          media_type: initialData.media_type || '',
          tags: initialData.tags || []
        });
        setSelectedClientId(initialData.client_id || '');
      } else {
        // Creating new post
        setFormData({
          title: '',
          content: '',
          status: 'idea',
          channel_ids: [],
          campaign_id: '',
          client_id: '',
          company_id: '',
          company_ids: [],
          publish_at: defaultDate || null,
          theme: '',
          persona: '',
          insights: '',
          responsibility: 'agency',
          media_type: '',
          tags: []
        });
        setSelectedClientId('');
      }
    }
  }, [isOpen, initialData, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    setLoading(true);
    
    try {
      // If multiple companies selected and creating new post, create one post per company
      if (!initialData && formData.company_ids.length > 1) {
        for (const companyId of formData.company_ids) {
          const result = await onSave({
            title: formData.title,
            content: formData.content,
            status: formData.status,
            channel_id: formData.channel_ids[0] || null,
            channel_ids: formData.channel_ids,
            campaign_id: formData.campaign_id || null,
            client_id: formData.client_id || null,
            company_id: companyId,
            publish_at: formData.publish_at?.toISOString() || null,
            theme: formData.theme,
            persona: formData.persona,
            insights: formData.insights,
            responsibility: formData.responsibility,
            media_type: formData.media_type || null,
            utm_source: null,
            utm_campaign: null,
            utm_content: null,
            tags: formData.tags,
            variations: [],
            created_by: null,
            updated_by: null,
            org_id: ''
          });

          // Upload attachments for this post
          if (result?.data?.id && attachments.length > 0) {
            await uploadAttachments(result.data.id);
          }
        }
      } else {
        // Single company or editing existing post
        const result = await onSave({
          title: formData.title,
          content: formData.content,
          status: formData.status,
          channel_id: formData.channel_ids[0] || null,
          channel_ids: formData.channel_ids,
          campaign_id: formData.campaign_id || null,
          client_id: formData.client_id || null,
          company_id: formData.company_ids?.[0] || null,
          publish_at: formData.publish_at?.toISOString() || null,
          theme: formData.theme,
          persona: formData.persona,
          insights: formData.insights,
          responsibility: formData.responsibility,
          media_type: formData.media_type || null,
          utm_source: null,
          utm_campaign: null,
          utm_content: null,
          tags: formData.tags,
          variations: [],
          created_by: null,
          updated_by: null,
          org_id: ''
        });

        // Upload attachments for this post
        if (result?.data?.id && attachments.length > 0) {
          await uploadAttachments(result.data.id);
        }
      }
      
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const uploadAttachments = async (postId: string) => {
    if (!orgId) return;

    for (const file of attachments) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: `${file.name} excede o limite de 5MB`,
          variant: 'destructive',
        });
        continue;
      }

      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${postId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-attachments')
          .upload(fileName, file);

        if (uploadError) {
          toast({
            title: 'Erro no upload',
            description: uploadError.message,
            variant: 'destructive',
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('post-attachments')
          .getPublicUrl(fileName);

        // Determine asset kind based on mime type
        let assetKind: 'image' | 'video' | 'doc' = 'image';
        if (file.type.startsWith('video/')) assetKind = 'video';
        else if (file.type.includes('pdf') || file.type.includes('document')) assetKind = 'doc';

        // Insert into assets table
        const { error: assetError } = await supabase
          .from('assets')
          .insert([{
            org_id: orgId,
            post_id: postId,
            name: file.name,
            kind: assetKind,
            file_path: fileName,
            file_url: publicUrl,
            mime_type: file.type,
            file_size: file.size,
            metadata: {}
          }]);

        if (assetError) {
          console.error('Error inserting asset:', assetError);
          toast({
            title: 'Erro ao salvar anexo',
            description: assetError.message,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: 'Erro no upload',
          description: 'Falha ao fazer upload do arquivo',
          variant: 'destructive',
        });
      }
    }

    toast({
      title: 'Anexos enviados',
      description: `${attachments.length} arquivo(s) enviado(s) com sucesso`,
    });
  };

  const handleClose = () => {
    setAttachments([]);
    onClose();
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    
    setLoading(true);
    try {
      if (onDelete) {
        await onDelete(initialData.id);
      } else {
        await deletePost(initialData.id);
      }
      handleClose();
    } finally {
      setLoading(false);
    }
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
              <Label htmlFor="companies">Empresas (múltipla seleção)</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3 bg-background">
                {companiesLoading && (
                  <p className="text-sm text-muted-foreground">Carregando empresas...</p>
                )}
                {!companiesLoading && !selectedClientId && (
                  <p className="text-sm text-muted-foreground">Selecione um cliente primeiro</p>
                )}
                {!companiesLoading && selectedClientId && companies.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma empresa encontrada</p>
                )}
                {!companiesLoading && companies.map((company) => (
                  <div key={company.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`company-${company.id}`}
                      checked={formData.company_ids.includes(company.id)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => {
                          if (checked) {
                            return {
                              ...prev,
                              company_ids: [...prev.company_ids, company.id],
                              company_id: prev.company_ids.length === 0 ? company.id : prev.company_id
                            };
                          } else {
                            const newIds = prev.company_ids.filter(id => id !== company.id);
                            return {
                              ...prev,
                              company_ids: newIds,
                              company_id: newIds[0] || ''
                            };
                          }
                        });
                      }}
                    />
                    <Label htmlFor={`company-${company.id}`} className="text-sm font-normal flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: company.color }}
                      />
                      {company.name}
                    </Label>
                  </div>
                ))}
              </div>
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
                  <SelectItem value="production">Em Produção</SelectItem>
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
                {channels.map((channel) => {
                  const getChannelIcon = (key: string) => {
                    switch (key?.toLowerCase()) {
                      case 'instagram': return '📷';
                      case 'facebook': return '👥';
                      case 'linkedin': return '💼';
                      case 'tiktok': return '🎵';
                      case 'youtube': return '🎥';
                      case 'blog': return '📝';
                      case 'ebook': return '📖';
                      case 'x': return '🐦';
                      case 'roteiro': return '🎬';
                      default: return '📢';
                    }
                  };
                  
                  return (
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
                      <Label htmlFor={`channel-${channel.id}`} className="text-sm font-normal flex items-center gap-2">
                        <span>{getChannelIcon(channel.key)}</span>
                        {channel.name}
                      </Label>
                    </div>
                  );
                })}
                {channels.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum canal disponível</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="theme">Assunto do conteúdo</Label>
              <Input
                id="theme"
                value={formData.theme}
                onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                placeholder="Assunto do post..."
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

            <div>
              <Label htmlFor="media_types">Tipos de Mídia (múltipla seleção)</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3 bg-background">
                {['Carrossel', 'Imagem', 'Texto blog', 'Vídeo', 'Post Estático', 'Post/Fotos', 'Reels', 'Story'].map((type) => {
                  const isChecked = formData.media_type === type || formData.tags?.some(tag => tag === `media:${type}`);
                  
                  return (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`media-${type}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const currentTags = formData.tags || [];
                          const mediaTag = `media:${type}`;
                          
                          if (checked) {
                            // Add to tags
                            const newTags = [...currentTags.filter(t => !t.startsWith('media:')), mediaTag];
                            // Set as primary media_type if it's the first one
                            setFormData(prev => ({
                              ...prev,
                              media_type: prev.media_type || (type as MediaType),
                              tags: newTags
                            }));
                          } else {
                            // Remove from tags
                            const newTags = currentTags.filter(t => t !== mediaTag);
                            const remainingMediaTags = newTags.filter(t => t.startsWith('media:'));
                            setFormData(prev => ({
                              ...prev,
                              media_type: remainingMediaTags.length > 0 
                                ? remainingMediaTags[0].replace('media:', '') as MediaType 
                                : '',
                              tags: newTags
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`media-${type}`} className="text-sm font-normal">
                        {type}
                      </Label>
                    </div>
                  );
                })}
              </div>
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

          {/* Seção de Anexos Aprimorada */}
          <div className="space-y-4 border-t pt-4">
            {/* Anexos Existentes com visualização melhorada */}
            {initialData && (initialData as any).assets && (initialData as any).assets.length > 0 && (
              <div className="space-y-2">
                <Label>Anexos Existentes</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(initialData as any).assets.map((asset: any) => {
                    const signedUrl = assetUrls[asset.id] || asset.file_url;
                    const isImage = asset.kind === 'image' || asset.mime_type?.startsWith('image/');
                    const isVideo = asset.kind === 'video' || asset.mime_type?.startsWith('video/');
                    
                    return (
                      <div
                        key={asset.id}
                        className="relative group border rounded-lg p-2 hover:bg-accent/50 transition-all duration-200"
                      >
                        {signedUrl && isImage && (
                          <img
                            src={signedUrl}
                            alt={asset.name || 'anexo'}
                            className="w-full h-24 object-cover rounded"
                            loading="lazy"
                          />
                        )}
                        {signedUrl && isVideo && (
                          <video
                            src={signedUrl}
                            className="w-full h-24 object-cover rounded"
                            muted
                          />
                        )}
                        {!isImage && !isVideo && (
                          <div className="w-full h-24 flex items-center justify-center bg-muted rounded">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <p className="text-xs mt-1 truncate" title={asset.name || 'anexo'}>
                          {asset.name || 'Arquivo anexo'}
                        </p>
                        {signedUrl && (
                          <a
                            href={signedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/60 rounded-lg flex items-center justify-center transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-white text-sm font-medium">Abrir</span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload de novos anexos */}
            <div>
              <Label htmlFor="new-attachments" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {initialData ? 'Adicionar Mais Anexos' : 'Anexar Arquivos'}
              </Label>
              <Input
                id="new-attachments"
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files) {
                    setAttachments(Array.from(e.target.files));
                  }
                }}
                className="cursor-pointer mt-2"
              />
              {attachments.length > 0 && (
                <div className="text-sm text-muted-foreground mt-2">
                  {attachments.length} arquivo(s) selecionado(s) para upload
                  <ul className="list-disc list-inside mt-1">
                    {attachments.map((file, index) => (
                      <li key={index} className="truncate">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Post'}
            </Button>
            {initialData && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" disabled={loading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}