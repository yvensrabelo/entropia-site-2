'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';

export default function RelatorioFrequenciaPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthGuard>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/dashboard/relatorios"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Relatórios
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-800">Relatório de Frequência</h1>
          <p className="text-gray-600 mt-1">Análise detalhada de presenças e ausências</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Carregando dados...</p>
            </div>
          ) : (
            <p>Relatório de frequência em desenvolvimento...</p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}