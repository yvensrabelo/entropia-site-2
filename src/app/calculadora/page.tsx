'use client'

import { useState, useEffect } from 'react'
import CalculadoraDinamica from '@/components/CalculadoraDinamica'
import LandingIntroMinimal from '@/components/LandingIntroMinimal'
import Layout from '@/components/Layout'

export default function CalculadoraPage() {
  const [introComplete, setIntroComplete] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
      {!introComplete && (
        <LandingIntroMinimal onComplete={() => setIntroComplete(true)} />
      )}
      {introComplete && (
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