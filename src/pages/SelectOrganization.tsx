import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserOrganizations } from '@/hooks/useUserOrganizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, Users } from 'lucide-react';

export default function SelectOrganization() {
  const { user } = useAuth();
  const { userOrganizations, loading } = useUserOrganizations();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Se usuário tem apenas uma organização, redirecionar diretamente
    if (!loading && userOrganizations.length === 1) {
      navigate(`/c/${userOrganizations[0].slug}`);
    }
  }, [user, userOrganizations, loading, navigate]);

  const handleSelectOrganization = (orgSlug: string) => {
    navigate(`/c/${orgSlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userOrganizations.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Nenhuma Organização Encontrada</CardTitle>
            <CardDescription>
              {inviteToken ? 
                'O convite não foi encontrado ou expirou.' : 
                'Você ainda não tem acesso a nenhuma organização.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Entre em contato com o administrador para solicitar acesso.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Selecionar Organização</h1>
            </div>
            <Badge variant="outline">
              {user?.email}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Escolha uma Organização
            </h2>
            <p className="text-muted-foreground">
              Você tem acesso às seguintes organizações. Selecione uma para continuar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userOrganizations.map((org) => (
              <Card key={org.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>{org.name}</span>
                    </CardTitle>
                    <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                      {org.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Acesse o calendário editorial desta organização
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>/{org.slug}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleSelectOrganization(org.slug)}
                  >
                    Acessar Calendário
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {inviteToken && (
            <div className="mt-8 text-center">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-yellow-600">Convite Pendente</CardTitle>
                  <CardDescription>
                    Você foi convidado para uma organização específica.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Se você não vê a organização acima, o convite pode estar sendo processado ou ter expirado.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}