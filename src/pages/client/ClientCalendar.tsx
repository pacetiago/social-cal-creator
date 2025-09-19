import { useState } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { usePosts } from '@/hooks/usePosts';
import { useChannels } from '@/hooks/useChannels';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Grid, List, Plus, Filter } from 'lucide-react';
import { PostStatus } from '@/types/multi-tenant';

export default function ClientCalendar() {
  const { organization, loading: orgLoading, hasAccess, canEdit } = useOrganization();
  const { posts, loading: postsLoading } = usePosts({ 
    orgId: organization?.id 
  });
  const { channels } = useChannels(organization?.id);
  const { campaigns } = useCampaigns(organization?.id);
  
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              {canEdit && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Post
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
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
                        {post.channel && (
                          <Badge variant="outline">
                            {post.channel.name}
                          </Badge>
                        )}
                        {post.campaign && (
                          <Badge variant="outline">
                            {post.campaign.name}
                          </Badge>
                        )}
                      </div>
                      {post.publish_at && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Publicar em: {new Date(post.publish_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Ver detalhes
                    </Button>
                  </div>
                ))}

                {posts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum post encontrado.</p>
                    {canEdit && (
                      <Button className="mt-4">
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
          <Card>
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
              <CardDescription>
                Visualização em calendário - Em desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Visualização em Calendário</p>
                <p>Esta funcionalidade será implementada em breve.</p>
                <p className="mt-4">Por enquanto, use a visualização em lista.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}