'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, LogOut, FileText, GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import InactivityModal from './InactivityModal';

interface AdminUser {
  id: string;
  nome: string;
  email: string;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const handleInactivityLogout = async () => {
    console.log('🔒 Logout por inatividade');
    await handleLogout();
  };

  const {
    isWarningShown,
    timeRemaining,
    resetTimer,
    pauseTimer,
    resumeTimer
  } = useInactivityTimer({
    timeoutMinutes: 30, // 30 minutos total
    warningMinutes: 5,  // Aviso 5 minutos antes
    onTimeout: handleInactivityLogout,
    enabled: isAuthenticated
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verifica sessão do Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/admin/login');
          return;
        }

        // Verifica se é admin
        const { data: admin } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', session.user.id)
          .single();

        if (!admin) {
          await supabase.auth.signOut();
          router.push('/admin/login');
          return;
        }

        setAdminUser({
          id: session.user.id,
          nome: session.user.email?.split('@')[0] || 'Admin',
          email: session.user.email || ''
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/admin/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      // Pausar timer antes do logout
      pauseTimer();
      
      console.log('🚪 Fazendo logout...');
      
      // Chamar API route para garantir limpeza completa
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Também fazer logout local
      await supabase.auth.signOut();
      
      // Pequeno delay para garantir que tudo foi limpo
      setTimeout(() => {
        router.push('/admin/login');
      }, 100);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Forçar redirecionamento mesmo com erro
      setTimeout(() => {
        router.push('/admin/login');
      }, 100);
    }
  };

  const handleContinueSession = () => {
    console.log('⏱️ Sessão continuada pelo usuário');
    resetTimer();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">
                Painel Administrativo
              </h1>
              {adminUser && (
                <span className="ml-4 text-sm text-gray-600">
                  Olá, {adminUser.nome.split(' ')[0]}
                </span>
              )}
            </div>
            
            <nav className="flex items-center space-x-6">
              <a
                href="/admin/dashboard/provas"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  pathname?.includes('/provas') 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                Provas
              </a>
              <a
                href="/admin/dashboard/turmas"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  pathname?.includes('/turmas') 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Turmas
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors ml-4 pl-4 border-l"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1">
        {children}
      </main>

      {/* Modal de Inatividade */}
      <InactivityModal
        isOpen={isWarningShown}
        timeRemaining={timeRemaining}
        onContinue={handleContinueSession}
        onLogout={handleLogout}
      />
    </div>
  );
}