'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/admin/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { formatCPF } from '@/lib/utils/cpf';
import { ArrowLeft, CheckCircle, XCircle, User, Phone, Mail, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PreMatricula {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  nome_responsavel?: string;
  telefone_responsavel?: string;
  turma_desejada: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'CONVERTIDA';
  motivo_rejeicao?: string;
  observacoes?: string;
  data_solicitacao: string;
  data_analise?: string;
  turma?: {
    id: string;
    nome: string;
    turno: string;
    vagas_ocupadas: number;
    capacidade_maxima: number;
  };
}

export default function PreMatriculaDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [preMatricula, setPreMatricula] = useState<PreMatricula | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchPreMatricula();
  }, [params.id]);

  const fetchPreMatricula = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pre_matriculas')
        .select(`
          *,
          turma:turma_desejada (
            id,
            nome,
            turno,
            vagas_ocupadas,
            capacidade_maxima
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setPreMatricula(data);
    } catch (error) {
      console.error('Erro ao buscar pré-matrícula:', error);
      toast.error('Erro ao carregar pré-matrícula');
      router.push('/admin/dashboard/pre-matriculas');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!preMatricula || !preMatricula.turma) return;

    // Verificar se há vagas disponíveis
    if (preMatricula.turma.vagas_ocupadas >= preMatricula.turma.capacidade_maxima) {
      toast.error('Não há vagas disponíveis nesta turma');
      return;
    }

    setProcessing(true);
    try {
      // Criar o aluno
      const { data: aluno, error: alunoError } = await supabase
        .from('alunos')
        .insert({
          nome: preMatricula.nome,
          cpf: preMatricula.cpf,
          data_nascimento: preMatricula.data_nascimento,
          telefone: preMatricula.telefone,
          email: preMatricula.email,
          endereco: preMatricula.endereco,
          bairro: preMatricula.bairro,
          cidade: preMatricula.cidade || 'Manaus',
          cep: preMatricula.cep,
          nome_responsavel: preMatricula.nome_responsavel,
          telefone_responsavel: preMatricula.telefone_responsavel,
          observacoes: preMatricula.observacoes,
          status: 'ATIVO'
        })
        .select()
        .single();

      if (alunoError) throw alunoError;

      // Criar a matrícula
      const { error: matriculaError } = await supabase
        .from('matriculas')
        .insert({
          aluno_id: aluno.id,
          turma_id: preMatricula.turma_desejada,
          status: 'ATIVA',
          data_matricula: new Date().toISOString()
        });

      if (matriculaError) throw matriculaError;

      // Atualizar a pré-matrícula
      const { error: updateError } = await supabase
        .from('pre_matriculas')
        .update({
          status: 'CONVERTIDA',
          data_analise: new Date().toISOString(),
          analisado_por: null,
          aluno_id: aluno.id
        })
        .eq('id', preMatricula.id);

      if (updateError) throw updateError;

      toast.success('Pré-matrícula aprovada e convertida em matrícula!');
      router.push('/admin/dashboard/pre-matriculas');
    } catch (error: any) {
      console.error('Erro ao aprovar pré-matrícula:', error);
      toast.error(error.message || 'Erro ao aprovar pré-matrícula');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!motivoRejeicao.trim()) {
      toast.error('Por favor, informe o motivo da rejeição');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('pre_matriculas')
        .update({
          status: 'REJEITADA',
          motivo_rejeicao: motivoRejeicao,
          data_analise: new Date().toISOString(),
          analisado_por: null
        })
        .eq('id', preMatricula?.id);

      if (error) throw error;

      toast.success('Pré-matrícula rejeitada');
      router.push('/admin/dashboard/pre-matriculas');
    } catch (error: any) {
      console.error('Erro ao rejeitar pré-matrícula:', error);
      toast.error(error.message || 'Erro ao rejeitar pré-matrícula');
    } finally {
      setProcessing(false);
      setShowRejectModal(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!preMatricula) {
    return (
      <AuthGuard>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Pré-matrícula não encontrada</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const age = calculateAge(preMatricula.data_nascimento);

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/dashboard/pre-matriculas')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Análise de Pré-Matrícula</h1>
                <p className="text-gray-600 mt-1">
                  Solicitação de {new Date(preMatricula.data_solicitacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Status atual */}
          {preMatricula.status !== 'PENDENTE' && (
            <Card className={`border-2 ${
              preMatricula.status === 'APROVADA' || preMatricula.status === 'CONVERTIDA' ? 'border-green-500 bg-green-50' :
              preMatricula.status === 'REJEITADA' ? 'border-red-500 bg-red-50' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      Status: {preMatricula.status}
                    </p>
                    {preMatricula.data_analise && (
                      <p className="text-sm text-gray-600">
                        Analisado em {new Date(preMatricula.data_analise).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {preMatricula.motivo_rejeicao && (
                      <p className="text-sm text-red-600 mt-2">
                        Motivo: {preMatricula.motivo_rejeicao}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dados do aluno */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados do Aluno
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium">{preMatricula.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CPF</p>
                  <p className="font-medium">{formatCPF(preMatricula.cpf)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data de Nascimento</p>
                  <p className="font-medium">
                    {new Date(preMatricula.data_nascimento).toLocaleDateString('pt-BR')} ({age} anos)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium">{preMatricula.telefone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{preMatricula.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Turma Desejada</p>
                  <p className="font-medium">
                    {preMatricula.turma?.nome} - {preMatricula.turma?.turno}
                  </p>
                  {preMatricula.turma && (
                    <p className="text-sm text-gray-500">
                      Vagas: {preMatricula.turma.vagas_ocupadas}/{preMatricula.turma.capacidade_maxima}
                    </p>
                  )}
                </div>
              </div>

              {preMatricula.endereco && (
                <div>
                  <p className="text-sm text-gray-600">Endereço</p>
                  <p className="font-medium">
                    {preMatricula.endereco}, {preMatricula.bairro} - {preMatricula.cidade}/{preMatricula.cep}
                  </p>
                </div>
              )}

              {preMatricula.nome_responsavel && (
                <div className="border-t pt-4">
                  <p className="font-semibold mb-2">Dados do Responsável</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-medium">{preMatricula.nome_responsavel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="font-medium">{preMatricula.telefone_responsavel || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {preMatricula.observacoes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Observações</p>
                  <p className="font-medium">{preMatricula.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações */}
          {preMatricula.status === 'PENDENTE' && (
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
                <CardDescription>
                  Analise a solicitação e tome uma decisão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    onClick={handleApprove}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar e Converter em Matrícula
                  </Button>
                  <Button
                    onClick={() => setShowRejectModal(true)}
                    disabled={processing}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modal de rejeição */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Rejeitar Pré-Matrícula</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo da Rejeição
                  </label>
                  <textarea
                    value={motivoRejeicao}
                    onChange={(e) => setMotivoRejeicao(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={4}
                    placeholder="Informe o motivo da rejeição..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowRejectModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={processing || !motivoRejeicao.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    Confirmar Rejeição
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}