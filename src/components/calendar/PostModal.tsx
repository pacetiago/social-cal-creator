import { CalendarPost } from "@/types/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Calendar, Image, MessageSquare, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostModalProps {
  post: CalendarPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostModal({ post, isOpen, onClose }: PostModalProps) {
  if (!post) return null;

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
          <p className="text-muted-foreground">
            Outubro {post.day}, 2025
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </DialogContent>
    </Dialog>
  );
}