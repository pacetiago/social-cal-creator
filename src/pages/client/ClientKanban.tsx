import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientKanban() {
  const { organization, loading, hasAccess } = useOrganization();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!hasAccess) {
    return <div className="min-h-screen flex items-center justify-center">
      <Card><CardHeader><CardTitle>Acesso Negado</CardTitle></CardHeader></Card>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">{organization?.name} - Kanban</h1>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Kanban Board</CardTitle>
            <CardDescription>Em desenvolvimento</CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
}