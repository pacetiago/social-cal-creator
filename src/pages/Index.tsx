import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, BarChart3, Settings } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in and has platform admin role, redirect to admin
    if (user) {
      // For now, redirect to demo organization calendar
      navigate('/c/demo/calendar');
    }
  }, [user, navigate]);

  if (user) {
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
            <h1 className="text-2xl font-bold">SocialMed Calendar</h1>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Entrar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">
            Gerencie seus conteúdos de redes sociais
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma multi-tenant para agências e empresas organizarem, aprovarem e publicarem conteúdos nas redes sociais.
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
              <CardTitle>Multi-tenant</CardTitle>
              <CardDescription>
                Gerencie múltiplos clientes com permissões e roles granulares
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