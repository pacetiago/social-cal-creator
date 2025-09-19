import { useState } from 'react';
import { Search, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { AdminLayout } from '@/components/AdminLayout';
import { useOrganizations } from '@/hooks/useOrganizations';
import { OrganizationForm } from '@/components/admin/OrganizationForm';
import { MembersModal } from '@/components/admin/MembersModal';

export default function AdminOrgs() {
  const { organizations, loading, addOrganization } = useOrganizations();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<{ id: string; name: string } | null>(null);

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrg = async (orgData: { name: string; slug: string }) => {
    const result = await addOrganization(orgData);
    if (result.error === null) {
      setShowForm(false);
    }
    return result;
  };

  const handleShowMembers = (org: { id: string; name: string }) => {
    setSelectedOrg(org);
    setShowMembers(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  const totalOrgs = organizations.length;
  const activeOrgs = organizations.filter(org => org.status === 'active').length;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Organizações</h1>
              <p className="text-muted-foreground">Gerencie todas as organizações da plataforma</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Organização
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Organizações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrgs}</div>
              <p className="text-xs text-muted-foreground">
                Todas as organizações registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizações Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeOrgs}</div>
              <p className="text-xs text-muted-foreground">
                Organizações com status ativo
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Organizações</CardTitle>
            <CardDescription>
              Visualize e gerencie todas as organizações da plataforma
            </CardDescription>
            
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou slug..."
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
                        {org.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                        {org.status === 'active' ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(org.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShowMembers({ id: org.id, name: org.name })}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Membros
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredOrgs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma organização encontrada.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <OrganizationForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleCreateOrg}
        />
        
        {selectedOrg && (
          <MembersModal
            isOpen={showMembers}
            onClose={() => {
              setShowMembers(false);
              setSelectedOrg(null);
            }}
            orgId={selectedOrg.id}
            orgName={selectedOrg.name}
          />
        )}
      </div>
    </AdminLayout>
  );
}