'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { Prova } from '@/lib/types/prova';

interface ProvaCardProps {
  prova: Prova;
}

export default function ProvaCard({ prova }: ProvaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
    >
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600" />
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <FileText className="w-5 h-5 text-green-700" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-green-700">
                {prova.subcategoria || prova.tipo_prova}
              </span>
              {prova.area && (
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                  {prova.area}
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-xl leading-tight">
              {prova.titulo}
            </h3>
          </div>
          <span className="px-3 py-1 text-sm font-bold text-green-700 bg-green-50 border border-green-200 rounded-full">
            {prova.ano}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
          <span className="font-semibold">{prova.instituicao}</span>
          {prova.etapa && (
            <>
              <span>•</span>
              <span>{prova.etapa}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Se não é gabarito e tem url_pdf, mostra botão PROVA */}
          {!prova.is_gabarito && prova.url_pdf && (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={prova.url_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 text-sm font-semibold text-green-700 bg-white border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-center shadow-sm hover:shadow-md"
            >
              PROVA
            </motion.a>
          )}
          
          {/* Se é gabarito, mostra botão GAB com a URL apropriada */}
          {prova.is_gabarito && (prova.url_gabarito || prova.url_pdf) && (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={prova.url_gabarito || prova.url_pdf || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all duration-200 text-center shadow-sm hover:shadow-md"
            >
              GAB
            </motion.a>
          )}
          
          {/* Se não é gabarito mas tem url_gabarito, mostra botão GAB adicional */}
          {!prova.is_gabarito && prova.url_gabarito && (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={prova.url_gabarito}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all duration-200 text-center shadow-sm hover:shadow-md"
            >
              GAB
            </motion.a>
          )}
        </div>

        {/* Views counter */}
        <div className="absolute bottom-2 right-3 text-xs text-gray-500 font-medium">
          {prova.visualizacoes} visualizações
        </div>
      </div>
    </motion.div>
  );
}