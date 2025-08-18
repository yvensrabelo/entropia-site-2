'use client'

import { useState } from 'react'
import CalculadoraDinamica from '@/components/CalculadoraDinamica'
import LandingIntro from '@/components/LandingIntro'
import Layout from '@/components/Layout'

export default function CalculadoraPage() {
  const [showIntro, setShowIntro] = useState(true)

  return (
    <>
      <LandingIntro onComplete={() => setShowIntro(false)} />
      {!showIntro && (
        <Layout>
          <main className="min-h-screen bg-gray-50 pt-16 pb-8">
            <div className="container mx-auto px-4 py-2">
              <CalculadoraDinamica />
            </div>
          </main>
        </Layout>
      )}
    </>
  )
}