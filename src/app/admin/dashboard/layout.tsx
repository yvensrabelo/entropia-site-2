'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FileText, 
  Calendar, 
  ClipboardList, 
  Users,
  Menu,
  X,
  LogOut,
  Home,
  Clock,
  Bookmark,
  GraduationCap,
  Link,
  Upload,
  BookOpen
} from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Provas', href: '/admin/dashboard/provas', icon: FileText },
  { name: 'Aulas', href: '/admin/dashboard/aulas', icon: BookOpen },
  { name: 'Turmas', href: '/admin/dashboard/turmas-simples', icon: GraduationCap },
  { name: 'Turmas Ativas', href: '/admin/dashboard/turmas-ativas', icon: Calendar },
  { name: 'Mapeamento Turmas', href: '/admin/dashboard/mapeamento-turmas', icon: Link },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('Iniciando processo de logout...');
      
      // Chamar API route para garantir limpeza completa
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'same-origin'
      });
      
      const data = await response.json();
      console.log('Resposta do logout:', data);
      
      // Verificar se há header para limpar storage
      if (response.headers.get('Clear-Storage') === 'true') {
        // Limpar apenas dados específicos migrados, manter admin session e video state
        if (typeof window !== 'undefined') {
          // Não fazer localStorage.clear() - apenas limpar dados que foram migrados para Supabase
          // Manter: 'entropia_admin' e 'video-muted-state'
          
          // Dados migrados para Supabase que podem ser removidos do localStorage:
          localStorage.removeItem('turmas');
          localStorage.removeItem('professores'); 
          localStorage.removeItem('horarios_aulas');
          localStorage.removeItem('turmas_ativas');
          localStorage.removeItem('mapeamento_turmas');
          localStorage.removeItem('mapeamento_turmas_lookup');
          localStorage.removeItem('codigo_portaria');
          
          // Limpar descritores e chegadas por data (padrão com datas)
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('descritores_') || key.startsWith('chegadas_') || key.startsWith('atrasos_'))) {
              localStorage.removeItem(key);
            }
          }
          
          sessionStorage.clear();
          console.log('Storage seletivamente limpo - dados migrados removidos');
        }
      }
      
      // Forçar redirecionamento via window.location para garantir limpeza completa
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Forçar redirecionamento mesmo com erro
      window.location.href = '/admin/login';
    }
  };

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  return (
    <div className="min-h-screen bg-gray-100">
        {/* Sidebar móvel */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-40 md:hidden`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h2 className="text-lg font-semibold text-white">Entropia Admin</h2>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
                  const Icon = item.icon;
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className={`
                        w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md
                        ${isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex bg-gray-700 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center text-sm font-medium text-gray-300 hover:text-white"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h2 className="text-lg font-semibold text-white">Entropia Admin</h2>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
                  const Icon = item.icon;
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className={`
                        w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md
                        ${isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex bg-gray-700 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center text-sm font-medium text-gray-300 hover:text-white"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="md:pl-64 flex flex-col flex-1">
          <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
  );
}