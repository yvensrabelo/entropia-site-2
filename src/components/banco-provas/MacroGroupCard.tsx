'use client';

import { motion } from 'framer-motion';
import { FileText, BookOpen, Brain, Calculator, Users, Leaf, Waves, Atom } from 'lucide-react';
import { Prova } from '@/lib/types/prova';

interface MacroGroup {
  key: string;
  instituicao: string;
  ano: number;
  dia1?: {
    prova?: Prova;
    gabarito?: Prova;
  };
  dia2?: {
    biologicas?: {
      prova?: Prova;
      gabarito?: Prova;
    };
    humanas?: {
      prova?: Prova;
      gabarito?: Prova;
    };
    exatas?: {
      prova?: Prova;
      gabarito?: Prova;
    };
  };
  totalVisualizacoes: number;
}

interface MacroGroupCardProps {
  group: MacroGroup;
}

export default function MacroGroupCard({ group }: MacroGroupCardProps) {
  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'biologicas':
        return <Leaf className="w-4 h-4" />;
      case 'humanas':
        return <Waves className="w-4 h-4" />;
      case 'exatas':
        return <Atom className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getAreaColor = (area: string) => {
    switch (area) {
      case 'biologicas':
        return {
          text: 'text-[#43A047]',
          bg: 'bg-[#E8F5E9]',
          hover: 'hover:bg-[#C8E6C9]'
        };
      case 'humanas':
        return {
          text: 'text-[#00897B]',
          bg: 'bg-[#E0F2F1]',
          hover: 'hover:bg-[#B2DFDB]'
        };
      case 'exatas':
        return {
          text: 'text-[#00695C]',
          bg: 'bg-[#E0F2F1]',
          hover: 'hover:bg-[#B2DFDB]'
        };
      default:
        return {
          text: 'text-gray-600',
          bg: 'bg-gray-50',
          hover: 'hover:bg-gray-100'
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#81C784]/20"
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] rounded-full blur-3xl" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-[#43A047] to-[#2E7D32] rounded-full blur-2xl" />
      </div>
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/50 backdrop-blur-sm rounded-lg">
                <FileText className="w-5 h-5 text-[#1B5E20]" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-[#1B5E20]">
                MACRO
              </span>
            </div>
            <h3 className="font-bold text-[#1B5E20] text-xl leading-tight">
              MACRO {group.ano}
            </h3>
          </div>
          <span className="px-3 py-1 text-sm font-bold text-white bg-[#00C853] rounded-full shadow-sm">
            {group.ano}
          </span>
        </div>

        {/* Institution */}
        <div className="flex items-center gap-3 text-sm text-[#2E7D32] mb-4">
          <span className="font-semibold">{group.instituicao}</span>
        </div>

        {/* DIA 1 Section */}
        {group.dia1 && (
          <div className="mb-5">
            <div className="text-sm font-semibold text-[#2E7D32] mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              DIA 1 - Conhecimentos Gerais
            </div>
            <div className="flex gap-2">
              {group.dia1.prova && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={group.dia1.prova.url_pdf || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[#4CAF50] rounded-lg hover:bg-[#45A049] transition-all duration-200 text-center shadow-sm hover:shadow-md"
                  style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
                >
                  PROVA
                </motion.a>
              )}
              {group.dia1.gabarito && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={group.dia1.gabarito.url_gabarito || group.dia1.gabarito.url_pdf || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[#66BB6A] rounded-lg hover:bg-[#5CB85C] transition-all duration-200 text-center shadow-sm hover:shadow-md"
                  style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
                >
                  GABARITO
                </motion.a>
              )}
            </div>
          </div>
        )}
        
        {/* Divider */}
        {group.dia1 && group.dia2 && (
          <div className="border-t border-[#81C784]/30 my-4" />
        )}

        {/* DIA 2 Section */}
        {group.dia2 && (
          <div>
            <div className="text-sm font-semibold text-[#2E7D32] mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              DIA 2 - Conhecimentos Específicos
            </div>
            <div className="space-y-3">
              {/* Biológicas */}
              {group.dia2.biologicas && (
                <div className="flex items-center gap-3 p-3 bg-white/40 backdrop-blur-sm rounded-lg">
                  <div className="flex items-center gap-2 min-w-[110px]">
                    <div className={`p-1.5 rounded-md ${getAreaColor('biologicas').bg}`}>
                      {getAreaIcon('biologicas')}
                    </div>
                    <span className={`text-sm font-semibold ${getAreaColor('biologicas').text}`}>
                      Biológicas
                    </span>
                  </div>
                  <div className="flex gap-2 flex-1">
                    {group.dia2.biologicas.prova ? (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={group.dia2.biologicas.prova.url_pdf || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#4CAF50] rounded-md hover:bg-[#45A049] transition-all duration-200 text-center shadow-sm"
                      >
                        PROVA
                      </motion.a>
                    ) : (
                      <div className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-md text-center opacity-50">
                        PROVA
                      </div>
                    )}
                    {group.dia2.biologicas.gabarito ? (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={group.dia2.biologicas.gabarito.url_gabarito || group.dia2.biologicas.gabarito.url_pdf || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#66BB6A] rounded-md hover:bg-[#5CB85C] transition-all duration-200 text-center shadow-sm"
                      >
                        GAB
                      </motion.a>
                    ) : (
                      <div className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-md text-center opacity-50">
                        GAB
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Humanas */}
              {group.dia2.humanas && (
                <div className="flex items-center gap-3 p-3 bg-white/40 backdrop-blur-sm rounded-lg">
                  <div className="flex items-center gap-2 min-w-[110px]">
                    <div className={`p-1.5 rounded-md ${getAreaColor('humanas').bg}`}>
                      {getAreaIcon('humanas')}
                    </div>
                    <span className={`text-sm font-semibold ${getAreaColor('humanas').text}`}>
                      Humanas
                    </span>
                  </div>
                  <div className="flex gap-2 flex-1">
                    {group.dia2.humanas.prova ? (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={group.dia2.humanas.prova.url_pdf || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#4CAF50] rounded-md hover:bg-[#45A049] transition-all duration-200 text-center shadow-sm"
                      >
                        PROVA
                      </motion.a>
                    ) : (
                      <div className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-md text-center opacity-50">
                        PROVA
                      </div>
                    )}
                    {group.dia2.humanas.gabarito ? (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={group.dia2.humanas.gabarito.url_gabarito || group.dia2.humanas.gabarito.url_pdf || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#66BB6A] rounded-md hover:bg-[#5CB85C] transition-all duration-200 text-center shadow-sm"
                      >
                        GAB
                      </motion.a>
                    ) : (
                      <div className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-md text-center opacity-50">
                        GAB
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Exatas */}
              {group.dia2.exatas && (
                <div className="flex items-center gap-3 p-3 bg-white/40 backdrop-blur-sm rounded-lg">
                  <div className="flex items-center gap-2 min-w-[110px]">
                    <div className={`p-1.5 rounded-md ${getAreaColor('exatas').bg}`}>
                      {getAreaIcon('exatas')}
                    </div>
                    <span className={`text-sm font-semibold ${getAreaColor('exatas').text}`}>
                      Exatas
                    </span>
                  </div>
                  <div className="flex gap-2 flex-1">
                    {group.dia2.exatas.prova ? (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={group.dia2.exatas.prova.url_pdf || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#4CAF50] rounded-md hover:bg-[#45A049] transition-all duration-200 text-center shadow-sm"
                      >
                        PROVA
                      </motion.a>
                    ) : (
                      <div className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-md text-center opacity-50">
                        PROVA
                      </div>
                    )}
                    {group.dia2.exatas.gabarito ? (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={group.dia2.exatas.gabarito.url_gabarito || group.dia2.exatas.gabarito.url_pdf || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#66BB6A] rounded-md hover:bg-[#5CB85C] transition-all duration-200 text-center shadow-sm"
                      >
                        GAB
                      </motion.a>
                    ) : (
                      <div className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-md text-center opacity-50">
                        GAB
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Views counter */}
        <div className="absolute bottom-2 right-3 text-xs text-[#1B5E20]/60 font-medium">
          {group.totalVisualizacoes} visualizações
        </div>
      </div>
    </motion.div>
  );
}