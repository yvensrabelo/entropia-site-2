'use client';

import { motion } from 'framer-motion';
import { FileText, BookOpen } from 'lucide-react';
import { Prova } from '@/lib/types/prova';

interface PsiGroup {
  key: string;
  instituicao: string;
  ano: number;
  dia1?: {
    prova?: Prova;
    gabarito?: Prova;
  };
  dia2?: {
    prova?: Prova;
    gabarito?: Prova;
  };
  totalVisualizacoes: number;
}

interface PsiGroupCardProps {
  group: PsiGroup;
}

export default function PsiGroupCard({ group }: PsiGroupCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 min-h-[300px] md:min-h-[350px] flex flex-col"
    >
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600" />
      
      {/* Content */}
      <div className="relative p-4 md:p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 md:mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="p-1.5 md:p-2 bg-green-50 rounded-lg">
                <FileText className="w-3 h-3 md:w-5 md:h-5 text-green-700" />
              </div>
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-green-700">
                PSI
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg md:text-xl leading-tight">
              PSI {group.ano}
            </h3>
          </div>
          <span className="flex-shrink-0 px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-bold text-green-700 bg-green-50 border border-green-200 rounded-full">
            {group.ano}
          </span>
        </div>

        {/* Institution */}
        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
          <span className="font-semibold">{group.instituicao}</span>
        </div>

        {/* DIA 1 Section */}
        {group.dia1 && (
          <div className="mb-4 md:mb-5">
            <div className="text-xs md:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5 md:gap-2">
              <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
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
                  className="flex-1 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-green-700 bg-white border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-center shadow-sm hover:shadow-md"
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
                  className="flex-1 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all duration-200 text-center shadow-sm hover:shadow-md"
                >
                  GABARITO
                </motion.a>
              )}
            </div>
          </div>
        )}
        
        {/* Divider */}
        {group.dia1 && group.dia2 && (
          <div className="border-t border-gray-200 my-3 md:my-4" />
        )}

        {/* DIA 2 Section */}
        {group.dia2 && (
          <div>
            <div className="text-xs md:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5 md:gap-2">
              <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
              DIA 2 - Conhecimentos Gerais
            </div>
            <div className="flex gap-2">
              {group.dia2.prova && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={group.dia2.prova.url_pdf || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-green-700 bg-white border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-center shadow-sm hover:shadow-md"
                >
                  PROVA
                </motion.a>
              )}
              {group.dia2.gabarito && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={group.dia2.gabarito.url_gabarito || group.dia2.gabarito.url_pdf || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all duration-200 text-center shadow-sm hover:shadow-md"
                >
                  GABARITO
                </motion.a>
              )}
            </div>
          </div>
        )}

        {/* Views counter */}
        <div className="mt-3 text-right text-xs text-gray-500 font-medium">
          {group.totalVisualizacoes} visualizações
        </div>
      </div>
    </motion.div>
  );
}