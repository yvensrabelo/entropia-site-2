'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🔍 Admin Layout - Renderizando')
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setIsAuthenticated(false);
          router.push('/admin/login');
        } else if (event === 'SIGNED_IN' && session) {
          // Verifica se é admin
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (adminUser) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            router.push('/admin/login');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        router.push('/admin/login');
        return;
      }

      // Verifica se o usuário é admin
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (!adminUser) {
        setIsAuthenticated(false);
        router.push('/admin/login');
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado e ainda está carregando a página
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-400">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}