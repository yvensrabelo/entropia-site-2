'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { Prova } from '@/lib/types/prova';

interface ProvaGroup {
  key: string;
  instituicao: string;
  tipo_prova: string;
  subcategoria?: string | null;
  area?: string | null;
  ano: number;
  etapa?: string | null;
  titulo: string;
  prova?: Prova;
  gabarito?: Prova;
  totalVisualizacoes: number;
}

interface ProvaGroupCardProps {
  group: ProvaGroup;
}

export default function ProvaGroupCard({ group }: ProvaGroupCardProps) {
  const getTipoGradient = (tipo: string) => {
    const gradients: Record<string, string> = {
      PSC: 'from-blue-500/10 to-cyan-500/10',
      MACRO: 'from-purple-500/10 to-pink-500/10',
      SIS: 'from-indigo-500/10 to-blue-500/10',
      ENEM: 'from-emerald-500/10 to-green-500/10',
      PSI: 'from-orange-500/10 to-amber-500/10'
    };
    return gradients[tipo] || 'from-gray-500/10 to-gray-400/10';
  };

  const getTipoAccent = (tipo: string) => {
    const colors: Record<string, string> = {
      PSC: 'text-blue-600',
      MACRO: 'text-purple-600',
      SIS: 'text-indigo-600',
      ENEM: 'text-emerald-600',
      PSI: 'text-orange-600'
    };
    return colors[tipo] || 'text-gray-600';
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getTipoGradient(group.tipo_prova)} opacity-50`} />
      
      {/* Content */}
      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className={`text-xs font-bold uppercase tracking-wider ${getTipoAccent(group.tipo_prova)}`}>
                {group.subcategoria || group.tipo_prova}
              </span>
              {group.area && (
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  {group.area}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2" title={group.titulo}>
              {group.titulo}
            </h3>
          </div>
          <span className="text-xs font-medium text-gray-500 ml-2">
            {group.ano}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="font-medium">{group.instituicao}</span>
          {group.etapa && (
            <>
              <span>•</span>
              <span>{group.etapa}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Botão PROVA */}
          {group.prova && (
            <a
              href={group.prova.url_pdf || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 text-center group-hover:scale-105"
            >
              PROVA
            </a>
          )}
          
          {/* Botão GAB */}
          {group.gabarito && (
            <a
              href={group.gabarito.url_gabarito || group.gabarito.url_pdf || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 hover:text-emerald-800 transition-all duration-200 text-center group-hover:scale-105"
            >
              GAB
            </a>
          )}
        </div>

        {/* Views counter - very subtle */}
        <div className="absolute bottom-1 right-2 text-[10px] text-gray-400">
          {group.totalVisualizacoes} views
        </div>
      </div>
    </motion.div>
  );
}