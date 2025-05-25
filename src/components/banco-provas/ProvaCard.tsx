'use client';

import { motion } from 'framer-motion';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Prova } from '@/lib/types/prova';

interface ProvaCardProps {
  prova: Prova;
}

export default function ProvaCard({ prova }: ProvaCardProps) {
  const getInstituicaoColor = (inst: string) => {
    const colors: Record<string, string> = {
      UEA: 'bg-blue-100 text-blue-800',
      UFAM: 'bg-green-100 text-green-800',
      UFRR: 'bg-yellow-100 text-yellow-800',
      UERR: 'bg-purple-100 text-purple-800',
      ENEM: 'bg-red-100 text-red-800',
    };
    return colors[inst] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getInstituicaoColor(prova.instituicao)}`}>
          {prova.instituicao}
        </span>
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {prova.ano}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {prova.titulo}
      </h3>
      
      {prova.etapa && (
        <p className="text-sm text-gray-600 mb-4">{prova.etapa}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {prova.visualizacoes} visualizações
        </span>
      </div>

      <div className="flex gap-2">
        <a
          href={prova.url_pdf}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Visualizar
        </a>
        
        <a
          href={prova.url_pdf}
          download
          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <Download className="w-4 h-4" />
        </a>
      </div>

      {prova.url_gabarito && (
        <a
          href={prova.url_gabarito}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 w-full text-center text-sm text-blue-600 hover:text-blue-700 block"
        >
          Ver Gabarito
        </a>
      )}
    </motion.div>
  );
}