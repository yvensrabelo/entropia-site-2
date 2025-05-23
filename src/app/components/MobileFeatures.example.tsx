/**
 * Demonstração de todas as funcionalidades mobile implementadas
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, ChevronLeft, ChevronRight, Smartphone } from 'lucide-react'

export default function MobileFeaturesDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Funcionalidades Mobile Implementadas
        </h1>

        {/* Swipe Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="text-green-600" size={24} />
            <h2 className="text-xl font-semibold">Navegação por Swipe</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Deslize para a esquerda ou direita para navegar entre as páginas principais
          </p>
          <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
            <ChevronLeft className="text-gray-400" />
            <span className="text-sm text-gray-500">Swipe</span>
            <ChevronRight className="text-gray-400" />
          </div>
        </div>

        {/* Pull to Refresh */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="text-green-600" size={24} />
            <h2 className="text-xl font-semibold">Pull to Refresh</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Na página de materiais, puxe para baixo para atualizar o conteúdo
          </p>
          <motion.div 
            className="p-4 bg-gray-50 rounded-lg text-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <RefreshCw className="mx-auto text-gray-400" size={20} />
            <span className="text-sm text-gray-500 mt-2 block">Puxe para baixo</span>
          </motion.div>
        </div>

        {/* Long Press Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-green-600 rounded-full animate-pulse" />
            <h2 className="text-xl font-semibold">Long Press nos Cards</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Pressione e segure qualquer card de material para ver ações contextuais
          </p>
          <div className="grid grid-cols-2 gap-2">
            {['Baixar', 'Compartilhar', 'Copiar', 'Favoritar'].map((action) => (
              <div 
                key={action}
                className="p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-600"
              >
                {action}
              </div>
            ))}
          </div>
        </div>

        {/* Otimizações */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🚀 Otimizações Aplicadas</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Prevenção de zoom indesejado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Controle de pull-to-refresh por página</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Detecção de dispositivo e orientação</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Feedback háptico em ações</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Safe areas para iPhone com notch</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Smooth scrolling otimizado</span>
            </li>
          </ul>
        </div>

        {/* Instruções de Uso */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
          <h3 className="font-semibold text-green-800 mb-3">Como Testar:</h3>
          <ol className="space-y-2 text-green-700 text-sm">
            <li>1. Acesse em um dispositivo móvel ou modo responsivo do navegador</li>
            <li>2. Navegue entre páginas deslizando horizontalmente</li>
            <li>3. Na página de materiais, puxe para baixo para refresh</li>
            <li>4. Pressione e segure cards para ver menu de ações</li>
            <li>5. Note que o zoom está desabilitado para melhor UX</li>
          </ol>
        </div>
      </div>
    </div>
  )
}