import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Eye, Crown } from 'lucide-react';

export default function AdminRoles() {
  const platformRoles = [
    {
      name: 'Platform Owner',
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
      permissions: [
        'Acesso total a todas as organizações',
        'Gerenciar usuários e atribuir qualquer role',
        'Criar e deletar organizações',
        'Atribuir role "platform_owner" a outros usuários',
        'Visualizar todos os logs de auditoria',
        'Acesso total ao painel administrativo'
      ]
    },
    {
      name: 'Platform Admin',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-950',
      permissions: [
        'Acesso a todas as organizações',
        'Gerenciar usuários (exceto atribuir "platform_owner")',
        'Criar organizações',
        'Visualizar logs de auditoria',
        'Gerenciar canais e empresas',
        'Não pode modificar a própria role'
      ]
    },
    {
      name: 'Platform Viewer',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
      permissions: [
        'Visualizar organizações (somente leitura)',
        'Visualizar usuários (somente leitura)',
        'Sem permissão para editar ou criar',
        'Sem acesso a logs de auditoria completos'
      ]
    },
    {
      name: 'User',
      icon: Users,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      permissions: [
        'Acesso somente às organizações onde é membro',
        'Permissões definidas por role de organização (OWNER, ADMIN, EDITOR, VIEWER)',
        'Não pode acessar painel administrativo',
        'Não pode gerenciar outros usuários'
      ]
    }
  ];

  const orgRoles = [
    {
      name: 'OWNER',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
      permissions: [
        'Acesso total à organização',
        'Gerenciar membros e suas roles',
        'Criar/editar/deletar posts, clientes, empresas',
        'Gerenciar configurações da organização',
        'Deletar a organização',
        'Gerar tokens de compartilhamento'
      ]
    },
    {
      name: 'ADMIN',
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-950',
      permissions: [
        'Gerenciar membros (exceto OWNER)',
        'Criar/editar/deletar posts, clientes, empresas',
        'Gerenciar canais e filtros',
        'Gerar tokens de compartilhamento',
        'Não pode deletar a organização'
      ]
    },
    {
      name: 'EDITOR',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
      permissions: [
        'Criar e editar posts',
        'Gerenciar assets (anexos)',
        'Visualizar clientes e empresas',
        'Não pode gerenciar membros',
        'Não pode deletar posts'
      ]
    },
    {
      name: 'VIEWER',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      permissions: [
        'Somente leitura',
        'Visualizar posts, clientes, empresas',
        'Não pode criar, editar ou deletar',
        'Pode exportar relatórios (se permitido)'
      ]
    }
  ];

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Gerenciador de Cargos</h1>
          <p className="text-muted-foreground">
            Visão geral de roles e permissões da plataforma e organizações
          </p>
        </div>

        {/* Platform Roles */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Roles de Plataforma</h2>
            <p className="text-sm text-muted-foreground">
              Roles que concedem permissões globais na plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platformRoles.map((role) => (
              <Card key={role.name} className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${role.bgColor}`}>
                      <role.icon className={`h-6 w-6 ${role.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <Badge variant="outline" className={role.color}>
                        Nível de Plataforma
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Permissões:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {role.permissions.map((perm, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{perm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Organization Roles */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Roles de Organização</h2>
            <p className="text-sm text-muted-foreground">
              Roles que concedem permissões dentro de uma organização específica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgRoles.map((role) => (
              <Card key={role.name} className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${role.bgColor}`}>
                      <Shield className={`h-6 w-6 ${role.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <Badge variant="outline" className={role.color}>
                        Nível de Organização
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Permissões:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {role.permissions.map((perm, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{perm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Security Notes */}
        <Card className="border-orange-500 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Shield className="h-5 w-5" />
              Notas de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • <strong>Platform Owner</strong> é a role mais privilegiada e só deve ser atribuída a administradores de confiança.
            </p>
            <p>
              • Somente <strong>Platform Owners</strong> podem atribuir a role "platform_owner" a outros usuários.
            </p>
            <p>
              • Usuários não podem modificar sua própria platform role por questões de segurança.
            </p>
            <p>
              • Todas as alterações de roles são registradas nos logs de auditoria.
            </p>
            <p>
              • Row Level Security (RLS) garante que usuários só acessem dados conforme suas permissões.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
