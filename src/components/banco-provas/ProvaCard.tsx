'use client';

import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Building2 } from 'lucide-react';
import { Prova } from '@/lib/types/prova';

interface ProvaCardProps {
  prova: Prova;
}

export default function ProvaCard({ prova }: ProvaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* Gradient accent top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600" />
      
      {/* Content */}
      <div className="relative p-4 md:p-5">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {prova.subcategoria || prova.tipo_prova}
              </span>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full">
              {prova.ano}
            </span>
          </div>
          
          <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight mb-2">
            {prova.titulo}
          </h3>
          
          {prova.area && (
            <span className="inline-block text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              {prova.area}
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            <span>{prova.instituicao}</span>
          </div>
          {prova.etapa && (
            <>
              <span className="text-gray-400 dark:text-gray-600">•</span>
              <span>{prova.etapa}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Se não é gabarito e tem url_pdf, mostra botão PROVA */}
          {!prova.is_gabarito && prova.url_pdf && (
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={prova.url_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all duration-200 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>Prova</span>
            </motion.a>
          )}
          
          {/* Se é gabarito, mostra botão GAB com a URL apropriada */}
          {prova.is_gabarito && (prova.url_gabarito || prova.url_pdf) && (
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={prova.url_gabarito || prova.url_pdf || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-all duration-200 min-h-[44px]"
            >
              <FileText className="w-4 h-4" />
              <span>Gabarito</span>
            </motion.a>
          )}
          
          {/* Se não é gabarito mas tem url_gabarito, mostra botão GAB adicional */}
          {!prova.is_gabarito && prova.url_gabarito && (
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={prova.url_gabarito}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-all duration-200 min-h-[44px]"
            >
              <FileText className="w-4 h-4" />
              <span>Gabarito</span>
            </motion.a>
          )}
        </div>

        {/* Views counter - opcional */}
        {prova.visualizacoes && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            {prova.visualizacoes} visualizações
          </div>
        )}
      </div>
    </motion.div>
  );
}