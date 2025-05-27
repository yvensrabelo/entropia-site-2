'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Book, Users, ClipboardList, TrendingUp, Activity, FileCheck } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  console.log('🔍 Dashboard Page - Renderizando')
  const [stats, setStats] = useState({
    totalProvas: 0,
    totalCursos: 0,
    totalAlunos: 0,
    totalMatriculas: 0,
    matriculasAtivas: 0,
    turmasAtivas: 0,
    contratosEntregues: 0,
    contratosPendentes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: provasCount },
        { count: cursosCount },
        { count: alunosCount },
        { count: matriculasCount },
        { count: matriculasAtivasCount },
        { count: turmasAtivasCount },
        { count: contratosEntreguesCount },
        { count: contratosPendentesCount }
      ] = await Promise.all([
        supabase.from('provas').select('*', { count: 'exact', head: true }),
        supabase.from('turmas').select('*', { count: 'exact', head: true }),
        supabase.from('alunos').select('*', { count: 'exact', head: true }),
        supabase.from('matriculas').select('*', { count: 'exact', head: true }),
        supabase.from('matriculas').select('*', { count: 'exact', head: true }).eq('status', 'ativa'),
        supabase.from('turmas_config').select('*', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('alunos').select('*', { count: 'exact', head: true }).eq('contrato_entregue', true),
        supabase.from('alunos').select('*', { count: 'exact', head: true }).eq('contrato_entregue', false)
      ]);

      setStats({
        totalProvas: provasCount || 0,
        totalCursos: cursosCount || 0,
        totalAlunos: alunosCount || 0,
        totalMatriculas: matriculasCount || 0,
        matriculasAtivas: matriculasAtivasCount || 0,
        turmasAtivas: turmasAtivasCount || 0,
        contratosEntregues: contratosEntreguesCount || 0,
        contratosPendentes: contratosPendentesCount || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Provas',
      value: stats.totalProvas,
      icon: FileText,
      color: 'bg-blue-500',
      href: '/admin/dashboard/provas'
    },
    {
      title: 'Cursos',
      value: stats.totalCursos,
      icon: Book,
      color: 'bg-purple-500',
      href: '/admin/dashboard/turmas'
    },
    {
      title: 'Alunos',
      value: stats.totalAlunos,
      icon: Users,
      color: 'bg-green-500',
      href: '/admin/dashboard/alunos'
    },
    {
      title: 'Matrículas',
      value: stats.totalMatriculas,
      icon: ClipboardList,
      color: 'bg-yellow-500',
      href: '/admin/dashboard/matriculas',
      subtitle: `${stats.matriculasAtivas} ativas`
    },
    {
      title: 'Turmas Ativas',
      value: stats.turmasAtivas,
      icon: Activity,
      color: 'bg-indigo-500',
      href: '/admin/dashboard/turmas-config'
    },
    {
      title: 'Contratos',
      value: stats.contratosEntregues,
      icon: FileCheck,
      color: 'bg-teal-500',
      href: '/admin/dashboard/alunos?contrato=pendente',
      subtitle: `${stats.contratosPendentes} pendentes`
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? '...' : card.value}
              </p>
              {card.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </Link>
          );
        })}
      </div>

      {/* Ações rápidas */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/dashboard/alunos/novo"
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Cadastrar Aluno</h3>
              <p className="text-sm text-gray-500">Adicione um novo aluno</p>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/matriculas/nova"
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClipboardList className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Nova Matrícula</h3>
              <p className="text-sm text-gray-500">Registre uma nova matrícula</p>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/provas/nova"
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Adicionar Prova</h3>
              <p className="text-sm text-gray-500">Cadastre uma nova prova</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}