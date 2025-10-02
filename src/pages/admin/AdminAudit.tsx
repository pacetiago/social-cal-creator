import { useState } from 'react';
import { Filter, Search, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/AdminLayout';
import { useAuditLogs } from '@/hooks/useAuditLogs';

export default function AdminAudit() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [tableFilter, setTableFilter] = useState('all');
  const { logs: auditLogs, loading, refetch } = useAuditLogs();

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = (log.actor_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         log.target_table.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.org_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesTable = tableFilter === 'all' || log.target_table === tableFilter;
    
    return matchesSearch && matchesAction && matchesTable;
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'default';
      case 'UPDATE': return 'secondary';
      case 'DELETE': return 'destructive';
      default: return 'outline';
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
              <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
              <p className="text-muted-foreground">Acompanhe todas as atividades da plataforma</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Logs
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Atividades</CardTitle>
            <CardDescription>
              Visualize todas as mudanças realizadas na plataforma por usuário e organização
            </CardDescription>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário, tabela ou organização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="INSERT">Criação</SelectItem>
                    <SelectItem value="UPDATE">Atualização</SelectItem>
                    <SelectItem value="DELETE">Exclusão</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={tableFilter} onValueChange={setTableFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tabela" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="posts">Posts</SelectItem>
                    <SelectItem value="campaigns">Campanhas</SelectItem>
                    <SelectItem value="channels">Canais</SelectItem>
                    <SelectItem value="memberships">Membros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>ID do Registro</TableHead>
                  <TableHead>Alterações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>{log.actor_name || 'Sistema'}</TableCell>
                    <TableCell>{log.org_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {log.target_table}
                      </code>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.target_id}
                    </TableCell>
                    <TableCell>
                      <details className="cursor-pointer">
                        <summary className="text-sm text-muted-foreground hover:text-foreground">
                          Ver alterações
                        </summary>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded">
                          {JSON.stringify(log.diff, null, 2)}
                        </pre>
                      </details>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum log encontrado com os filtros aplicados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}