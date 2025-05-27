'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';
import { useToast } from '@/contexts/ToastContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });

  const redirectTo = searchParams.get('redirectTo') || '/admin/dashboard';

  useEffect(() => {
    console.log('🔍 Login Page - URL atual:', typeof window !== 'undefined' ? window.location.href : 'SSR');
    console.log('🔍 Login Page - Pathname:', typeof window !== 'undefined' ? window.location.pathname : 'SSR');
    
    // Verifica se já está autenticado
    checkExistingAuth();
  }, []);

  async function checkExistingAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Verifica se é admin
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (adminUser) {
          window.location.href = redirectTo;
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setCheckingAuth(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Tenta fazer login com email e senha
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.senha,
      });

      if (authError) {
        setError('Email ou senha inválidos');
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // Verifica se o usuário é admin
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', data.session.user.email)
          .single();

        if (adminError || !adminUser) {
          // Não é admin, faz logout
          await supabase.auth.signOut();
          setError('Acesso negado. Você não tem permissões de administrador.');
          setIsLoading(false);
          return;
        }

        // Login bem-sucedido como admin
        showToast('Login realizado com sucesso!', 'success');
        
        // Use window.location ao invés de router.push
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1000);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <div className="bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Lock className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Área Administrativa</h1>
          <p className="text-gray-400">Faça login para acessar o painel</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="email"
                required
                placeholder="admin@entropia.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Digite sua senha"
                className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Entropia Cursinho - Painel Administrativo
          </p>
        </div>
      </div>
    </div>
  );
}