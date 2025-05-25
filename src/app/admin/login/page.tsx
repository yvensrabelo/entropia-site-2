'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cpf: '',
    senha: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Em produção, implementar verificação via API route
    // para usar bcrypt no servidor e não expor lógica de autenticação

    try {
      // Limpar CPF (remover pontos e traços)
      const cpfLimpo = formData.cpf.replace(/\D/g, '');

      // Para desenvolvimento, vamos usar verificação simples
      // Em produção, isso deve ser feito através de uma API route
      if (cpfLimpo === '98660608291' && formData.senha === 'yvens123') {
        // Login bem-sucedido
        localStorage.setItem('adminAuth', JSON.stringify({
          id: 'admin-1',
          nome: 'Yvens Rabelo',
          cpf: cpfLimpo
        }));
        
        alert('Login realizado com sucesso!');
        router.push('/admin/dashboard/provas');
      } else {
        alert('CPF ou senha inválidos');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length <= 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Área Administrativa</h1>
          <p className="text-gray-600">Faça login para gerenciar o banco de provas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPF
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.cpf}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  cpf: formatCPF(e.target.value) 
                })}
                maxLength={14}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                placeholder="Digite sua senha"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Entropia Cursinho - Painel Administrativo
          </p>
        </div>
      </div>
    </div>
  );
}