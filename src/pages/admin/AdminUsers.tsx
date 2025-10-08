import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, UserPlus, MoreHorizontal, Trash2, UserX } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createUserSchema, sanitizeInput } from '@/lib/validation';
import type { CreateUserData } from '@/lib/validation';

export default function AdminUsers() {
  const { users, loading, updateUserRole, refetch } = useUsers();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user'
  });
  const [creating, setCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateUserRole(userId, newRole as 'platform_owner' | 'platform_admin' | 'platform_viewer' | 'user');
  };

  const handleDeactivateUser = async (userId: string, userEmail: string) => {
    if (confirm(`Tem certeza que deseja desativar o usuário ${userEmail}?`)) {
      try {
        const { error } = await supabase.functions.invoke('delete-user', {
          body: { userId }
        });

        if (error) throw error;

        await refetch();

        toast({
          title: 'Usuário desativado',
          description: `${userEmail} foi desativado.`,
        });
      } catch (error) {
        toast({
          title: 'Erro ao desativar usuário',
          description: 'Não foi possível desativar o usuário.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (confirm(`Tem certeza que deseja excluir o usuário ${userEmail}? Esta ação não pode ser desfeita.`)) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Usuário não autenticado');

        const { error } = await supabase.functions.invoke('delete-user', {
          body: { userId },
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (error) throw error;

        await refetch(); // Recarrega a lista de usuários

        toast({
          title: 'Usuário excluído',
          description: `${userEmail} foi removido do sistema.`,
        });
      } catch (error) {
        toast({
          title: 'Erro ao excluir usuário',
          description: 'Não foi possível excluir o usuário.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setValidationErrors({});

    try {
      // Sanitize and validate input
      const sanitizedData = {
        email: sanitizeInput(newUserData.email),
        password: newUserData.password,
        full_name: sanitizeInput(newUserData.full_name),
        role: newUserData.role as 'user' | 'admin' | 'platform_admin',
      };

      // Validate with Zod schema
      const validatedData = createUserSchema.parse(sanitizedData);

      // Get the current session to send with the request
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Call our edge function to create the user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: validatedData.email,
          password: validatedData.password,
          fullName: validatedData.full_name,
          role: validatedData.role
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Usuário criado com sucesso',
        description: `${validatedData.full_name} foi adicionado ao sistema.`,
      });

      setNewUserData({ email: '', password: '', full_name: '', role: 'user' });
      setShowCreateUser(false);
      await refetch(); // Recarrega a lista de usuários
    } catch (err: any) {
      if (err.errors) {
        // Zod validation errors
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error: any) => {
          newErrors[error.path[0]] = error.message;
        });
        setValidationErrors(newErrors);
      } else {
        console.error('Error creating user:', err);
        toast({
          title: 'Erro ao criar usuário',
          description: err instanceof Error ? err.message : 'Falha ao criar usuário',
          variant: 'destructive',
        });
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Usuários</h1>
              <p className="text-muted-foreground">Gerencie usuários e suas permissões</p>
            </div>
            <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Usuário</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={newUserData.full_name}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                      maxLength={100}
                    />
                    {validationErrors.full_name && (
                      <p className="text-sm text-destructive">{validationErrors.full_name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      maxLength={255}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-destructive">{validationErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={8}
                      maxLength={128}
                    />
                    {validationErrors.password && (
                      <p className="text-sm text-destructive">{validationErrors.password}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Mín. 8 caracteres com maiúscula, minúscula, número e caractere especial
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="role">Função</Label>
                    <Select
                      value={newUserData.role}
                      onValueChange={(value) => setNewUserData(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                       <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="platform_viewer">Visualizador</SelectItem>
                        <SelectItem value="platform_admin">Administrador</SelectItem>
                        <SelectItem value="platform_owner">Proprietário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateUser(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={creating}>
                      {creating ? 'Criando...' : 'Criar Usuário'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Usuários registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proprietários</CardTitle>
              <Badge variant="outline" className="text-purple-600">
                Owner
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.platform_role === 'platform_owner').length}
              </div>
              <p className="text-xs text-muted-foreground">Proprietários da plataforma</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Badge variant="outline" className="text-red-600">
                Admin
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.platform_role === 'platform_admin').length}
              </div>
              <p className="text-xs text-muted-foreground">Administradores da plataforma</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              Gerencie roles e permissões dos usuários
            </CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
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
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'Sem nome'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.platform_role || 'user'}
                        onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="platform_viewer">Visualizador</SelectItem>
                          <SelectItem value="platform_admin">Administrador</SelectItem>
                          <SelectItem value="platform_owner">Proprietário</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeactivateUser(user.id, user.email)}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Desativar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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