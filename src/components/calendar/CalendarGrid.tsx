import { CalendarPost, Company } from "@/types/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  posts: CalendarPost[];
  onPostClick: (post: CalendarPost) => void;
  month: number;
  year: number;
  companies: Company[];
}

export function CalendarGrid({ posts, onPostClick, month, year, companies }: CalendarGridProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getCompanyColor = (post: CalendarPost) => {
    const company = companies.find(c => c.id === post.companyId);
    return company?.color || '#64748B'; // Default gray if no company data
  };

  const getPostsForDay = (day: number) => {
    return posts.filter(post => post.day === day);
  };

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

  const getResponsibilityColor = (responsibility: string) => {
    switch (responsibility) {
      case 'Agência':
        return 'bg-blue-500';
      case 'Cliente':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 border border-border/30"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPosts = getPostsForDay(day);
      const hasContent = dayPosts.length > 0;

      days.push(
        <Card
          key={day}
          className={cn(
            "h-32 p-2 cursor-pointer transition-all duration-300 hover:shadow-medium hover:scale-102 border-border/30",
            hasContent && "bg-gradient-card shadow-soft hover:shadow-strong"
          )}
        >
          <div className="h-full flex flex-col">
            <div className="font-semibold text-sm text-foreground mb-1">
              {day}
            </div>
            
            {hasContent && (
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayPosts.slice(0, 2).map((post) => (
                  <div
                    key={post.id}
                    onClick={() => onPostClick(post)}
                    className="group cursor-pointer"
                  >
                    <div className="text-xs font-medium text-foreground/80 truncate mb-1 group-hover:text-primary flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getCompanyColor(post) }}
                      />
                      <div 
                        className={cn("w-2 h-2 rounded-sm flex-shrink-0", getResponsibilityColor(post.responsibility))}
                        title={`Responsabilidade: ${post.responsibility}`}
                      />
                      {post.subject}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge 
                        className={cn("text-xs px-1 py-0", getEditorialLineColor(post.editorialLine))}
                      >
                        {post.editorialLine}
                      </Badge>
                      {post.networks.slice(0, 2).map((network) => (
                        <Badge 
                          key={network}
                          className={cn("text-xs px-1 py-0", getSocialNetworkColor(network))}
                        >
                          {network.substring(0, 2)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
                
                {dayPosts.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayPosts.length - 2} mais
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-soft p-6">
        {/* Header with days of the week */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-4">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-soft p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Legenda</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
            <span className="text-muted-foreground">Responsabilidade: Agência</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
            <span className="text-muted-foreground">Responsabilidade: Cliente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-muted-foreground">Empresa</span>
          </div>
        </div>
      </div>
    </div>
  );
}