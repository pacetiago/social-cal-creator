import { CalendarPost, Company } from "@/types/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, Image, MessageSquare, Target, Building2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostModalProps {
  post: CalendarPost | null;
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  onDelete: (postId: string) => void;
}

export function PostModal({ post, isOpen, onClose, companies, onDelete }: PostModalProps) {
  if (!post) return null;

  const company = companies.find(c => c.id === post.companyId);
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getEditorialLineColor = (line: string) => {
    switch (line) {
      case 'SAZONAL':
        return 'bg-editorial-sazonal text-white';
      case 'INSTITUCIONAL':
        return 'bg-editorial-institucional text-white';
      case 'BLOG':
        return 'bg-editorial-blog text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSocialNetworkColor = (network: string) => {
    switch (network) {
      case 'Facebook':
        return 'bg-social-facebook text-white';
      case 'Instagram':
        return 'bg-social-instagram text-white';
      case 'LinkedIn':
        return 'bg-social-linkedin text-white';
      case 'Site':
        return 'bg-social-site text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            {post.subject}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">
              {monthNames[post.month]} {post.day}, {post.year}
            </p>
            {company && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: company.color }}
                />
                <span className="text-sm text-muted-foreground">{company.name}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {company && (
              <Card className="p-4 bg-gradient-card">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Empresa</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: company.color }}
                  />
                  <span className="text-sm font-medium">{company.name}</span>
                </div>
              </Card>
            )}

            <Card className="p-4 bg-gradient-card">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">Linha Editorial</h3>
              </div>
              <Badge className={cn("text-sm", getEditorialLineColor(post.editorialLine))}>
                {post.editorialLine}
              </Badge>
            </Card>

            <Card className="p-4 bg-gradient-card">
              <div className="flex items-center gap-2 mb-3">
                <Image className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">Tipo de Mídia</h3>
              </div>
              <Badge variant="outline" className="text-sm">
                {post.mediaType}
              </Badge>
            </Card>
          </div>

          {/* Social Networks */}
          <Card className="p-4 bg-gradient-card">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">Redes Sociais</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.networks.map((network) => (
                <Badge 
                  key={network}
                  className={cn("text-sm", getSocialNetworkColor(network))}
                >
                  {network}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Channels */}
          <Card className="p-4 bg-gradient-card">
            <h3 className="font-semibold text-foreground mb-3">Canais</h3>
            <div className="flex flex-wrap gap-2">
              {post.channels.map((channel, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {channel}
                </Badge>
              ))}
            </div>
          </Card>

          <Separator />

          {/* Content */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 text-lg">Conteúdo</h3>
            <Card className="p-4 bg-muted/30">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </Card>
          </div>

          {/* Insight */}
          {post.insight && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 text-lg">Insight</h3>
              <Card className="p-4 bg-primary/5 border-primary/20">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {post.insight}
                </p>
              </Card>
            </div>
           )}
         </div>

         <DialogFooter className="border-t pt-4 mt-6">
           <AlertDialog>
             <AlertDialogTrigger asChild>
               <Button variant="destructive" className="flex items-center gap-2">
                 <Trash2 className="h-4 w-4" />
                 Excluir Post
               </Button>
             </AlertDialogTrigger>
             <AlertDialogContent>
               <AlertDialogHeader>
                 <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                 <AlertDialogDescription>
                   Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel>Cancelar</AlertDialogCancel>
                 <AlertDialogAction 
                   onClick={() => onDelete(post.id)}
                   className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                 >
                   Excluir
                 </AlertDialogAction>
               </AlertDialogFooter>
             </AlertDialogContent>
           </AlertDialog>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }