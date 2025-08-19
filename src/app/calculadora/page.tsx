'use client'

import { useState } from 'react'
import CalculadoraDinamica from '@/components/CalculadoraDinamica'
import IntroPortal from '@/components/IntroPortal'
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