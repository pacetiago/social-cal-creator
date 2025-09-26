import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useClients } from '@/hooks/useClients';
import { useCompanies } from '@/hooks/useCompanies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Save, Trash2, Building2 } from 'lucide-react';

export default function AdminCompanies() {
  const { organizations } = useOrganizations();
  const [orgId, setOrgId] = useState('');
  const { clients } = useClients(orgId || undefined);
  const [clientId, setClientId] = useState('');
  const { companies, addCompany, updateCompany, deleteCompany, loading } = useCompanies(clientId || undefined);

  const [newCompany, setNewCompany] = useState({ name: '', color: '#64748B' });
  const [editing, setEditing] = useState<Record<string, { name: string; color: string }>>({});

  const handleAdd = async () => {
    if (!newCompany.name.trim()) return;
    const res = await addCompany(newCompany);
    if (!res.error) setNewCompany({ name: '', color: '#64748B' });
  };

  const startEdit = (id: string, name: string, color: string) => {
    setEditing(prev => ({ ...prev, [id]: { name, color } }));
  };

  const saveEdit = async (id: string) => {
    const data = editing[id];
    if (!data) return;
    await updateCompany(id, { name: data.name, color: data.color });
    setEditing(prev => { const { [id]: _, ...rest } = prev; return rest; });
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Empresas por Cliente</h1>
            <p className="text-muted-foreground">Gerencie empresas vinculadas aos clientes de cada organização</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Seleção</CardTitle>
            <CardDescription>Escolha a organização e o cliente para editar suas empresas</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Organização</Label>
              <select
                className="w-full border rounded-md h-10 bg-background"
                value={orgId}
                onChange={(e) => { setOrgId(e.target.value); setClientId(''); }}
              >
                <option value="">Selecione...</option>
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Cliente</Label>
              <select
                className="w-full border rounded-md h-10 bg-background"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={!orgId}
              >
                <option value="">Selecione...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empresas</CardTitle>
            <CardDescription>Adicionar, atualizar ou desativar empresas do cliente selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end mb-4">
              <div className="flex-1">
                <Label>Nome</Label>
                <Input value={newCompany.name} onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })} placeholder="Nome da empresa" />
              </div>
              <div>
                <Label>Cor</Label>
                <Input type="color" value={newCompany.color} onChange={(e) => setNewCompany({ ...newCompany, color: e.target.value })} className="h-10 w-16 p-1" />
              </div>
              <Button onClick={handleAdd} disabled={!clientId || loading}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead className="w-40">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((comp) => {
                  const edit = editing[comp.id];
                  return (
                    <TableRow key={comp.id}>
                      <TableCell>
                        {edit ? (
                          <Input value={edit.name} onChange={(e) => setEditing(prev => ({ ...prev, [comp.id]: { ...edit, name: e.target.value } }))} />
                        ) : (
                          <span>{comp.name}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {edit ? (
                          <Input type="color" value={edit.color} onChange={(e) => setEditing(prev => ({ ...prev, [comp.id]: { ...edit, color: e.target.value } }))} className="h-10 w-16 p-1" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: comp.color }} />
                        )}
                      </TableCell>
                      <TableCell className="space-x-2">
                        {edit ? (
                          <Button size="sm" onClick={() => saveEdit(comp.id)}>
                            <Save className="h-4 w-4 mr-1" /> Salvar
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => startEdit(comp.id, comp.name, comp.color)}>Editar</Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deleteCompany(comp.id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Desativar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!clientId || companies.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">{clientId ? 'Nenhuma empresa encontrada.' : 'Selecione um cliente.'}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
