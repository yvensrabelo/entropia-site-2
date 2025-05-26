'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Plus, GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Turma } from '@/lib/types/turma';
import AuthGuard from '@/components/admin/AuthGuard';
import toast, { Toaster } from 'react-hot-toast';

// Importar o componente da tabela com SSR desabilitado para evitar erros de hidratação
const TurmasTable = dynamic(() => import('./TurmasTable'), {
  ssr: false,
  loading: () => (
    <div className="p-6 text-center">
      <p className="text-gray-500">Carregando tabela...</p>
    </div>
  )
});

export default function AdminTurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTurmas();
  }, []);

  const fetchTurmas = async () => {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      setTurmas(data || []);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      toast.error('Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta turma?')) return;

    try {
      const { error } = await supabase
        .from('turmas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTurmas(turmas.filter(t => t.id !== id));
      toast.success('Turma excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir turma');
    }
  };

  const handleReorder = async (newTurmas: Turma[]) => {
    setTurmas(newTurmas);

    // Atualizar ordem no banco
    try {
      const updates = newTurmas.map((turma, index) => ({
        id: turma.id,
        ordem: index
      }));

      for (const update of updates) {
        await supabase
          .from('turmas')
          .update({ ordem: update.ordem })
          .eq('id', update.id);
      }

      toast.success('Ordem atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      toast.error('Erro ao atualizar ordem');
      fetchTurmas(); // Recarregar em caso de erro
    }
  };

  return (
    <AuthGuard>
      <Toaster position="top-right" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerenciar Turmas</h1>
            <p className="text-gray-600">Adicione e gerencie as turmas do cursinho</p>
          </div>
          <Link
            href="/admin/dashboard/turmas/nova"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Turma
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : turmas.length === 0 ? (
            <div className="p-6 text-center">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma turma cadastrada</p>
            </div>
          ) : (
            <TurmasTable
              turmas={turmas}
              onDelete={handleDelete}
              onReorder={handleReorder}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}