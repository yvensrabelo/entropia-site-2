'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';

interface AdminUser {
  id: string;
  nome: string;
  cpf: string;
  email?: string;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
        router.push('/admin/login');
      } else {
        try {
          const admin = JSON.parse(adminAuth);
          setAdminUser(admin);
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('adminAuth');
          router.push('/admin/login');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
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
            
            <nav className="flex items-center space-x-4">
              <a
                href="/admin/dashboard/provas"
                className={`text-sm font-medium ${
                  pathname?.includes('/provas') 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Provas
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
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
    </div>
  );
}