'use client'

import { useState } from 'react'
import CalculadoraDinamica from '@/components/CalculadoraDinamica'
import IntroPortal from '@/components/IntroPortal'
import ViewCounter from '@/components/ViewCounter'
import '../calculator-dark.css'

export default function CalculadoraPage() {
  const [introComplete, setIntroComplete] = useState(false)

  const handleIntroComplete = () => {
    setIntroComplete(true)
  }

  const handleSkip = () => {
    setIntroComplete(true)
  }

  return (
    <>
      {!introComplete && (
        <IntroPortal 
          onComplete={handleIntroComplete}
          onSkip={handleSkip}
        />
      )}
      {introComplete && (
        <div className="calculator-page">
          <main className="min-h-screen bg-[#0d0d0d]">
            {/* Contador de Visualizações - Parte Superior */}
            <div className="w-full border-b border-gray-800 bg-[#111111]/50 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-white">
                      Calculadora de Notas
                    </h1>
                    <div className="w-px h-6 bg-gray-600"></div>
                    <ViewCounter className="text-sm" />
                  </div>
                  <div className="text-xs text-gray-400">
                    Entropia Cursinho
                  </div>
                </div>
              </div>
            </div>
            
            {/* Conteúdo Principal */}
            <div className="container mx-auto px-4 py-8">
              <div className="calculadora-dark">
                <CalculadoraDinamica />
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  )
}