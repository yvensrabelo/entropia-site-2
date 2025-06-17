'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InputMask from 'react-input-mask';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard,
  MapPin,
  Loader2,
  Save,
  Search,
  CheckCircle
} from 'lucide-react';
import { validateCPF, unformatCPF } from '@/lib/utils/cpf';
import { validateAndFormatPhone } from '@/lib/utils/phone';

// Schema de validação completo
const formularioSchema = z.object({
  // Dados do Aluno
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().refine((cpf) => validateCPF(cpf), 'CPF inválido'),
  data_nascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  telefone: z.string().min(1, 'Telefone é obrigatório').refine((phone) => {
    const validation = validateAndFormatPhone(phone);
    return validation.isValid;
  }, 'Número de telefone inválido. Verifique o DDD e o número.'),
  email: z.string().email('Email inválido'),
  
  // Endereço
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  
  // Dados do Responsável Financeiro (sempre obrigatório)
  nome_responsavel: z.string().min(3, 'Nome do responsável é obrigatório'),
  cpf_responsavel: z.string().refine((cpf) => validateCPF(cpf), 'CPF do responsável inválido'),
  telefone_responsavel: z.string().min(1, 'Telefone do responsável é obrigatório').refine((phone) => {
    const validation = validateAndFormatPhone(phone);
    return validation.isValid;
  }, 'Telefone do responsável inválido'),
  
  // Dados da Turma
  turma_id: z.string().optional(),
  turma_nome: z.string().optional(),
  observacoes: z.string().optional()
});

type FormularioData = z.infer<typeof formularioSchema>;

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

export default function FormularioCompletoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [isMenorIdade, setIsMenorIdade] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormularioData>({
    resolver: zodResolver(formularioSchema),
    defaultValues: {
      turma_nome: searchParams?.get('turma') || '',
      turma_id: searchParams?.get('turma_id') || ''
    }
  });

  const watchDataNascimento = watch('data_nascimento');

  // Verificar se é menor de idade
  useEffect(() => {
    if (watchDataNascimento) {
      const idade = calcularIdade(watchDataNascimento);
      setIsMenorIdade(idade < 18);
    }
  }, [watchDataNascimento]);

  const buscarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setBuscandoCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setValue('endereco', data.logradouro);
        setValue('bairro', data.bairro);
        setValue('cidade', data.localidade);
        setValue('estado', data.uf);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setBuscandoCEP(false);
    }
  };

  const onSubmit = async (data: FormularioData) => {
    setLoading(true);
    
    // Adicionar timestamp e origem
    const dadosCompletos = {
      ...data,
      timestamp: new Date().toISOString(),
      data_envio: new Date().toLocaleString('pt-BR'),
      origem: 'formulario_completo',
      cpf: unformatCPF(data.cpf),
      cpf_responsavel: unformatCPF(data.cpf_responsavel)
    };

    try {
      const response = await fetch('/api/matricula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosCompletos)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      setLoading(false);
      setSucesso(true);
      
    } catch (error) {
      console.error('Erro ao enviar matrícula:', error);
      setLoading(false);
      alert('Erro ao enviar matrícula. Tente novamente.');
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-lg p-8"
        >
          <CheckCircle className="text-green-600 w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Matrícula Enviada com Sucesso!
          </h2>
          <p className="text-gray-600 mb-6">
            Recebemos sua solicitação de matrícula completa. Nossa equipe entrará em contato em breve para finalizar o processo.
          </p>
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-green-800 mb-2">Próximos passos:</h3>
            <ul className="text-green-700 text-sm space-y-1 text-left">
              <li>✓ Análise da documentação</li>
              <li>✓ Verificação de disponibilidade</li>
              <li>✓ Contato via WhatsApp em até 24h</li>
              <li>✓ Agendamento para finalização</li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Voltar ao Início
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Formulário de Matrícula</h1>
            <p className="text-gray-600">Preencha todos os dados para finalizar sua matrícula</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8">
          
          {/* Dados Pessoais do Aluno */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <User className="text-green-600" />
              Dados Pessoais do Aluno
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  {...register('nome')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome completo do aluno"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="000.000.000-00"
                />
                {errors.cpf && (
                  <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  {...register('data_nascimento')}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {errors.data_nascimento && (
                  <p className="text-red-500 text-sm mt-1">{errors.data_nascimento.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp *
                </label>
                <InputMask
                  mask="(99) 99999-9999"
                  {...register('telefone')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="(92) 99999-9999"
                />
                {errors.telefone && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Endereço */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <MapPin className="text-green-600" />
              Endereço
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <div className="relative">
                  <InputMask
                    mask="99999-999"
                    {...register('cep')}
                    onBlur={(e) => buscarCEP(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="00000-000"
                  />
                  {buscandoCEP && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Rua, Avenida..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número
                </label>
                <input
                  type="text"
                  {...register('numero')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  {...register('complemento')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Apt, Casa, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro
                </label>
                <input
                  type="text"
                  {...register('bairro')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome do bairro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  {...register('cidade')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome da cidade"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="AM"
                />
              </div>
            </div>
          </motion.div>

          {/* Dados do Responsável Financeiro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <CreditCard className="text-green-600" />
              Dados do Responsável Financeiro
            </h2>
            <p className="text-gray-600 mb-6">
              {isMenorIdade ? 'Obrigatório para menores de 18 anos' : 'Responsável pelos pagamentos'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  {...register('nome_responsavel')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome completo do responsável"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="000.000.000-00"
                />
                {errors.cpf_responsavel && (
                  <p className="text-red-500 text-sm mt-1">{errors.cpf_responsavel.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp do Responsável *
                </label>
                <InputMask
                  mask="(99) 99999-9999"
                  {...register('telefone_responsavel')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="(92) 99999-9999"
                />
                {errors.telefone_responsavel && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefone_responsavel.message}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Observações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Observações Adicionais</h2>
            
            <textarea
              {...register('observacoes')}
              rows={4}
              placeholder="Informações adicionais, necessidades especiais, ou comentários..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </motion.div>

          {/* Botão Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando Matrícula...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Finalizar Matrícula
                </>
              )}
            </button>
          </motion.div>

          <p className="text-center text-sm text-gray-500">
            * Campos obrigatórios. Ao enviar, você autoriza o contato via WhatsApp e email.
          </p>
        </form>
      </div>
    </div>
  );
}