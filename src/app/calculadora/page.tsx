'use client'

import { useState, useEffect } from 'react'
import CalculadoraDinamica from '@/components/CalculadoraDinamica'
import CalculadoraIntro from '@/components/CalculadoraIntro'
import Layout from '@/components/Layout'

export default function CalculadoraPage() {
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    // Auto-hide após 4 segundos caso o usuário não clique
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {showIntro && (
        <CalculadoraIntro onComplete={() => setShowIntro(false)} />
      )}
      <Layout>
        <main className="min-h-screen bg-gray-50 pt-16 pb-8">
          <div className="container mx-auto px-4 py-2">
            <CalculadoraDinamica />
          </div>
        </main>
      </Layout>
    </>
  )
}