'use client';

import { useEffect, useState, useMemo } from 'react';
import { FileText, Download, GraduationCap, BookOpen, Brain, Sparkles, FileX, Calendar, Tag, Eye, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';
import { Prova } from '@/lib/types/prova';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos de filtros disponíveis
const FILTER_TYPES = [
  {
    id: 'PSC',
    name: 'PSC',
    icon: GraduationCap,
    gradient: 'from-emerald-400 to-green-600',
    bgGradient: 'from-emerald-500/20 to-green-600/20',
    count: 0
  },
  {
    id: 'SIS',
    name: 'SIS',
    icon: BookOpen,
    gradient: 'from-green-400 to-teal-600',
    bgGradient: 'from-green-500/20 to-teal-600/20',
    count: 0
  },
  {
    id: 'MACRO',
    name: 'MACRO',
    icon: Brain,
    gradient: 'from-teal-400 to-cyan-600',
    bgGradient: 'from-teal-500/20 to-cyan-600/20',
    count: 0
  },
  {
    id: 'ENEM',
    name: 'ENEM',
    icon: FileText,
    gradient: 'from-cyan-400 to-blue-600',
    bgGradient: 'from-cyan-500/20 to-blue-600/20',
    count: 0
  },
  {
    id: 'PSI',
    name: 'PSI',
    icon: Sparkles,
    gradient: 'from-purple-400 to-pink-600',
    bgGradient: 'from-purple-500/20 to-pink-600/20',
    count: 0
  },
  {
    id: 'UERR',
    name: 'UERR',
    icon: GraduationCap,
    gradient: 'from-orange-400 to-red-600',
    bgGradient: 'from-orange-500/20 to-red-600/20',
    count: 0
  },
  {
    id: 'UFRR',
    name: 'UFRR',
    icon: BookOpen,
    gradient: 'from-indigo-400 to-purple-600',
    bgGradient: 'from-indigo-500/20 to-purple-600/20',
    count: 0
  }
];

// Função para gerar provas de exemplo
const gerarProvasExemplo = (): Prova[] => {
  console.log('📝 Gerando provas de exemplo...');
  
  const tipos = ['PSC', 'SIS', 'MACRO', 'ENEM', 'PSI', 'UERR', 'UFRR'];
  const instituicoes = ['UFAM', 'UEA', 'UFRR', 'UERR'];
  const anos = [2025, 2024, 2023, 2022, 2021];
  
  const provasExemplo: Prova[] = [];
  let id = 1;
  
  // Gerar várias provas de exemplo
  tipos.forEach(tipo => {
    anos.forEach(ano => {
      if (tipo === 'PSC' || tipo === 'SIS') {
        [1, 2, 3].forEach(etapa => {
          provasExemplo.push({
            id: `prova-${id++}`,
            instituicao: tipo === 'PSC' ? 'UFAM' : 'UEA',
            tipo_prova: tipo,
            subcategoria: `${tipo} ${etapa}`,
            titulo: `${tipo} ${etapa} - ${ano}`,
            ano: ano,
            url_pdf: '#',
            visualizacoes: Math.floor(Math.random() * 1000),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      } else if (tipo === 'MACRO') {
        ['DIA 1', 'DIA 2'].forEach(dia => {
          provasExemplo.push({
            id: `prova-${id++}`,
            instituicao: 'UFAM',
            tipo_prova: tipo,
            subcategoria: dia,
            area: dia === 'DIA 2' ? 'BIOLÓGICAS' : undefined,
            titulo: `${tipo} ${dia} - ${ano}`,
            ano: ano,
            url_pdf: '#',
            visualizacoes: Math.floor(Math.random() * 1000),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      } else {
        provasExemplo.push({
          id: `prova-${id++}`,
          instituicao: instituicoes[Math.floor(Math.random() * instituicoes.length)],
          tipo_prova: tipo,
          titulo: `${tipo} - ${ano}`,
          ano: ano,
          url_pdf: '#',
          visualizacoes: Math.floor(Math.random() * 1000),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });
  });
  
  console.log(`✅ ${provasExemplo.length} provas de exemplo geradas`);
  return provasExemplo;
};

export default function BancoDeProvasPage() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filterCounts, setFilterCounts] = useState<Record<string, number>>({});
  const [subfiltro, setSubfiltro] = useState<string | null>(null);

  // Verificar configuração do Supabase
  console.log('🔍 Verificando configuração Supabase:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ URL configurada' : '❌ URL faltando',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Key configurada' : '❌ Key faltando',
    supabaseClient: supabase ? '✅ Cliente criado' : '❌ Cliente não criado'
  });

  useEffect(() => {
    fetchProvas();
  }, []);

  const fetchProvas = async () => {
    try {
      console.log('🔄 Iniciando busca no Supabase...');
      
      if (!supabase) {
        console.error('❌ Supabase não configurado');
        const exemploProvas = gerarProvasExemplo();
        setProvas(exemploProvas);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('provas')
        .select('*')
        .order('ano', { ascending: false })
        .order('created_at', { ascending: false });

      console.log('📊 Resposta do Supabase:', {
        data: data,
        dataLength: data?.length,
        error: error,
        firstItem: data?.[0]
      });

      if (error) {
        console.error('❌ Erro Supabase:', error.message);
        console.error('Detalhes:', error);
        
        // Se falhar, use dados de exemplo mais completos
        const exemploProvas = gerarProvasExemplo();
        setProvas(exemploProvas);
        
        // Contar provas por tipo
        const counts: Record<string, number> = {};
        exemploProvas.forEach(prova => {
          if (prova.tipo_prova) {
            counts[prova.tipo_prova] = (counts[prova.tipo_prova] || 0) + 1;
          }
        });
        setFilterCounts(counts);
        setLoading(false);
        return;
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ Nenhuma prova encontrada no banco');
        // Use dados de exemplo
        const exemploProvas = gerarProvasExemplo();
        setProvas(exemploProvas);
        
        // Contar provas por tipo
        const counts: Record<string, number> = {};
        exemploProvas.forEach(prova => {
          if (prova.tipo_prova) {
            counts[prova.tipo_prova] = (counts[prova.tipo_prova] || 0) + 1;
          }
        });
        setFilterCounts(counts);
        setLoading(false);
        return;
      }
      
      console.log('✅ Provas carregadas com sucesso:', data.length);
      
      // Contar provas por tipo
      const counts: Record<string, number> = {};
      data?.forEach(prova => {
        if (prova.tipo_prova) {
          counts[prova.tipo_prova] = (counts[prova.tipo_prova] || 0) + 1;
        }
      });
      
      console.log('📊 Contagem por tipo:', counts);
      
      setFilterCounts(counts);
      setProvas(data);
    } catch (error) {
      console.error('❌ Erro ao buscar provas:', error);
      // Use dados de exemplo em caso de erro
      const exemploProvas = gerarProvasExemplo();
      setProvas(exemploProvas);
      
      // Contar provas por tipo
      const counts: Record<string, number> = {};
      exemploProvas.forEach(prova => {
        if (prova.tipo_prova) {
          counts[prova.tipo_prova] = (counts[prova.tipo_prova] || 0) + 1;
        }
      });
      setFilterCounts(counts);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar provas baseado no filtro ativo e subfiltro
  const filteredProvas = useMemo(() => {
    let filtered = provas;
    
    // Filtro principal
    if (activeFilter) {
      filtered = filtered.filter(prova => 
        prova.tipo_prova?.toLowerCase() === activeFilter.toLowerCase()
      );
    }
    
    // Subfiltro
    if (subfiltro) {
      filtered = filtered.filter(prova => 
        prova.subcategoria?.toLowerCase() === subfiltro.toLowerCase()
      );
    }
    
    return filtered;
  }, [provas, activeFilter, subfiltro]);
  
  // Debug log
  console.log('🎯 Filtro ativo:', activeFilter);
  console.log('📚 Total de provas:', provas.length);
  console.log('🔍 Provas filtradas:', filteredProvas.length);
  
  // Mostrar estrutura da primeira prova
  if (filteredProvas.length > 0 && !loading) {
    console.log('📋 ESTRUTURA DA PRIMEIRA PROVA:', JSON.stringify(filteredProvas[0], null, 2));
  }

  // Atualizar contadores nos filtros
  const filtersWithCounts = FILTER_TYPES.map(filter => ({
    ...filter,
    count: filterCounts[filter.id] || 0
  }));

  const totalProvas = Object.values(filterCounts).reduce((a, b) => a + b, 0);
  const totalTypes = Object.keys(filterCounts).length;

  // Debug - remova após funcionar
  useEffect(() => {
    console.log('🔍 Estado atual:');
    console.log('- Loading:', loading);
    console.log('- Provas:', provas);
    console.log('- Provas Filtradas:', filteredProvas);
    console.log('- Filtro Ativo:', activeFilter);
    if (provas.length > 0) {
      console.log('📋 Estrutura da primeira prova:', provas[0]);
    }
  }, [loading, provas, filteredProvas, activeFilter]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section Ultra Compacta */}
      <section className="relative h-[25vh] md:h-[30vh] overflow-hidden">
        {/* Background com gradiente verde vibrante */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600">
          {/* Padrão geométrico */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(30deg, transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%),
                linear-gradient(-30deg, transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%)
              `,
              backgroundSize: '20px 20px'
            }} />
          </div>
          
          {/* Efeito de luz */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-48 -translate-y-48" />
        </div>
        
        {/* Conteúdo minimalista */}
        <div className="relative z-10 flex flex-col justify-center h-full px-6 max-w-7xl mx-auto text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-black mb-2 text-white drop-shadow-2xl"
            style={{
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            Banco de Provas
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-6 text-sm md:text-base"
          >
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black">{totalProvas}</span>
              <span className="opacity-80">provas</span>
            </div>
            <div className="w-px h-8 bg-white/30" />
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black">{totalTypes}</span>
              <span className="opacity-80">vestibulares</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sistema de Filtros Inovador */}
      <section className="px-6 -mt-8 relative z-20 mb-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {filtersWithCounts.map((filter, index) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            
            return (
              <motion.button
                key={filter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveFilter(isActive ? null : filter.id);
                  setSubfiltro(null); // Reset subfiltro quando muda filtro principal
                }}
                className={`
                  min-w-[140px] backdrop-blur-xl rounded-2xl p-4 shadow-xl border group transition-all
                  ${isActive 
                    ? 'bg-gradient-to-br ' + filter.gradient + ' text-white border-white/50' 
                    : 'bg-white/90 border-white/50 hover:border-emerald-200'
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all
                    ${isActive 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-br ' + filter.gradient + ' group-hover:shadow-lg'
                    }
                  `}>
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white'}`} />
                  </div>
                  <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>
                    {filter.name}
                  </span>
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {filter.count} provas
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Filtros Secundários (Subcategorias) */}
      {activeFilter && ['PSC', 'SIS', 'MACRO'].includes(activeFilter) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pb-4"
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {activeFilter === 'PSC' && ['Todos', 'PSC 1', 'PSC 2', 'PSC 3'].map((sub) => (
              <button
                key={sub}
                onClick={() => setSubfiltro(sub === 'Todos' ? null : sub)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  subfiltro === sub || (sub === 'Todos' && !subfiltro)
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-emerald-50'
                }`}
              >
                {sub}
              </button>
            ))}
            {activeFilter === 'SIS' && ['Todos', 'SIS 1', 'SIS 2', 'SIS 3'].map((sub) => (
              <button
                key={sub}
                onClick={() => setSubfiltro(sub === 'Todos' ? null : sub)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  subfiltro === sub || (sub === 'Todos' && !subfiltro)
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-emerald-50'
                }`}
              >
                {sub}
              </button>
            ))}
            {activeFilter === 'MACRO' && ['Todos', 'DIA 1', 'DIA 2'].map((sub) => (
              <button
                key={sub}
                onClick={() => setSubfiltro(sub === 'Todos' ? null : sub)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  subfiltro === sub || (sub === 'Todos' && !subfiltro)
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-emerald-50'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Grid de Provas com Design Premium */}
      <section className="px-6 pb-20 max-w-7xl mx-auto">
        {/* Título da seção */}
        {filteredProvas.length > 0 && (
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-800 mb-6"
          >
            {activeFilter ? `Provas de ${activeFilter.toUpperCase()}` : 'Todas as Provas'}
            {subfiltro && ` - ${subfiltro}`}
            <span className="text-emerald-600 ml-2">({filteredProvas.length})</span>
          </motion.h2>
        )}
        
        
        {/* GRID DE PROVAS MODERNO */}
        {!loading && filteredProvas.length > 0 && (
          <div className="space-y-4">
            {filteredProvas.map((prova, index) => (
              <motion.div
                key={prova.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group"
              >
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200">
                  {/* Decoração gradiente sutil */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400" />
                  
                  {/* Badge tipo no canto */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold rounded-full shadow-md">
                      {prova.tipo_prova}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    {/* Header com instituição */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                          {prova.instituicao}
                        </p>
                        <h3 className="text-lg font-bold text-gray-800">
                          {prova.titulo}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Metadados */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {prova.ano}
                      </span>
                      {prova.subcategoria && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {prova.subcategoria}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {prova.visualizacoes || 0} views
                      </span>
                    </div>
                    
                    {/* Botões Prova e Gabarito */}
                    <div className="flex gap-3">
                      {/* Botão Prova */}
                      <motion.a
                        href={prova.url_pdf || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200 rounded-xl p-4 flex items-center justify-center gap-2 transition-all group/btn"
                      >
                        <FileText className="w-5 h-5 text-emerald-600 group-hover/btn:scale-110 transition-transform" />
                        <span className="font-semibold text-emerald-700">Prova</span>
                        <Download className="w-4 h-4 text-emerald-500" />
                      </motion.a>
                      
                      {/* Botão Gabarito (se existir) */}
                      {prova.url_gabarito && (
                        <motion.a
                          href={prova.url_gabarito}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl p-4 flex items-center justify-center gap-2 transition-all group/btn"
                        >
                          <CheckCircle className="w-5 h-5 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                          <span className="font-semibold text-blue-700">Gabarito</span>
                          <Download className="w-4 h-4 text-blue-500" />
                        </motion.a>
                      )}
                    </div>
                  </div>
                  
                  {/* Hover effect sutil */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-green-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:via-green-500/5 group-hover:to-teal-500/5 transition-all duration-500 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="h-32 bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer" />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-full mb-4">
                <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Nenhuma prova encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {activeFilter 
                  ? `Ainda não temos provas de ${activeFilter} disponíveis.`
                  : 'Estamos preparando as provas para você!'
                }
              </p>
              {activeFilter && (
                <button
                  onClick={() => setActiveFilter(null)}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Limpar filtro
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      
      {/* CSS para efeito shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}