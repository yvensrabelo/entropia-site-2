'use client'

import { useState, useEffect } from 'react'

export default function DemoPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            ENTROPIA DEMO
          </h1>
          <p className="text-xl text-gray-300 mb-8">Página de demonstração funcionando</p>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })} - yvens
          </div>
          <a 
            href="/diagonal"
            className="inline-block mt-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300"
          >
            Ver Página Diagonal
          </a>
        </div>
      </div>
    </div>
  )
}