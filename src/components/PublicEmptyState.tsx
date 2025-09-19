import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Calendar, Lock, Users } from "lucide-react";

export function PublicEmptyState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-2xl p-8 text-center bg-gradient-card border-primary/20">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Calendar className="h-16 w-16 text-primary opacity-20" />
            <Shield className="h-8 w-8 text-primary absolute -top-1 -right-1" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Conteúdo Protegido
        </h2>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Este calendário editorial contém informações estratégicas e proprietárias dos nossos clientes. 
          Para proteger a confidencialidade dos dados de negócio, o acesso é restrito a usuários autorizados.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Lock className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium text-foreground">Conteúdo Estratégico</p>
              <p className="text-sm text-muted-foreground">Campanhas e insights dos clientes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Users className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium text-foreground">Acesso Controlado</p>
              <p className="text-sm text-muted-foreground">Apenas usuários autorizados</p>
            </div>
          </div>
        </div>
        
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
          <a href="/auth">
            <Shield className="h-4 w-4 mr-2" />
            Fazer Login
          </a>
        </Button>
      </Card>
    </div>
  );
}