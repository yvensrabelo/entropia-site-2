'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';
import { Turma } from '@/lib/types/turma';
import AuthGuard from '@/components/admin/AuthGuard';
import { motion } from 'framer-motion';

export default function PreviewTurmaPage({ params }: { params: { id: string } }) {
  const [turma, setTurma] = useState<Turma | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTurma();
  }, [params.id]);

  const fetchTurma = async () => {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setTurma(data);
    } catch (error) {
      console.error('Erro ao buscar turma:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AuthGuard>
    );
  }

  if (!turma) {
    return (
      <AuthGuard>
        <div className="p-6">
          <p className="text-gray-500">Turma não encontrada</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/admin/dashboard/turmas"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Turmas
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Preview da Turma</h1>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Informações Administrativas</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">ID:</span>
                <span className="ml-2 text-gray-600">{turma.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  turma.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {turma.ativo ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ordem:</span>
                <span className="ml-2 text-gray-600">{turma.ordem}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Criada em:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(turma.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Como aparece no site público:</h2>
            
            {/* Preview do card como aparece no site */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20" />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">{turma.nome}</h3>
                <p className="text-green-100 mb-4">{turma.descricao}</p>
                
                <div className="space-y-2 mb-4">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Período:</span>
                    {turma.periodo}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Duração:</span>
                    {turma.duracao}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Vagas:</span>
                    {turma.vagas_disponiveis} disponíveis
                  </p>
                </div>

                {turma.diferenciais && turma.diferenciais.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Diferenciais:</h4>
                    <ul className="list-disc list-inside space-y-1 text-green-100">
                      {turma.diferenciais.map((diferencial, index) => (
                        <li key={index}>{diferencial}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button className="mt-6 w-full bg-white text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                  Quero me matricular
                </button>
              </div>
            </motion.div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              href={`/admin/dashboard/turmas/${turma.id}/editar`}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Editar Turma
            </Link>
            <Link
              href="/admin/dashboard/turmas"
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Voltar
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}