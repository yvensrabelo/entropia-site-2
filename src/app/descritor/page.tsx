'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/admin/AuthGuard';
import { professoresService } from '@/services/professoresService';

export default function LoginProfessor() {
  const [cpf, setCpf] = useState('');
  const [erro, setErro] = useState('');
  const [professores, setProfessores] = useState<any[]>([]);
  const [professoresCarregando, setProfessoresCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const carregarProfessores = async () => {
      try {
        const professoresAtivos = await professoresService.listarProfessores(true);
        setProfessores(professoresAtivos);
      } catch (error) {
        console.error('Erro ao carregar professores:', error);
      } finally {
        setProfessoresCarregando(false);
      }
    };
    carregarProfessores();
  }, []);

  const formatarCPF = (valor: string) => {
    const apenas = valor.replace(/\D/g, '');
    if (apenas.length <= 11) {
      const formatado = apenas.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      return formatado;
    }
    return valor;
  };

  const handleLogin = () => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    // Buscar professor nos dados carregados
    const professor = professores.find((p: any) => 
      p.cpf.replace(/\D/g, '') === cpfLimpo && p.status === 'ativo'
    );

    if (professor) {
      // Salvar sessão
      sessionStorage.setItem('professor_logado', JSON.stringify(professor));
      router.push('/descritor/dashboard');
    } else {
      setErro('CPF não encontrado ou professor inativo');
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-600 mb-2">Portal do Professor</h1>
            <p className="text-gray-600">Faça login para acessar suas aulas de hoje</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF do Professor
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(formatarCPF(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={14}
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {erro}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Entrar
            </button>

            <p className="text-center text-sm text-gray-500">
              CPF de teste: 986.606.082-91
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}