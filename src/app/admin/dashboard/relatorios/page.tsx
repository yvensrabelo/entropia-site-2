'use client';

import Link from 'next/link';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  User,
  Calendar,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';

interface RelatorioCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  stats?: string;
}

const relatorios: RelatorioCard[] = [
  {
    id: 'frequencia',
    title: 'Frequência Geral',
    description: 'Análise completa de frequência por período, turma e aluno',
    icon: Calendar,
    href: '/admin/dashboard/relatorios/frequencia',
    color: 'from-blue-500 to-blue-600',
    stats: 'Últimos 30 dias'
  },
  {
    id: 'turmas',
    title: 'Relatório por Turma',
    description: 'Comparativo de performance entre turmas e turnos',
    icon: Users,
    href: '/admin/dashboard/relatorios/turmas',
    color: 'from-green-500 to-green-600',
    stats: 'Ranking completo'
  },
  {
    id: 'risco',
    title: 'Alunos em Risco',
    description: 'Identificação de alunos com baixa frequência',
    icon: AlertTriangle,
    href: '/admin/dashboard/relatorios/risco',
    color: 'from-red-500 to-red-600',
    stats: 'Alertas ativos'
  },
  {
    id: 'individual',
    title: 'Relatório Individual',
    description: 'Histórico detalhado por aluno com calendário visual',
    icon: User,
    href: '/admin/dashboard/relatorios/aluno',
    color: 'from-purple-500 to-purple-600',
    stats: 'Análise pessoal'
  }
];

const metricas = [
  {
    title: 'Taxa Média de Frequência',
    value: '87.5%',
    icon: TrendingUp,
    color: 'text-green-600'
  },
  {
    title: 'Alunos Ativos',
    value: '234',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    title: 'Alunos em Risco',
    value: '18',
    icon: AlertTriangle,
    color: 'text-red-600'
  },
  {
    title: 'Último Update',
    value: 'Agora',
    icon: Clock,
    color: 'text-gray-600'
  }
];

export default function RelatoriosPage() {
  return (
    <AuthGuard>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold text-gray-800">Relatórios Avançados</h1>
          </div>
          <p className="text-gray-600">
            Análises detalhadas de frequência, performance e identificação de alunos em risco
          </p>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricas.map((metrica) => {
            const Icon = metrica.icon;
            return (
              <div key={metrica.title} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metrica.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{metrica.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${metrica.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Cards de Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {relatorios.map((relatorio) => {
            const Icon = relatorio.icon;
            return (
              <Link
                key={relatorio.id}
                href={relatorio.href}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${relatorio.color}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${relatorio.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {relatorio.stats}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                    {relatorio.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {relatorio.description}
                  </p>
                  
                  <div className="flex items-center text-green-600 text-sm font-medium mt-4 group-hover:translate-x-1 transition-transform">
                    Gerar Relatório
                    <Target className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-700">Relatório do Dia</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Presenças de hoje</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">Tendências</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Análise semanal</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-700">Metas</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Objetivos de frequência</p>
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}