'use client';

import { useEffect, useState } from 'react';
import ProvasList from '@/components/banco-provas/ProvasList';
import { BookOpen, Download, Search, FileText, Filter, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';
import { Prova } from '@/lib/types/prova';
import { motion } from 'framer-motion';

export default function BancoDeProvasPage() {
  const [stats, setStats] = useState({
    totalProvas: 0,
    tiposUnicos: 0,
    loading: true
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      if (!supabase) {
        setStats({ totalProvas: 0, tiposUnicos: 0, loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('provas')
        .select('tipo_prova');

      if (error) throw error;

      const totalProvas = data?.length || 0;
      const tiposUnicos = new Set(data?.map(p => p.tipo_prova).filter(Boolean)).size;

      setStats({ totalProvas, tiposUnicos, loading: false });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setStats({ totalProvas: 0, tiposUnicos: 0, loading: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section Compacta */}
      <section className="relative px-4 py-8 md:py-16 max-h-[40vh] md:max-h-[50vh] bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950">
        {/* Pattern de fundo sutil */}
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-7xl relative z-10"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Banco de Provas
          </h1>
          <p className="text-sm md:text-base text-blue-100 max-w-2xl">
            Provas anteriores dos principais vestibulares
          </p>
          
          {/* Stats minimalistas */}
          <div className="flex gap-4 md:gap-8 mt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-bold text-white">
                {stats.loading ? '...' : stats.totalProvas}
              </div>
              <div className="text-xs md:text-sm text-blue-200">
                Provas
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-bold text-white">
                {stats.loading ? '...' : stats.tiposUnicos}
              </div>
              <div className="text-xs md:text-sm text-blue-200">
                Vestibulares
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Filtros e Busca Sticky */}
      <section className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-center">
            {/* Barra de busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar provas..."
                className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Filtros chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-colors min-h-[44px]">
                <Filter className="w-4 h-4" />
                Filtros
              </button>
              
              <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[44px]">
                Ano
                <ChevronDown className="w-4 h-4 ml-1 inline" />
              </button>
              
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-colors min-h-[44px]">
                Tipo
                <ChevronDown className="w-4 h-4 ml-1 inline" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Provas */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <ProvasList />
      </section>
    </div>
  );
}