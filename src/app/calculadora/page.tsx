'use client'

import CalculadoraDinamica from '@/components/CalculadoraDinamica'

export default function CalculadoraPage() {
  return (
    <main className="min-h-screen bg-[#0d0d0d]">
      <div className="container mx-auto px-4 py-8">
        <div className="calculadora-dark">
          <CalculadoraDinamica />
        </div>
      </div>
    </main>
  )
}