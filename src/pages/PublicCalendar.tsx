import { useState } from 'react';
import { usePublicCalendar } from '@/hooks/usePublicCalendar';
import { CalendarView } from '@/components/calendar/CalendarView';
import { ClientFilters } from '@/components/calendar/ClientFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Grid, List, Filter } from 'lucide-react';
import { Post, PostStatus } from '@/types/multi-tenant';

export default function PublicCalendar() {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedResponsibility, setSelectedResponsibility] = useState('');
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get share token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const shareToken = urlParams.get('share');

  // Fetch public calendar data
  const { 
    data: publicData, 
    loading, 
    error,
    isValidToken 
  } = usePublicCalendar({
    token: shareToken || undefined,
    clientId: selectedClient || undefined,
    companyId: selectedCompany || undefined,
    responsibility: selectedResponsibility || undefined
  });

  const organization = publicData?.organization;
  const posts = publicData?.posts || [];
  const channels = publicData?.channels || [];
  const clients = publicData?.clients || [];
  const companies = publicData?.companies || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!shareToken || isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>{error}</CardDescription>
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
              <p className="text-muted-foreground">Calendário Editorial (Visualização Pública)</p>
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
                    {posts.map((post: Post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{post.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={getStatusColor(post.status)}>
                              {post.status}
                            </Badge>
                          </div>
                          {post.publish_at && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Publicar em: {new Date(post.publish_at).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {posts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum post encontrado.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <CalendarView
                posts={posts}
                onPostClick={() => {}}
                canEdit={false}
                channels={channels}
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
      </main>
    </div>
  );
}