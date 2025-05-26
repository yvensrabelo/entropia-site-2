'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InputMask from 'react-input-mask';
import { supabase } from '@/lib/supabase-client';
import { validateCPF, unformatCPF } from '@/lib/utils/cpf';
import { buscarCEP } from '@/lib/utils/cep';
import { ArrowLeft, Loader2, Save, Search } from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { Toast } from '@/components/Toast';

// Schema de validação
const alunoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().refine((cpf) => validateCPF(cpf), 'CPF inválido'),
  data_nascimento: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  nome_responsavel: z.string().optional(),
  cpf_responsavel: z.string().optional(),
  telefone_responsavel: z.string().optional(),
  observacoes: z.string().optional()
}).superRefine((data, ctx) => {
  // Validar se é menor de idade e precisa de responsável
  if (data.data_nascimento) {
    const idade = calcularIdade(data.data_nascimento);
    if (idade < 18) {
      if (!data.nome_responsavel) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nome do responsável é obrigatório para menores de 18 anos',
          path: ['nome_responsavel']
        });
      }
      if (!data.cpf_responsavel) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CPF do responsável é obrigatório para menores de 18 anos',
          path: ['cpf_responsavel']
        });
      } else if (!validateCPF(data.cpf_responsavel)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CPF do responsável inválido',
          path: ['cpf_responsavel']
        });
      }
    }
  }
});

type AlunoFormData = z.infer<typeof alunoSchema>;

function calcularIdade(dataNascimento: string): number {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  
  return idade;
}

export default function NovoAlunoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isMenorIdade, setIsMenorIdade] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema)
  });

  const dataNascimento = watch('data_nascimento');
  const cep = watch('cep');

  // Verificar se é menor de idade
  useEffect(() => {
    if (dataNascimento) {
      const idade = calcularIdade(dataNascimento);
      setIsMenorIdade(idade < 18);
    }
  }, [dataNascimento]);

  // Buscar CEP
  useEffect(() => {
    const cepLimpo = cep?.replace(/\D/g, '');
    if (cepLimpo?.length === 8) {
      handleBuscarCEP(cepLimpo);
    }
  }, [cep]);

  const handleBuscarCEP = async (cepLimpo: string) => {
    setBuscandoCEP(true);
    try {
      const dados = await buscarCEP(cepLimpo);
      if (dados) {
        setValue('endereco', dados.logradouro);
        setValue('bairro', dados.bairro);
        setValue('cidade', dados.localidade);
        setValue('estado', dados.uf);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setBuscandoCEP(false);
    }
  };

  const onSubmit = async (data: AlunoFormData) => {
    setLoading(true);
    try {
      // Verificar se CPF já existe
      const { data: cpfExistente } = await supabase
        .from('alunos')
        .select('id')
        .eq('cpf', unformatCPF(data.cpf))
        .single();

      if (cpfExistente) {
        setToast({ message: 'CPF já cadastrado!', type: 'error' });
        setLoading(false);
        return;
      }

      // Preparar dados para salvar
      const dadosAluno = {
        nome: data.nome,
        cpf: unformatCPF(data.cpf),
        data_nascimento: data.data_nascimento || null,
        telefone: data.telefone?.replace(/\D/g, '') || null,
        email: data.email || null,
        endereco: data.endereco ? 
          `${data.endereco}${data.numero ? ', ' + data.numero : ''}${data.complemento ? ', ' + data.complemento : ''}, ${data.bairro}, ${data.cidade}-${data.estado}, CEP: ${data.cep}` 
          : null,
        nome_responsavel: data.nome_responsavel || null,
        cpf_responsavel: data.cpf_responsavel ? unformatCPF(data.cpf_responsavel) : null,
        telefone_responsavel: data.telefone_responsavel?.replace(/\D/g, '') || null,
        observacoes: data.observacoes || null
      };

      const { error } = await supabase
        .from('alunos')
        .insert([dadosAluno]);

      if (error) throw error;

      setToast({ message: 'Aluno cadastrado com sucesso!', type: 'success' });
      setTimeout(() => {
        router.push('/admin/dashboard/alunos');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao cadastrar aluno:', error);
      setToast({ 
        message: error.message || 'Erro ao cadastrar aluno', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/dashboard/alunos"
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Cadastrar Novo Aluno</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Dados Pessoais */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Dados Pessoais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  {...register('nome')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF *
                </label>
                <InputMask
                  mask="999.999.999-99"
                  {...register('cpf')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.cpf && (
                  <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  {...register('data_nascimento')}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <InputMask
                  mask="(99) 99999-9999"
                  {...register('telefone')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Endereço</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <div className="relative">
                  <InputMask
                    mask="99999-999"
                    {...register('cep')}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {buscandoCEP && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  {...register('endereco')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número
                </label>
                <input
                  type="text"
                  {...register('numero')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  {...register('complemento')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro
                </label>
                <input
                  type="text"
                  {...register('bairro')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  {...register('cidade')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <input
                  type="text"
                  {...register('estado')}
                  maxLength={2}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Dados do Responsável */}
          {isMenorIdade && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Dados do Responsável
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Obrigatório para menores de 18 anos
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Responsável *
                  </label>
                  <input
                    type="text"
                    {...register('nome_responsavel')}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {errors.nome_responsavel && (
                    <p className="text-red-500 text-sm mt-1">{errors.nome_responsavel.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF do Responsável *
                  </label>
                  <InputMask
                    mask="999.999.999-99"
                    {...register('cpf_responsavel')}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {errors.cpf_responsavel && (
                    <p className="text-red-500 text-sm mt-1">{errors.cpf_responsavel.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone do Responsável
                  </label>
                  <InputMask
                    mask="(99) 99999-9999"
                    {...register('telefone_responsavel')}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Observações</h2>
            
            <textarea
              {...register('observacoes')}
              rows={4}
              placeholder="Informações adicionais sobre o aluno..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/dashboard/alunos"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Aluno
                </>
              )}
            </button>
          </div>
        </form>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </AuthGuard>
  );
}