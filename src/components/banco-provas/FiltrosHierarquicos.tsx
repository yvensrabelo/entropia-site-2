'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, GraduationCap, Brain, FileCheck, BookOpen, Users, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUBCATEGORIAS, AREAS_MACRO } from '@/lib/types/prova';

interface FiltroHierarquicoProps {
  contadorProvas: Record<string, number>;
  onFiltroChange: (tipo: string | null, subcategoria?: string | null, area?: string | null) => void;
  filtroAtivo: {
    tipo: string | null;
    subcategoria: string | null;
    area: string | null;
  };
}

const tiposProva = [
  { id: 'PSC', nome: 'PSC', icon: GraduationCap, cor: 'blue' },
  { id: 'MACRO', nome: 'MACRO', icon: Brain, cor: 'purple' },
  { id: 'SIS', nome: 'SIS', icon: FileCheck, cor: 'indigo' },
  { id: 'ENEM', nome: 'ENEM', icon: BookOpen, cor: 'green' },
  { id: 'PSI', nome: 'PSI', icon: Users, cor: 'orange' }
];

export default function FiltrosHierarquicos({ contadorProvas, onFiltroChange, filtroAtivo }: FiltroHierarquicoProps) {
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});

  const toggleExpansao = (tipo: string) => {
    setExpandidos(prev => ({ ...prev, [tipo]: !prev[tipo] }));
  };

  const handleTipoClick = (tipo: string) => {
    // Se o tipo tem subcategorias, apenas expande/colapsa
    if (SUBCATEGORIAS[tipo]) {
      toggleExpansao(tipo);
    } else {
      // Para tipos sem subcategorias (ENEM, PSI), aplica o filtro diretamente
      const isActive = filtroAtivo.tipo === tipo;
      onFiltroChange(isActive ? null : tipo);
    }
  };

  const handleSubcategoriaClick = (tipo: string, subcategoria: string) => {
    const isActive = filtroAtivo.tipo === tipo && filtroAtivo.subcategoria === subcategoria;
    onFiltroChange(isActive ? null : tipo, isActive ? null : subcategoria);
  };

  const handleAreaClick = (area: string) => {
    const isActive = filtroAtivo.area === area;
    onFiltroChange(
      isActive ? null : filtroAtivo.tipo, 
      isActive ? null : filtroAtivo.subcategoria, 
      isActive ? null : area
    );
  };

  const clearAllFilters = () => {
    onFiltroChange(null);
    setExpandidos({});
  };

  const hasActiveFilters = filtroAtivo.tipo || filtroAtivo.subcategoria || filtroAtivo.area;

  // Calcular contadores por subcategoria e área (simulado - seria ideal vir do backend)
  const getSubcategoriaCount = (tipo: string, subcategoria: string) => {
    // Para demonstração, retorna um número baseado no contador total
    const total = contadorProvas[tipo] || 0;
    return Math.floor(total / (SUBCATEGORIAS[tipo]?.length || 1));
  };

  const getAreaCount = (area: string) => {
    // Para demonstração
    return Math.floor((contadorProvas.MACRO || 0) / AREAS_MACRO.length);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtros</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpar filtros
            </button>
          )}
        </div>
        
        {/* Filtros ativos */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filtroAtivo.tipo && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                {filtroAtivo.subcategoria || filtroAtivo.tipo}
                {filtroAtivo.area && ` - ${filtroAtivo.area}`}
                <button
                  onClick={() => onFiltroChange(null)}
                  className="ml-1 hover:text-emerald-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Accordions */}
      <div className="divide-y divide-gray-100">
        {tiposProva.map((tipo) => {
          const Icon = tipo.icon;
          const count = contadorProvas[tipo.id] || 0;
          const isExpanded = expandidos[tipo.id];
          const hasSubcategorias = SUBCATEGORIAS[tipo.id];
          const isActive = filtroAtivo.tipo === tipo.id && !hasSubcategorias;

          // Cores dinâmicas
          const corClasses = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
            indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', hover: 'hover:bg-indigo-100' },
            green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', hover: 'hover:bg-green-100' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', hover: 'hover:bg-orange-100' }
          };
          
          const cores = corClasses[tipo.cor as keyof typeof corClasses];

          return (
            <div key={tipo.id} className="group">
              {/* Header do accordion */}
              <button
                onClick={() => handleTipoClick(tipo.id)}
                disabled={count === 0}
                className={`w-full p-4 flex items-center justify-between transition-all duration-200 ${
                  count === 0 
                    ? 'opacity-40 cursor-not-allowed' 
                    : isActive 
                      ? `${cores.bg} ${cores.text}` 
                      : `hover:bg-gray-50 text-gray-700`
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tipo.nome}</span>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/50' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </div>
                
                {hasSubcategorias && count > 0 && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                )}
              </button>

              {/* Conteúdo do accordion */}
              <AnimatePresence>
                {hasSubcategorias && isExpanded && count > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-2">
                      {/* Subcategorias */}
                      <div className="space-y-1">
                        {SUBCATEGORIAS[tipo.id].map((sub) => {
                          const isSubActive = filtroAtivo.tipo === tipo.id && filtroAtivo.subcategoria === sub;
                          const subCount = getSubcategoriaCount(tipo.id, sub);
                          
                          return (
                            <div key={sub}>
                              <button
                                onClick={() => handleSubcategoriaClick(tipo.id, sub)}
                                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                                  isSubActive 
                                    ? `${cores.bg} ${cores.text} ${cores.border} border` 
                                    : `text-gray-600 ${cores.hover}`
                                }`}
                              >
                                <span>{sub}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    isSubActive ? 'bg-white/50' : 'bg-gray-100'
                                  }`}>
                                    {subCount}
                                  </span>
                                  {tipo.id === 'MACRO' && sub === 'DIA 2' && (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                </div>
                              </button>

                              {/* Áreas para MACRO DIA 2 */}
                              <AnimatePresence>
                                {tipo.id === 'MACRO' && sub === 'DIA 2' && isSubActive && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden ml-6 mt-1"
                                  >
                                    <div className="space-y-1">
                                      {AREAS_MACRO.map((area) => {
                                        const isAreaActive = filtroAtivo.area === area;
                                        const areaCount = getAreaCount(area);
                                        
                                        return (
                                          <button
                                            key={area}
                                            onClick={() => handleAreaClick(area)}
                                            className={`w-full px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-between ${
                                              isAreaActive 
                                                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                                : 'text-gray-600 hover:bg-purple-50'
                                            }`}
                                          >
                                            <span>{area}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                              isAreaActive ? 'bg-white/50' : 'bg-gray-100'
                                            }`}>
                                              {areaCount}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}