'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/admin/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { formatCPF } from '@/lib/utils/cpf';
import { Clock, CheckCircle, XCircle, Search, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface PreMatricula {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  turma_desejada: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'CONVERTIDA';
  data_solicitacao: string;
  data_analise?: string;
  motivo_rejeicao?: string;
  turma?: {
    nome: string;
    turno: string;
  };
}

export default function PreMatriculasPage() {
  const [preMatriculas, setPreMatriculas] = useState<PreMatricula[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');

  useEffect(() => {
    fetchPreMatriculas();
  }, []);

  const fetchPreMatriculas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pre_matriculas')
        .select(`
          *,
          turma:turma_desejada (
            nome,
            turno
          )
        `)
        .order('data_solicitacao', { ascending: false });

      if (error) throw error;
      setPreMatriculas(data || []);
    } catch (error) {
      console.error('Erro ao buscar pré-matrículas:', error);
      toast.error('Erro ao carregar pré-matrículas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDENTE: { icon: Clock, class: 'bg-yellow-100 text-yellow-800' },
      APROVADA: { icon: CheckCircle, class: 'bg-green-100 text-green-800' },
      REJEITADA: { icon: XCircle, class: 'bg-red-100 text-red-800' },
      CONVERTIDA: { icon: CheckCircle, class: 'bg-blue-100 text-blue-800' }
    };

    const badge = badges[status as keyof typeof badges];
    if (!badge) return null;

    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const filteredPreMatriculas = preMatriculas.filter(pm => {
    const matchesSearch = 
      pm.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pm.cpf.includes(searchTerm) ||
      pm.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'TODOS' || pm.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: preMatriculas.length,
    pendentes: preMatriculas.filter(pm => pm.status === 'PENDENTE').length,
    aprovadas: preMatriculas.filter(pm => pm.status === 'APROVADA').length,
    rejeitadas: preMatriculas.filter(pm => pm.status === 'REJEITADA').length,
    convertidas: preMatriculas.filter(pm => pm.status === 'CONVERTIDA').length
  };

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Pré-Matrículas</h1>
            <p className="text-gray-600 mt-2">
              Gerencie as solicitações de pré-matrícula
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-gray-600">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
                <p className="text-sm text-gray-600">Pendentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.aprovadas}</div>
                <p className="text-sm text-gray-600">Aprovadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{stats.rejeitadas}</div>
                <p className="text-sm text-gray-600">Rejeitadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.convertidas}</div>
                <p className="text-sm text-gray-600">Convertidas</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, CPF ou email..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {['TODOS', 'PENDENTE', 'APROVADA', 'REJEITADA', 'CONVERTIDA'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filterStatus === status
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de pré-matrículas */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : filteredPreMatriculas.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Nenhuma pré-matrícula encontrada
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CPF
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Turma Desejada
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Solicitação
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPreMatriculas.map((pm) => (
                        <tr key={pm.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{pm.nome}</div>
                              <div className="text-sm text-gray-500">{pm.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCPF(pm.cpf)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {pm.turma?.nome || '-'} - {pm.turma?.turno || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(pm.data_solicitacao).toLocaleDateString('pt-BR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(pm.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Link
                              href={`/admin/dashboard/pre-matriculas/${pm.id}`}
                              className="text-green-600 hover:text-green-900 inline-flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Analisar
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}