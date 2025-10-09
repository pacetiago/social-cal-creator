import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { usePosts } from '@/hooks/usePosts';
import { useChannels } from '@/hooks/useChannels';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useClients } from '@/hooks/useClients';
import { useCompanies } from '@/hooks/useCompanies';
import { usePublicCalendar } from '@/hooks/usePublicCalendar';
import { CalendarView } from '@/components/calendar/CalendarView';
import { ModernPostForm } from '@/components/calendar/ModernPostForm';
import { ClientFilters } from '@/components/calendar/ClientFilters';
import { PostSelection } from '@/components/posts/PostSelection';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Grid, List, Plus, Filter, CheckSquare } from 'lucide-react';
import { PostStatus, Post } from '@/types/multi-tenant';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';

export default function ClientCalendar() {
  const { organization, loading: orgLoading, hasAccess, canEdit, canManage } = useOrganization();
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedResponsibility, setSelectedResponsibility] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [contentQuery, setContentQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  
  // Check for share token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const shareToken = urlParams.get('share');
  const isPublicView = !!shareToken;

  // Public calendar data
  const { 
    data: publicData, 
    loading: publicLoading, 
    error: publicError,
    isValidToken 
  } = usePublicCalendar({
    token: shareToken || undefined,
    clientId: selectedClient || undefined,
    companyId: selectedCompany || undefined,
    responsibility: selectedResponsibility || undefined
  });

  // Private calendar data (authenticated users)
  const { posts: privatePosts, loading: postsLoading, addPost, updatePost, deletePost } = usePosts({
    orgId: organization?.id,
    clientId: selectedClient || undefined,
    companyId: selectedCompany || undefined,
    responsibility: selectedResponsibility || undefined
  });
  const { channels: privateChannels } = useChannels(organization?.id);
  const { campaigns: privateCampaigns } = useCampaigns(organization?.id);
  const { clients: privateClients } = useClients(organization?.id);
  const { companies: privateCompanies } = useCompanies(selectedClient || undefined);

  // Use public or private data based on view mode
  const currentOrg = isPublicView ? publicData?.organization : organization;
  const posts = isPublicView ? (publicData?.posts || []) : privatePosts;
  const channels = isPublicView ? (publicData?.channels || []) : privateChannels;
  const campaigns = isPublicView ? (publicData?.campaigns || []) : privateCampaigns;
  const clients = isPublicView ? (publicData?.clients || []) : privateClients;
  const companies = isPublicView ? (publicData?.companies || []) : privateCompanies;
  const loading = isPublicView ? publicLoading : (orgLoading || postsLoading);
  
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showPostForm, setShowPostForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSelection, setShowSelection] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();

  // Filter posts client-side
  const filterPosts = (allPosts: Post[]) => {
    return allPosts.filter(post => {
      // Filter by media type
      if (mediaType && mediaType !== 'all' && post.media_type !== mediaType) {
        return false;
      }

      // Filter by content query (search in title and content)
      if (contentQuery) {
        const query = contentQuery.toLowerCase();
        const titleMatch = post.title?.toLowerCase().includes(query);
        const contentMatch = post.content?.toLowerCase().includes(query);
        if (!titleMatch && !contentMatch) {
          return false;
        }
      }

      // Filter by start date
      if (startDate && post.publish_at) {
        const postDate = new Date(post.publish_at);
        if (postDate < startDate) {
          return false;
        }
      }

      // Filter by end date
      if (endDate && post.publish_at) {
        const postDate = new Date(post.publish_at);
        if (postDate > endDate) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredPosts = filterPosts(posts);

  const clearFilters = () => {
    setSelectedClient('');
    setSelectedCompany('');
    setSelectedResponsibility('');
    setMediaType('all');
    setContentQuery('');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Public view with invalid token
  if (isPublicView && isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Link Inválido</CardTitle>
            <CardDescription>
              Este link de compartilhamento é inválido ou expirou.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Private view without access
  if (!isPublicView && !hasAccess) {
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
    setShowPostForm(false);
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
    setShowPostForm(false);
  };


  const handleBulkDelete = async (postIds: string[]) => {
    for (const postId of postIds) {
      await deletePost(postId);
    }
    setShowSelection(false);
  };

  const handleBulkApprove = async (postIds: string[]) => {
    for (const postId of postIds) {
      await updatePost(postId, { status: 'approved' as PostStatus });
    }
    setShowSelection(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{currentOrg?.name}</h1>
              <p className="text-muted-foreground">
                Calendário Editorial {isPublicView && '(Visualização Pública)'}
              </p>
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
              {!isPublicView && canEdit && (
                <Button 
                  variant={showSelection ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setShowSelection(!showSelection)}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Seleção em Massa
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <ThemeToggle />
              {!isPublicView && canEdit && (
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
                  <div className="text-2xl font-bold">{filteredPosts.length}</div>
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
                    {filteredPosts.filter(p => p.status === 'published').length}
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
                    {filteredPosts.filter(p => p.status === 'scheduled').length}
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
                    {filteredPosts.filter(p => p.status === 'review').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
                </CardContent>
              </Card>
            </div>

        {/* Calendar/List Content */}
            {showSelection ? (
              <Card>
                <CardHeader>
                  <CardTitle>Seleção em Massa</CardTitle>
                  <CardDescription>
                    Selecione posts para ações em massa como aprovação ou exclusão
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PostSelection
                    posts={filteredPosts}
                    onBulkDelete={handleBulkDelete}
                    onBulkApprove={handleBulkApprove}
                    onCancel={() => setShowSelection(false)}
                  />
                </CardContent>
              </Card>
            ) : view === 'list' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Posts</CardTitle>
                  <CardDescription>
                    Todos os posts organizados por data de criação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPosts.map((post) => (
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

                    {filteredPosts.length === 0 && (
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
                posts={filteredPosts}
                onPostClick={handlePostClick}
                onCreatePost={!isPublicView && canEdit ? handleCreatePost : undefined}
                canEdit={!isPublicView && canEdit}
                channels={channels}
              />
            )}
          </div>

          {/* Sidebar with Filters */}
          {showFilters && (
            <div className="lg:col-span-1">
              <ErrorBoundary>
                <ClientFilters
                  selectedClient={selectedClient}
                  selectedCompany={selectedCompany}
                  selectedResponsibility={selectedResponsibility}
                  mediaType={mediaType}
                  contentQuery={contentQuery}
                  startDate={startDate}
                  endDate={endDate}
                  onClientChange={setSelectedClient}
                  onCompanyChange={setSelectedCompany}
                  onResponsibilityChange={setSelectedResponsibility}
                  onMediaTypeChange={setMediaType}
                  onContentQueryChange={setContentQuery}
                  onDateRangeChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  onClear={clearFilters}
                  clients={clients || []}
                  companies={companies || []}
                />
              </ErrorBoundary>
            </div>
          )}
        </div>

        {!isPublicView && showPostForm && (
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
            clients={clients}
            onDelete={handleDeletePost}
          />
        )}
      </main>
    </div>
  );
}