'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Aluno } from '@/types/aluno';
import { formatCPF } from '@/lib/utils/cpf';
import { ArrowLeft, Edit, Loader2, User, Phone, Mail, MapPin, Users, FileText } from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';

function formatPhone(phone?: string | null): string {
  if (!phone) return '-';
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

function formatDate(date?: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

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

export default function VisualizarAlunoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAluno();
  }, [params.id]);

  const fetchAluno = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setAluno(data);
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      router.push('/admin/dashboard/alunos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      </AuthGuard>
    );
  }

  if (!aluno) {
    return null;
  }

  const idade = aluno.data_nascimento ? calcularIdade(aluno.data_nascimento) : null;

  return (
    <AuthGuard>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin/dashboard/alunos"
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
          <Link
            href={`/admin/dashboard/alunos/${aluno.id}/editar`}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{aluno.nome}</h1>
              <p className="text-gray-600">CPF: {formatCPF(aluno.cpf)}</p>
            </div>
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            Dados Pessoais
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nome Completo</p>
              <p className="text-gray-800 font-medium">{aluno.nome}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">CPF</p>
              <p className="text-gray-800 font-medium">{formatCPF(aluno.cpf)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Data de Nascimento</p>
              <p className="text-gray-800 font-medium">
                {formatDate(aluno.data_nascimento)}
                {idade !== null && ` (${idade} anos)`}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Telefone</p>
              <p className="text-gray-800 font-medium">{formatPhone(aluno.telefone)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-800 font-medium">{aluno.email || '-'}</p>
            </div>
          </div>
        </div>

        {/* Endereço */}
        {aluno.endereco && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              Endereço
            </h2>
            
            <p className="text-gray-800">{aluno.endereco}</p>
          </div>
        )}

        {/* Dados do Responsável */}
        {(aluno.nome_responsavel || aluno.cpf_responsavel || aluno.telefone_responsavel) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              Dados do Responsável
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aluno.nome_responsavel && (
                <div>
                  <p className="text-sm text-gray-500">Nome do Responsável</p>
                  <p className="text-gray-800 font-medium">{aluno.nome_responsavel}</p>
                </div>
              )}
              
              {aluno.cpf_responsavel && (
                <div>
                  <p className="text-sm text-gray-500">CPF do Responsável</p>
                  <p className="text-gray-800 font-medium">{formatCPF(aluno.cpf_responsavel)}</p>
                </div>
              )}
              
              {aluno.telefone_responsavel && (
                <div>
                  <p className="text-sm text-gray-500">Telefone do Responsável</p>
                  <p className="text-gray-800 font-medium">{formatPhone(aluno.telefone_responsavel)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Observações */}
        {aluno.observacoes && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Observações
            </h2>
            
            <p className="text-gray-800 whitespace-pre-wrap">{aluno.observacoes}</p>
          </div>
        )}

        {/* Informações do Sistema */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p>Cadastrado em: {formatDate(aluno.criado_em)}</p>
          <p>Última atualização: {formatDate(aluno.atualizado_em)}</p>
        </div>
      </div>
    </AuthGuard>
  );
}