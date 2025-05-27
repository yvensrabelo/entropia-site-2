'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';
import { TurmaFormData, tipoTurmaLabels } from '@/lib/types/turma';
import AuthGuard from '@/components/admin/AuthGuard';
import toast, { Toaster } from 'react-hot-toast';

const turmaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  periodo: z.string().optional(),
  duracao: z.string().optional(),
  vagas_disponiveis: z.number().min(0, 'Vagas não pode ser negativo').optional(),
  tipo: z.enum(['intensivo_psc', 'enem_total', 'sis_macro']),
  diferenciais: z.array(z.string()),
  ativo: z.boolean(),
  ordem: z.number().optional(),
  destaque: z.string().optional(),
  exibir_periodo: z.boolean().optional(),
  exibir_duracao: z.boolean().optional(),
  exibir_vagas: z.boolean().optional()
});

type FormData = z.infer<typeof turmaSchema>;

export default function NovaTurmaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>({
    resolver: zodResolver(turmaSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      periodo: '',
      duracao: '',
      vagas_disponiveis: 30,
      tipo: 'intensivo_psc',
      diferenciais: [''],
      destaque: '',
      ativo: true,
      exibir_periodo: true,
      exibir_duracao: true,
      exibir_vagas: true
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: control as any,
    name: 'diferenciais'
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      // Remover diferenciais vazios
      const diferenciais = data.diferenciais.filter(d => d.trim() !== '');

      // Buscar a maior ordem atual
      const { data: turmasExistentes } = await supabase
        .from('turmas')
        .select('ordem')
        .order('ordem', { ascending: false })
        .limit(1);

      const proximaOrdem = turmasExistentes && turmasExistentes.length > 0 
        ? turmasExistentes[0].ordem + 1 
        : 0;

      const { error } = await supabase
        .from('turmas')
        .insert({
          ...data,
          diferenciais,
          ordem: proximaOrdem
        });

      if (error) throw error;

      toast.success('Turma criada com sucesso!');
      router.push('/admin/dashboard/turmas');
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      toast.error('Erro ao criar turma');
    } finally {
      setLoading(false);
    }
  };

  // Preview da turma
  const watchedValues = watch();

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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Nova Turma</h1>

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
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="exibir_periodo"
                        {...register('exibir_periodo')}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="exibir_periodo" className="text-sm font-medium text-gray-700">
                        Exibir no card
                      </label>
                    </div>
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
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="exibir_duracao"
                        {...register('exibir_duracao')}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="exibir_duracao" className="text-sm font-medium text-gray-700">
                        Exibir no card
                      </label>
                    </div>
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
                      min="1"
                    />
                    {errors.vagas_disponiveis && (
                      <p className="text-red-500 text-sm mt-1">{errors.vagas_disponiveis.message}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="exibir_vagas"
                        {...register('exibir_vagas')}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="exibir_vagas" className="text-sm font-medium text-gray-700">
                        Exibir no card
                      </label>
                    </div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destaque (opcional)
                  </label>
                  <input
                    {...register('destaque')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Mais procurado, Vagas limitadas, Turma nova"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe vazio para não exibir nenhum destaque
                  </p>
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
                    {loading ? 'Salvando...' : 'Salvar Turma'}
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
                  {watchedValues.exibir_periodo !== false && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Período:</span>
                      {watchedValues.periodo || 'Janeiro a Dezembro'}
                    </p>
                  )}
                  {watchedValues.exibir_duracao !== false && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Duração:</span>
                      {watchedValues.duracao || '12 meses'}
                    </p>
                  )}
                  {watchedValues.exibir_vagas !== false && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Vagas:</span>
                      {watchedValues.vagas_disponiveis || 0} disponíveis
                    </p>
                  )}
                </div>

                {watchedValues.destaque && (
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-semibold">
                    {watchedValues.destaque}
                  </div>
                )}

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