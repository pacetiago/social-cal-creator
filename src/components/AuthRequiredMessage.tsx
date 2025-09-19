import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, LogIn } from "lucide-react";

export function AuthRequiredMessage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="p-8 max-w-lg text-center bg-gradient-card shadow-soft">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Shield className="h-16 w-16 text-primary" />
            <Lock className="h-6 w-6 text-muted-foreground absolute -bottom-1 -right-1 bg-background rounded-full p-1" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Conteúdo Protegido
        </h2>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Este calendário contém estratégias de marketing e conteúdo editorial sensível. 
          Para proteger informações proprietárias de concorrentes, o acesso é restrito 
          apenas a usuários autenticados.
        </p>
        
        <Button asChild size="lg" className="w-full">
          <a href="/auth">
            <LogIn className="h-4 w-4 mr-2" />
            Fazer Login para Acessar
          </a>
        </Button>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <Shield className="h-3 w-3 inline mr-1" />
          Conteúdo protegido contra acesso não autorizado
        </div>
      </Card>
    </div>
  );
}