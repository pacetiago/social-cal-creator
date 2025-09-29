import { useMemo, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useChannels } from '@/hooks/useChannels';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ToggleLeft, ToggleRight, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChannelKey } from '@/types/multi-tenant';

const CHANNEL_KEYS: ChannelKey[] = ['instagram','tiktok','facebook','linkedin','x','youtube','blog','ebook','roteiro'];

export default function AdminChannels() {
  const { organizations } = useOrganizations();
  const [orgId, setOrgId] = useState('');
  const { channels, addChannel, toggleChannel } = useChannels(orgId || undefined);

  const [form, setForm] = useState<{ key: ChannelKey | ''; name: string }>({ key: '', name: '' });

  const canSubmit = useMemo(() => !!orgId && !!form.key && form.name.trim().length > 0, [orgId, form]);

  const handleAdd = async () => {
    if (!canSubmit) return;
    const res = await addChannel({ key: form.key as ChannelKey, name: form.name });
    if (!res.error) setForm({ key: '', name: '' });
  };

  const handleDeleteChannel = async (channelId: string, channelName: string) => {
    if (confirm(`Tem certeza que deseja excluir o canal ${channelName}?`)) {
      // Como não temos deleteChannel no hook, vamos usar updateChannel para desativar
      await toggleChannel(channelId, false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Canais de Mídia</h1>
            <p className="text-muted-foreground">Gerencie os canais disponíveis por organização (ex.: Instagram, TikTok)</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecionar Organização</CardTitle>
            <CardDescription>Os canais são específicos por organização</CardDescription>
          </CardHeader>
          <CardContent>
            <select
              className="w-full border rounded-md h-10 bg-background"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar Canal</CardTitle>
            <CardDescription>Defina o tipo e o nome que será exibido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label>Tipo</Label>
                <select
                  className="w-full border rounded-md h-10 bg-background"
                  value={form.key}
                  onChange={(e) => setForm(prev => ({ ...prev, key: e.target.value as ChannelKey }))}
                  disabled={!orgId}
                >
                  <option value="">Selecione...</option>
                  {CHANNEL_KEYS.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex.: Instagram" />
              </div>
              <div>
                <Button onClick={handleAdd} disabled={!canSubmit}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="w-32">Ativo</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell><code className="rounded bg-muted px-2 py-1 text-sm">{c.key}</code></TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => toggleChannel(c.id, !c.is_active)}>
                            {c.is_active ? <ToggleRight className="h-4 w-4 mr-2" /> : <ToggleLeft className="h-4 w-4 mr-2" />} {c.is_active ? 'Ativo' : 'Inativo'}
                          </Button>
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
                                onClick={() => handleDeleteChannel(c.id, c.name)}
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
                  {(!orgId || channels.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">{orgId ? 'Nenhum canal cadastrado.' : 'Selecione uma organização.'}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
