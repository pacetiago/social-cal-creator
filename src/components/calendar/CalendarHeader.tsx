import { Calendar, BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Client, Company } from "@/types/calendar";

interface CalendarHeaderProps {
  onAddPost: () => void;
  currentView: 'calendar' | 'analytics';
  onViewChange: (view: 'calendar' | 'analytics') => void;
  selectedClient?: Client;
  selectedCompany?: Company;
  currentMonth: number;
  currentYear: number;
}

export function CalendarHeader({ 
  onAddPost, 
  currentView, 
  onViewChange, 
  selectedClient, 
  selectedCompany,
  currentMonth,
  currentYear
}: CalendarHeaderProps) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDisplayTitle = () => {
    if (selectedClient && selectedCompany) {
      return `${selectedCompany.name} - ${selectedClient.name}`;
    }
    if (selectedClient) {
      return selectedClient.name;
    }
    return "Cronograma de Redes Sociais";
  };

  const getDisplaySubtitle = () => {
    return `${monthNames[currentMonth]} ${currentYear}`;
  };
  return (
    <header className="bg-gradient-hero rounded-lg p-6 mb-6 shadow-soft">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {getDisplayTitle()}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-lg text-muted-foreground">
              {getDisplaySubtitle()}
            </p>
            {selectedCompany && (
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: selectedCompany.color }}
                title={`Cor da empresa: ${selectedCompany.name}`}
              />
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex rounded-lg bg-white/50 p-1">
            <Button
              variant={currentView === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('calendar')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Calendário
            </Button>
            <Button
              variant={currentView === 'analytics' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('analytics')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Análises
            </Button>
          </div>
          
          <Button 
            onClick={onAddPost}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-medium transition-all duration-300 hover:shadow-strong hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Postagem
          </Button>
        </div>
      </div>
    </header>
  );
}