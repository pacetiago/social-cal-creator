import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserOrganizations } from '@/hooks/useUserOrganizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, BarChart3, Settings } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();
  const { userOrganizations, loading: orgsLoading } = useUserOrganizations();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !orgsLoading) {
      // Check if user is platform admin
      if (user.user_metadata?.role === 'platform_admin') {
        navigate('/admin/orgs');
        return;
      }
      
      // Check if user has access to any organization
      if (userOrganizations.length > 1) {
        // Multiple organizations - let user choose
        navigate('/select-org');
      } else if (userOrganizations.length === 1) {
        // Single organization - redirect directly
        navigate(`/c/${userOrganizations[0].slug}`);
      } else {
        // User has no organizations, show create org screen
        navigate('/admin/orgs');
      }
    }
  }, [user, userOrganizations, orgsLoading, navigate]);

  if (user && orgsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Cronograma Marsala</h1>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Entrar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">
            Cronograma Marsala - Planejamento de Conteúdo
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema completo da Marsala para organizar, planejar e gerenciar cronogramas de conteúdo para nossos clientes.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Começar Agora
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Calendário Editorial</CardTitle>
              <CardDescription>
                Visualize e organize todos os posts em um calendário intuitivo
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Gestão de Clientes</CardTitle>
              <CardDescription>
                Organize e gerencie cronogramas para múltiplos clientes da Marsala
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Kanban Board</CardTitle>
              <CardDescription>
                Acompanhe o status dos posts: ideia, rascunho, aprovado, publicado
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Settings className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Aprovações</CardTitle>
              <CardDescription>
                Sistema de aprovação com comentários e histórico de mudanças
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}