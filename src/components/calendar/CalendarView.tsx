import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Post, PostStatus } from '@/types/multi-tenant';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onCreatePost?: (date: Date) => void;
  canEdit?: boolean;
}

export function CalendarView({ posts, onPostClick, onCreatePost, canEdit }: CalendarViewProps) {
  // Initialize with October 2024 to show the posts
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 1)); // October 2024
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getPostsForDay = (day: number) => {
    return posts.filter(post => {
      if (!post.publish_at) return false;
      const postDate = new Date(post.publish_at);
      return postDate.getDate() === day && 
             postDate.getMonth() === currentMonth && 
             postDate.getFullYear() === currentYear;
    });
  };

  const getStatusColor = (status: PostStatus) => {
    switch (status) {
      case 'idea': return 'bg-gray-500';
      case 'draft': return 'bg-yellow-500';
      case 'review': return 'bg-orange-500';
      case 'approved': return 'bg-blue-500';
      case 'scheduled': return 'bg-green-500';
      case 'published': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
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
            "h-32 p-2 cursor-pointer transition-all duration-300 hover:shadow-md border-border/30",
            hasContent && "bg-gradient-to-br from-card to-muted/50"
          )}
          onClick={() => !hasContent && canEdit && onCreatePost && onCreatePost(new Date(currentYear, currentMonth, day))}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-sm text-foreground">
                {day}
              </div>
              {canEdit && (
                <Plus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            
            {hasContent && (
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPostClick(post);
                    }}
                    className="group cursor-pointer p-1 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <div 
                        className={cn("w-2 h-2 rounded-full", getStatusColor(post.status))}
                        title={`Status: ${post.status}`}
                      />
                      <div className="text-xs font-medium text-foreground/80 truncate">
                        {post.title}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      Post
                    </Badge>
                  </div>
                ))}
                
                {dayPosts.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayPosts.length - 3} mais
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {monthNames[currentMonth]} {currentYear}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legenda de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Ideia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Rascunho</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Revisão</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Aprovado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Agendado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Publicado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}