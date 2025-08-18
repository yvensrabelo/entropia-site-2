'use client'

import { useState, useEffect } from 'react'
import CalculadoraDinamica from '@/components/CalculadoraDinamica'
import LandingIntroMinimal from '@/components/LandingIntroMinimal'
import Layout from '@/components/Layout'

export default function CalculadoraPage() {
  const [introComplete, setIntroComplete] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleIntroComplete = () => {
    setIntroComplete(true)
    setShowIntro(false)
  }

  const reopenIntro = () => {
    setIntroComplete(false)
    setShowIntro(true)
  }

  if (!mounted) {
    // Return minimal layout during SSR to avoid hydration mismatch
    return (
      <Layout>
        <main className="min-h-screen bg-gray-50 pt-16 pb-8">
          <div className="container mx-auto px-4 py-2">
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </main>
      </Layout>
    )
  }

  return (
    <>
      {showIntro && !introComplete && (
        <LandingIntroMinimal onComplete={handleIntroComplete} />
      )}
      {introComplete && (
        <Layout>
          <main className="min-h-screen bg-gray-50 pt-16 pb-8">
            <div className="container mx-auto px-4 py-2">
              {/* Botão opcional para reabrir a intro */}
              <button
                onClick={reopenIntro}
                className="fixed bottom-4 right-4 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
                title="Ver animação inicial"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
              <CalculadoraDinamica />
            </div>
          </main>
        </Layout>
      )}
    </>
  )
}