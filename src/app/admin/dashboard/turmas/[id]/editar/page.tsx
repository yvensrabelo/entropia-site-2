'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';
import { TurmaFormData, Turma } from '@/lib/types/turma';
import AuthGuard from '@/components/admin/AuthGuard';
import toast, { Toaster } from 'react-hot-toast';

const turmaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  periodo: z.string().min(3, 'Período é obrigatório'),
  duracao: z.string().min(3, 'Duração é obrigatória'),
  vagas_disponiveis: z.number().min(0, 'Vagas não pode ser negativo'),
  tipo: z.enum(['intensivo_psc', 'enem_total', 'sis_macro']),
  diferenciais: z.array(z.string()),
  ativo: z.boolean(),
  ordem: z.number().optional()
});

type FormData = z.infer<typeof turmaSchema>;

export default function EditarTurmaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingTurma, setLoadingTurma] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(turmaSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      periodo: '',
      duracao: '',
      vagas_disponiveis: 0,
      tipo: 'intensivo_psc',
      diferenciais: [],
      ativo: true
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: control as any,
    name: 'diferenciais'
  });

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

      if (data) {
        reset({
          nome: data.nome,
          descricao: data.descricao,
          periodo: data.periodo,
          duracao: data.duracao,
          vagas_disponiveis: data.vagas_disponiveis,
          tipo: data.tipo,
          diferenciais: data.diferenciais || [''],
          ativo: data.ativo
        });
      }
    } catch (error) {
      console.error('Erro ao buscar turma:', error);
      toast.error('Erro ao carregar turma');
      router.push('/admin/dashboard/turmas');
    } finally {
      setLoadingTurma(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      // Remover diferenciais vazios
      const diferenciais = data.diferenciais.filter(d => d.trim() !== '');

      const { error } = await supabase
        .from('turmas')
        .update({
          ...data,
          diferenciais
        })
        .eq('id', params.id);

      if (error) throw error;

      toast.success('Turma atualizada com sucesso!');
      router.push('/admin/dashboard/turmas');
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      toast.error('Erro ao atualizar turma');
    } finally {
      setLoading(false);
    }
  };

  // Preview da turma
  const watchedValues = watch();

  if (loadingTurma) {
    return (
      <AuthGuard>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Toaster position="top-right" />
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

        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Turma</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Informações da Turma</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Turma
                  </label>
                  <input
                    type="text"
                    {...register('nome')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: PSC Intensivo 2025"
                  />
                  {errors.nome && (
                    <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    {...register('descricao')}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva a turma e seus objetivos"
                  />
                  {errors.descricao && (
                    <p className="text-red-500 text-sm mt-1">{errors.descricao.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Período
                    </label>
                    <input
                      type="text"
                      {...register('periodo')}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Janeiro a Novembro"
                    />
                    {errors.periodo && (
                      <p className="text-red-500 text-sm mt-1">{errors.periodo.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duração
                    </label>
                    <input
                      type="text"
                      {...register('duracao')}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 11 meses"
                    />
                    {errors.duracao && (
                      <p className="text-red-500 text-sm mt-1">{errors.duracao.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Turma
                    </label>
                    <select
                      {...register('tipo')}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="intensivo_psc">PSC Intensivo</option>
                      <option value="enem_total">ENEM Total</option>
                      <option value="sis_macro">SIS/MACRO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vagas Disponíveis
                    </label>
                    <input
                      type="number"
                      {...register('vagas_disponiveis', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    {errors.vagas_disponiveis && (
                      <p className="text-red-500 text-sm mt-1">{errors.vagas_disponiveis.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diferenciais
                  </label>
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <input
                          {...register(`diferenciais.${index}`)}
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Material completo PSC"
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => append('')}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar diferencial
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    {...register('ativo')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                    Turma ativa
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                  <Link
                    href="/admin/dashboard/turmas"
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-center"
                  >
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Preview da Turma</h2>
              
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">
                  {watchedValues.nome || 'Nome da Turma'}
                </h3>
                <p className="text-green-100 mb-4">
                  {watchedValues.descricao || 'Descrição da turma aparecerá aqui'}
                </p>
                
                <div className="space-y-2 mb-4">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Período:</span>
                    {watchedValues.periodo || 'Janeiro a Dezembro'}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Duração:</span>
                    {watchedValues.duracao || '12 meses'}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Vagas:</span>
                    {watchedValues.vagas_disponiveis || 0} disponíveis
                  </p>
                </div>

                {watchedValues.diferenciais && watchedValues.diferenciais.filter(d => d).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Diferenciais:</h4>
                    <ul className="list-disc list-inside space-y-1 text-green-100">
                      {watchedValues.diferenciais
                        .filter(d => d.trim() !== '')
                        .map((diferencial, index) => (
                          <li key={index}>{diferencial}</li>
                        ))}
                    </ul>
                  </div>
                )}

                <button className="mt-6 w-full bg-white text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                  Quero me matricular
                </button>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Dica:</strong> Esta é uma prévia de como a turma aparecerá no site público.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}