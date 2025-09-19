import { CalendarPost, CalendarStats } from "@/types/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, PieChart, Calendar, TrendingUp } from "lucide-react";

interface CalendarAnalyticsProps {
  posts: CalendarPost[];
}

export function CalendarAnalytics({ posts }: CalendarAnalyticsProps) {
  const calculateStats = (): CalendarStats => {
    const stats: CalendarStats = {
      totalPosts: posts.length,
      postsByNetwork: { Facebook: 0, Instagram: 0, LinkedIn: 0, Site: 0 },
      postsByEditorialLine: { SAZONAL: 0, INSTITUCIONAL: 0, BLOG: 0, ROTEIRO: 0 },
      postsByMediaType: { Imagem: 0, Vídeo: 0, Carrossel: 0, 'Texto blog': 0 },
    };

    posts.forEach(post => {
      // Count networks (a post can have multiple networks)
      post.networks.forEach(network => {
        stats.postsByNetwork[network]++;
      });

      // Count editorial lines
      stats.postsByEditorialLine[post.editorialLine]++;

      // Count media types
      stats.postsByMediaType[post.mediaType]++;
    });

    return stats;
  };

  const stats = calculateStats();
  const totalNetworkPosts = Object.values(stats.postsByNetwork).reduce((a, b) => a + b, 0);

  const getEditorialLineColor = (line: string) => {
    switch (line) {
      case 'SAZONAL':
        return 'bg-editorial-sazonal';
      case 'INSTITUCIONAL':
        return 'bg-editorial-institucional';
      case 'BLOG':
        return 'bg-editorial-blog';
      case 'ROTEIRO':
        return 'bg-editorial-roteiro';
      default:
        return 'bg-muted';
    }
  };

  const getSocialNetworkColor = (network: string) => {
    switch (network) {
      case 'Facebook':
        return 'bg-social-facebook';
      case 'Instagram':
        return 'bg-social-instagram';
      case 'LinkedIn':
        return 'bg-social-linkedin';
      case 'Site':
        return 'bg-social-site';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-card shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Posts</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalPosts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-blue/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-brand-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média por Dia</p>
              <p className="text-2xl font-bold text-foreground">
                {(stats.totalPosts / 31).toFixed(1)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-green/10 rounded-lg">
              <PieChart className="h-6 w-6 text-brand-green" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Redes Ativas</p>
              <p className="text-2xl font-bold text-foreground">
                {Object.values(stats.postsByNetwork).filter(count => count > 0).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-orange/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-brand-orange" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Linha Mais Usada</p>
              <p className="text-lg font-bold text-foreground">
                {Object.entries(stats.postsByEditorialLine).reduce((a, b) => 
                  stats.postsByEditorialLine[a[0] as keyof typeof stats.postsByEditorialLine] > 
                  stats.postsByEditorialLine[b[0] as keyof typeof stats.postsByEditorialLine] ? a : b
                )[0]}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Social Networks Distribution */}
        <Card className="p-6 bg-gradient-card shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Distribuição por Rede Social
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.postsByNetwork)
              .sort(([,a], [,b]) => b - a)
              .map(([network, count]) => (
                <div key={network} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-white ${getSocialNetworkColor(network)}`}>
                        {network}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {count} posts ({totalNetworkPosts > 0 ? Math.round((count / totalNetworkPosts) * 100) : 0}%)
                    </span>
                  </div>
                  <Progress 
                    value={totalNetworkPosts > 0 ? (count / totalNetworkPosts) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              ))}
          </div>
        </Card>

        {/* Editorial Lines Distribution */}
        <Card className="p-6 bg-gradient-card shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Distribuição por Linha Editorial
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.postsByEditorialLine)
              .sort(([,a], [,b]) => b - a)
              .map(([line, count]) => (
                <div key={line} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-white ${getEditorialLineColor(line)}`}>
                        {line}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {count} posts ({stats.totalPosts > 0 ? Math.round((count / stats.totalPosts) * 100) : 0}%)
                    </span>
                  </div>
                  <Progress 
                    value={stats.totalPosts > 0 ? (count / stats.totalPosts) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              ))}
          </div>
        </Card>

        {/* Media Types Distribution */}
        <Card className="p-6 bg-gradient-card shadow-soft lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Distribuição por Tipo de Mídia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats.postsByMediaType)
              .sort(([,a], [,b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="space-y-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{count}</div>
                    <div className="text-sm text-muted-foreground">{type}</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.totalPosts > 0 ? Math.round((count / stats.totalPosts) * 100) : 0}%
                    </div>
                  </div>
                  <Progress 
                    value={stats.totalPosts > 0 ? (count / stats.totalPosts) * 100 : 0} 
                    className="h-1"
                  />
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}