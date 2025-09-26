import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  History, 
  Settings, 
  Menu,
  LogOut,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Organizações',
    href: '/admin/orgs',
    icon: Building2,
    description: 'Gerenciar todas as organizações'
  },
  {
    name: 'Empresas',
    href: '/admin/companies',
    icon: Building2,
    description: 'Gerenciar empresas por cliente'
  },
  {
    name: 'Canais',
    href: '/admin/channels',
    icon: Settings,
    description: 'Gerenciar canais de mídia (Instagram, TikTok, etc.)'
  },
  {
    name: 'Logs de Auditoria',
    href: '/admin/audit',
    icon: History,
    description: 'Visualizar atividades da plataforma'
  },
  {
    name: 'Usuários',
    href: '/admin/users',
    icon: Users,
    description: 'Gerenciar usuários da plataforma'
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-72' : 'w-16'
        )}
      >
        <div className="flex flex-1 flex-col overflow-y-auto border-r bg-card">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Admin Panel</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <div className="flex-1">
                      <div>{item.name}</div>
                      {!isActive && (
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t p-4">
            {sidebarOpen ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">{user?.user_metadata?.full_name || user?.email}</div>
                  <div className="text-muted-foreground">Administrador</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'ml-72' : 'ml-16'
        )}
      >
        {children}
      </div>
    </div>
  );
}