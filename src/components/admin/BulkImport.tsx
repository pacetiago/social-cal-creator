import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function BulkImport({ orgId }: { orgId?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (!['xlsx', 'xls', 'csv'].includes(fileExt || '')) {
        toast({
          title: 'Formato inválido',
          description: 'Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)',
          variant: 'destructive',
        });
        return;
      }
      
      setFile(selectedFile);
      setResults(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione um arquivo primeiro',
        variant: 'destructive',
      });
      return;
    }

    if (!orgId) {
      toast({
        title: 'Organização não selecionada',
        description: 'Por favor, selecione uma organização',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      // Read file as base64 with proper Promise handling
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Falha ao ler o arquivo'));
        reader.readAsDataURL(file);
      });

      setProgress(30);

      // Get session and call edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const resp = await supabase.functions.invoke('bulk-import-posts', {
        body: {
          file: base64.split(',')[1], // Remove data:*/*;base64, prefix
          filename: file.name,
          orgId: orgId
        },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      setProgress(100);

      // Handle response errors
      if (resp.error) {
        console.error('Edge function error:', resp.error);
        console.error('Response data:', resp.data);
        
        // Try to extract error message from various possible locations
        const serverMsg = (resp.data as any)?.error || resp.error.message;
        throw new Error(serverMsg || 'Erro ao processar importação');
      }

      // Check if we have valid data
      if (!resp.data) {
        throw new Error('Nenhuma resposta recebida da função de importação');
      }

      console.log('Import results:', resp.data);
      setResults(resp.data);
      setFile(null);
      
      // Clear file input
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (input) input.value = '';

      // Show success toast
      const successCount = resp.data.success || 0;
      const failedCount = resp.data.failed || 0;
      
      toast({
        title: successCount > 0 ? 'Importação concluída' : 'Importação com erros',
        description: `${successCount} posts importados com sucesso${failedCount > 0 ? `. ${failedCount} com erros.` : '.'}`,
        variant: successCount > 0 ? 'default' : 'destructive',
      });

      // Log detailed errors if any
      if (resp.data.errors && resp.data.errors.length > 0) {
        console.error('Detailed import errors:', resp.data.errors);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Erro na importação',
        description: error.message || 'Não foi possível importar os dados',
        variant: 'destructive',
      });
      setResults(null);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Importação em Massa de Posts
        </CardTitle>
        <CardDescription>
          Faça upload de uma planilha Excel ou CSV para importar múltiplos posts de uma vez.
          <br />
          <strong>Colunas aceitas:</strong> Cliente, Empresa, Data, Canal/Rede Social, Tipo de Mídia, Assunto, Conteúdo, Responsabilidade, Linha Editorial, Insight
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Selecionar Arquivo</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={importing}
          />
          {file && (
            <p className="text-sm text-muted-foreground mt-2">
              Arquivo selecionado: {file.name}
            </p>
          )}
        </div>

        {importing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              Processando... {progress}%
            </p>
          </div>
        )}

        {results && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">Resultados da Importação</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{results.success || 0}</p>
                  <p className="text-xs text-muted-foreground">Sucessos</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{results.failed || 0}</p>
                  <p className="text-xs text-muted-foreground">Erros</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{results.warnings || 0}</p>
                  <p className="text-xs text-muted-foreground">Avisos</p>
                </div>
              </div>
            </div>

            {results.errors && results.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Erros:</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {results.errors.map((error: any, idx: number) => (
                    <div key={idx} className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
                      Linha {error.row}: {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleImport}
            disabled={!file || importing}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing ? 'Importando...' : 'Importar Posts'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              const link = document.createElement('a');
              link.href = 'https://docs.google.com/spreadsheets/d/1Wk1u48wo9ltkaqpL9_gVoeh0KdPn10Dx/edit?usp=sharing';
              link.target = '_blank';
              link.click();
            }}
          >
            Ver Exemplo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}