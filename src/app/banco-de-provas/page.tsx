'use client';

import { useEffect, useState } from 'react';
import ProvasList from '@/components/banco-provas/ProvasList';
import { BookOpen, Download, Search, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section com melhor contraste */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-green-700 to-teal-800">
        {/* Pattern de fundo mais sutil */}
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:40px_40px] opacity-30" />
        
        {/* Overlay escuro para melhor contraste */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/30" />
        
        <div className="container mx-auto px-4 py-20 max-w-7xl relative">
          {/* Área com fundo semi-transparente para o texto */}
          <div className="text-center mb-12 relative">
            {/* Background blur para área de texto */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-3xl -m-8" />
            
            <div className="relative p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-md rounded-2xl mb-6 shadow-lg"
              >
                <BookOpen className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight"
                style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}
              >
                Banco de Provas
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-white/95 max-w-2xl mx-auto font-medium"
                style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}
              >
                Sua biblioteca completa de provas anteriores dos principais vestibulares do Amazonas
              </motion.p>
            </div>
          </div>
          
          {/* Stats com glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-white mb-1">
                {stats.loading ? '...' : stats.totalProvas}
              </div>
              <div className="text-white/80 text-sm font-medium">
                Provas disponíveis
              </div>
            </div>
            
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-white mb-1">
                {stats.loading ? '...' : stats.tiposUnicos}
              </div>
              <div className="text-white/80 text-sm font-medium">
                Vestibulares
              </div>
            </div>
            
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <Download className="w-8 h-8 text-white mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-white/80 text-sm font-medium">
                Download em PDF
              </div>
            </div>
            
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <Search className="w-8 h-8 text-white mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-white/80 text-sm font-medium">
                Busca inteligente
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl">
        <ProvasList />
      </div>
    </div>
  );
}