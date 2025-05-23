'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  BarChart3
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Presenca, Nota, Financeiro, Material } from '@/lib/supabase'

export default function AlunosDashboard() {
  const { usuario } = useAuth()
  const [presencas, setPresencas] = useState<Presenca[]>([])
  const [notas, setNotas] = useState<Nota[]>([])
  const [financeiro, setFinanceiro] = useState<Financeiro[]>([])
  const [materiais, setMateriais] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('resumo')

  useEffect(() => {
    if (usuario) {
      carregarDados()
    }
  }, [usuario])

  const carregarDados = async () => {
    if (!usuario || !supabase) return

    try {
      const [presencasRes, notasRes, financeiroRes, materiaisRes] = await Promise.all([
        supabase.from('presencas').select('*').eq('usuario_id', usuario.id).order('data_aula', { ascending: false }).limit(10),
        supabase.from('notas').select('*').eq('usuario_id', usuario.id).order('data_aplicacao', { ascending: false }).limit(10),
        supabase.from('financeiro').select('*').eq('usuario_id', usuario.id).order('vencimento', { ascending: false }),
        supabase.from('materiais').select('*').contains('disponivel_para_turma', [usuario.turma]).order('created_at', { ascending: false })
      ])

      setPresencas(presencasRes.data || [])
      setNotas(notasRes.data || [])
      setFinanceiro(financeiroRes.data || [])
      setMateriais(materiaisRes.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularEstatisticas = () => {
    const totalPresencas = presencas.length
    const presencasPositivas = presencas.filter(p => p.presente).length
    const percentualPresenca = totalPresencas > 0 ? (presencasPositivas / totalPresencas) * 100 : 0

    const mediaNotas = notas.length > 0 
      ? notas.reduce((acc, nota) => acc + (nota.nota / nota.nota_maxima) * 100, 0) / notas.length 
      : 0

    const pendenciasFinanceiras = financeiro.filter(f => f.status === 'pendente').length
    const valorPendente = financeiro
      .filter(f => f.status === 'pendente')
      .reduce((acc, f) => acc + f.valor, 0)

    return {
      percentualPresenca: Math.round(percentualPresenca),
      mediaNotas: Math.round(mediaNotas),
      pendenciasFinanceiras,
      valorPendente
    }
  }

  const stats = calcularEstatisticas()

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <User className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Olá, {usuario?.nome.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-600">
                  {usuario?.turma} • Matrícula: {usuario?.data_matricula ? formatarData(usuario.data_matricula) : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle size={16} className="mr-1" />
                  {usuario?.situacao || 'Ativo'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Frequência</p>
                <p className="text-3xl font-bold text-green-600">{stats.percentualPresenca}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="text-green-600" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Média Geral</p>
                <p className="text-3xl font-bold text-blue-600">{stats.mediaNotas}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pendências</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendenciasFinanceiras}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="text-orange-600" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Materiais</p>
                <p className="text-3xl font-bold text-purple-600">{materiais.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BookOpen className="text-purple-600" size={24} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {[
                { id: 'resumo', label: 'Resumo', icon: BarChart3 },
                { id: 'notas', label: 'Notas', icon: TrendingUp },
                { id: 'presencas', label: 'Presenças', icon: Calendar },
                { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
                { id: 'materiais', label: 'Materiais', icon: BookOpen },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab Content */}
            {activeTab === 'resumo' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Resumo Acadêmico</h2>
                
                {/* Gráfico de Desempenho Simulado */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Últimas Notas</h3>
                    <div className="space-y-3">
                      {notas.slice(0, 5).map((nota, index) => (
                        <div key={nota.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{nota.disciplina}</p>
                            <p className="text-sm text-gray-600">{formatarData(nota.data_aplicacao)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {nota.nota}/{nota.nota_maxima}
                            </p>
                            <p className="text-sm text-gray-500">
                              {Math.round((nota.nota / nota.nota_maxima) * 100)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Frequência Recente</h3>
                    <div className="space-y-3">
                      {presencas.slice(0, 5).map((presenca, index) => (
                        <div key={presenca.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{presenca.disciplina}</p>
                            <p className="text-sm text-gray-600">{formatarData(presenca.data_aula)}</p>
                          </div>
                          <div className="flex items-center">
                            {presenca.presente ? (
                              <CheckCircle className="text-green-500" size={20} />
                            ) : (
                              <XCircle className="text-red-500" size={20} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notas' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Histórico de Notas</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-left">Disciplina</th>
                        <th className="py-3 px-4 text-center">Tipo</th>
                        <th className="py-3 px-4 text-center">Nota</th>
                        <th className="py-3 px-4 text-center">Percentual</th>
                        <th className="py-3 px-4 text-center">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notas.map((nota, index) => (
                        <tr key={nota.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium text-gray-900">{nota.disciplina}</td>
                          <td className="py-4 px-4 text-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {nota.tipo_avaliacao}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-semibold">
                            {nota.nota}/{nota.nota_maxima}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`font-bold ${
                              (nota.nota / nota.nota_maxima) * 100 >= 70 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {Math.round((nota.nota / nota.nota_maxima) * 100)}%
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600">
                            {formatarData(nota.data_aplicacao)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'presencas' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Registro de Presenças</h2>
                <div className="grid gap-4">
                  {presencas.map((presenca, index) => (
                    <div key={presenca.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{presenca.disciplina}</h3>
                        <p className="text-sm text-gray-600">
                          {presenca.professor} • {formatarData(presenca.data_aula)}
                        </p>
                        {presenca.justificativa && (
                          <p className="text-sm text-gray-500 mt-1">
                            Justificativa: {presenca.justificativa}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {presenca.presente ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle size={20} />
                            <span className="font-medium">Presente</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle size={20} />
                            <span className="font-medium">Ausente</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'financeiro' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Situação Financeira</h2>
                <div className="grid gap-4">
                  {financeiro.map((item, index) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.descricao}</h3>
                        <p className="text-sm text-gray-600">
                          Vencimento: {formatarData(item.vencimento)}
                        </p>
                        {item.data_pagamento && (
                          <p className="text-sm text-green-600">
                            Pago em: {formatarData(item.data_pagamento)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {formatarMoeda(item.valor)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'pago' 
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'vencido'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'materiais' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Materiais Disponíveis</h2>
                <div className="grid gap-4">
                  {materiais.map((material, index) => (
                    <div key={material.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <FileText className="text-green-600" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{material.titulo}</h3>
                          <p className="text-sm text-gray-600">
                            {material.disciplina} • {material.tipo}
                          </p>
                          {material.descricao && (
                            <p className="text-sm text-gray-500 mt-1">
                              {material.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {material.arquivo_url ? (
                          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <Download size={16} />
                            Baixar
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Em breve</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}