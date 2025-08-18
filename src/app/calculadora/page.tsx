'use client'

import { useState, useEffect } from 'react'
import CalculadoraDinamica from '@/components/CalculadoraDinamica'
import LandingIntroDark from '@/components/LandingIntroDark'
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
      <main className="min-h-screen bg-[#0d0d0d]">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-[#1a1a1a] rounded-lg"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      {showIntro && !introComplete && (
        <LandingIntroDark onComplete={handleIntroComplete} />
      )}
      {introComplete && (
        <main className="min-h-screen bg-[#0d0d0d]">
          <div className="container mx-auto px-4 py-8">
            <div className="calculadora-dark">
              <CalculadoraDinamica />
            </div>
          </div>
        </main>
      )}
    </>
  )
}