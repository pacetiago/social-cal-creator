import { useState } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { usePosts } from '@/hooks/usePosts';
import { useChannels } from '@/hooks/useChannels';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useClients } from '@/hooks/useClients';
import { useCompanies } from '@/hooks/useCompanies';
import { CalendarView } from '@/components/calendar/CalendarView';
import { ModernPostForm } from '@/components/calendar/ModernPostForm';
import { ClientFilters } from '@/components/calendar/ClientFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Grid, List, Plus, Filter, Share2 } from 'lucide-react';
import { PostStatus, Post } from '@/types/multi-tenant';

export default function ClientCalendar() {
  const { organization, loading: orgLoading, hasAccess, canEdit } = useOrganization();
  console.log('ClientCalendar: organization:', organization);
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedResponsibility, setSelectedResponsibility] = useState('');
  
  const { posts, loading: postsLoading, addPost, updatePost } = usePosts({
    orgId: organization?.id,
    clientId: selectedClient || undefined,
    companyId: selectedCompany || undefined,
    responsibility: selectedResponsibility || undefined
  });
  const { channels } = useChannels(organization?.id);
  const { campaigns } = useCampaigns(organization?.id);
  const { clients } = useClients(organization?.id);
  console.log('ClientCalendar: clients from useClients:', clients);
  const { companies } = useCompanies(selectedClient || undefined);
  
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showPostForm, setShowPostForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();

  if (orgLoading || postsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta organização.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: PostStatus) => {
    switch (status) {
      case 'idea': return 'secondary';
      case 'draft': return 'outline';
      case 'review': return 'default';
      case 'approved': return 'default';
      case 'scheduled': return 'default';
      case 'published': return 'default';
      default: return 'secondary';
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setShowPostForm(true);
  };

  const handleCreatePost = (date?: Date) => {
    setSelectedPost(null);
    setDefaultDate(date);
    setShowPostForm(true);
  };

  const handleSavePost = async (postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedPost) {
      await updatePost(selectedPost.id, postData);
    } else {
      await addPost(postData);
    }
  };

  const handleGenerateLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    toast({
      title: 'Link copiado!',
      description: 'O link do calendário foi copiado para a área de transferência.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{organization?.name}</h1>
              <p className="text-muted-foreground">Calendário Editorial</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={view === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('calendar')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendário
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4 mr-2" />
                Lista
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerateLink}>
                <Share2 className="h-4 w-4 mr-2" />
                Gerar Link
              </Button>
              {canEdit && (
                <Button onClick={() => handleCreatePost()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Post
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
                  <Grid className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{posts.length}</div>
                  <p className="text-xs text-muted-foreground">Posts nesta organização</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Publicados</CardTitle>
                  <Badge variant="default">Publicado</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {posts.filter(p => p.status === 'published').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Posts já publicados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Agendados</CardTitle>
                  <Badge variant="secondary">Agendado</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {posts.filter(p => p.status === 'scheduled').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Posts agendados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Em Revisão</CardTitle>
                  <Badge variant="outline">Revisão</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {posts.filter(p => p.status === 'review').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
                </CardContent>
              </Card>
            </div>

        {/* Calendar/List Content */}
            {view === 'list' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Posts</CardTitle>
                  <CardDescription>
                    Todos os posts organizados por data de criação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{post.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={getStatusColor(post.status)}>
                              {post.status}
                            </Badge>
                            {post.channel_id && (
                              <Badge variant="outline">
                                Canal
                              </Badge>
                            )}
                            {post.campaign_id && (
                              <Badge variant="outline">
                                Campanha
                              </Badge>
                            )}
                          </div>
                          {post.publish_at && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Publicar em: {new Date(post.publish_at).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handlePostClick(post)}>
                          Ver detalhes
                        </Button>
                      </div>
                    ))}

                    {posts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum post encontrado.</p>
                        {canEdit && (
                          <Button className="mt-4" onClick={() => handleCreatePost()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar primeiro post
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <CalendarView
                posts={posts}
                onPostClick={handlePostClick}
                onCreatePost={canEdit ? handleCreatePost : undefined}
                canEdit={canEdit}
              />
            )}
          </div>

          {/* Sidebar with Filters */}
          {showFilters && (
            <div className="lg:col-span-1">
              <ClientFilters
                selectedClient={selectedClient}
                selectedCompany={selectedCompany}
                selectedResponsibility={selectedResponsibility}
                onClientChange={setSelectedClient}
                onCompanyChange={setSelectedCompany}
                onResponsibilityChange={setSelectedResponsibility}
                clients={clients}
                companies={companies}
              />
            </div>
          )}
        </div>

        <ModernPostForm
          isOpen={showPostForm}
          onClose={() => {
            setShowPostForm(false);
            setSelectedPost(null);
            setDefaultDate(undefined);
          }}
          onSave={handleSavePost}
          initialData={selectedPost}
          channels={channels}
          campaigns={campaigns}
          defaultDate={defaultDate}
          orgId={organization?.id}
        />
      </main>
    </div>
  );
}