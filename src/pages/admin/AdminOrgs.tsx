import { useState } from 'react';
import { Plus, Search, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { AdminLayout } from '@/components/AdminLayout';

export default function AdminOrgs() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with real data from useOrganizations hook
  const organizations = [
    {
      id: '1',
      name: 'Demo Agency',
      slug: 'demo',
      status: 'active',
      created_at: '2024-01-15',
      membersCount: 5,
      postsCount: 23,
      campaignsCount: 3
    },
    {
      id: '2',
      name: 'Varejo Brasil',
      slug: 'varejo-br',
      status: 'active',
      created_at: '2024-01-20',
      membersCount: 8,
      postsCount: 45,
      campaignsCount: 7
    }
  ];

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Administração</h1>
              <p className="text-muted-foreground">Gerencie organizações e configurações da plataforma</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Organização
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Organizações</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizations.length}</div>
              <p className="text-xs text-muted-foreground">+1 desde o último mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizações Ativas</CardTitle>
              <Badge variant="outline" className="text-green-600">
                Ativo
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organizations.filter(org => org.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">100% das organizações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organizations.reduce((sum, org) => sum + org.postsCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Todos os posts da plataforma</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organizations.reduce((sum, org) => sum + org.membersCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Todos os membros ativos</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organizações</CardTitle>
            <CardDescription>
              Gerencie todas as organizações da plataforma
            </CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar organizações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Membros</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Campanhas</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        /c/{org.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={org.status === 'active' ? 'default' : 'secondary'}
                      >
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{org.membersCount}</TableCell>
                    <TableCell>{org.postsCount}</TableCell>
                    <TableCell>{org.campaignsCount}</TableCell>
                    <TableCell>
                      {new Date(org.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}