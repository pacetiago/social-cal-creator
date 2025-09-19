import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserPlus } from 'lucide-react';
import { useMemberships } from '@/hooks/useMemberships';
import { UserRole } from '@/types/multi-tenant';

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  orgName: string;
}

const roleLabels: Record<UserRole, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador'
};

const roleColors: Record<UserRole, 'default' | 'secondary' | 'destructive'> = {
  OWNER: 'destructive',
  ADMIN: 'default',
  EDITOR: 'secondary',
  VIEWER: 'default'
};

export function MembersModal({ isOpen, onClose, orgId, orgName }: MembersModalProps) {
  const { memberships, loading, addMembership, updateMembership, removeMembership } = useMemberships(orgId);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('VIEWER');
  const [adding, setAdding] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMemberEmail.trim()) {
      return;
    }

    setAdding(true);
    
    try {
      const result = await addMembership({
        user_email: newMemberEmail,
        role: newMemberRole
      });
      
      if (result.error === null) {
        setNewMemberEmail('');
        setNewMemberRole('VIEWER');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateRole = async (membershipId: string, newRole: UserRole) => {
    await updateMembership(membershipId, { role: newRole });
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (confirm('Tem certeza que deseja remover este membro da organização?')) {
      await removeMembership(membershipId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Membros da Organização: {orgName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Member Form */}
          <form onSubmit={handleAddMember} className="p-4 border rounded-lg space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Adicionar Novo Membro
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="email">Email do usuário</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="role">Papel</Label>
                <Select value={newMemberRole} onValueChange={(value) => setNewMemberRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEWER">Visualizador</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="OWNER">Proprietário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button type="submit" disabled={adding} className="w-full">
                  {adding ? 'Adicionando...' : 'Adicionar Membro'}
                </Button>
              </div>
            </div>
          </form>

          {/* Members List */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Carregando membros...
                    </TableCell>
                  </TableRow>
                ) : memberships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum membro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  memberships.map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell>
                        {membership.user_name || 'Nome não informado'}
                      </TableCell>
                      <TableCell>{membership.user_email}</TableCell>
                      <TableCell>
                        <Select 
                          value={membership.role} 
                          onValueChange={(value) => handleUpdateRole(membership.id, value as UserRole)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <Badge variant={roleColors[membership.role]}>
                              {roleLabels[membership.role]}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VIEWER">Visualizador</SelectItem>
                            <SelectItem value="EDITOR">Editor</SelectItem>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                            <SelectItem value="OWNER">Proprietário</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(membership.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}