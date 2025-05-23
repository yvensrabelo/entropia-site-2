'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const EasterEggs = dynamic(() => import('./EasterEggs'), { 
  ssr: false,
  loading: () => null
})

export default function WorkingPage() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Conteúdo estático que não causa hidratação */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md p-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h1 className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            ENTROPIA
          </h1>
          <div className="flex gap-6">
            <a href="#turmas" className="hover:text-green-400 transition-colors">Turmas</a>
            <a href="#materiais" className="hover:text-green-400 transition-colors">Materiais</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center relative pt-20">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-black mb-8">
            <span className="block text-white">TRANSFORME</span>
            <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              SEU FUTURO
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            O cursinho pré-vestibular com metodologia comprovada
          </p>
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">
            Comece Agora
          </button>
        </div>
      </section>

      {/* Turmas */}
      <section id="turmas" className="py-20 bg-gray-100 text-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-black text-center mb-16">
            Nossas <span className="text-green-600">Turmas</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-2 transition-transform">
              <h3 className="text-2xl font-bold mb-4">Intensivo PSC</h3>
              <p className="text-gray-600 mb-6">Preparação focada para UFAM</p>
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold">
                Saiba Mais
              </button>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-2 transition-transform">
              <h3 className="text-2xl font-bold mb-4">ENEM Total</h3>
              <p className="text-gray-600 mb-6">Curso completo para ENEM</p>
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold">
                Saiba Mais
              </button>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-2 transition-transform">
              <h3 className="text-2xl font-bold mb-4">SIS/MACRO</h3>
              <p className="text-gray-600 mb-6">Preparação para UEA</p>
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold">
                Saiba Mais
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Materiais */}
      <section id="materiais" className="py-20 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-black text-center mb-16">
            Biblioteca <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Digital</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-2xl hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold mb-2">Apostilas</h3>
              <p className="text-green-400 font-semibold">200+</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-2xl hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold mb-2">Vídeos</h3>
              <p className="text-green-400 font-semibold">1000+</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-2xl hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold mb-2">Podcasts</h3>
              <p className="text-green-400 font-semibold">150+</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-2xl hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold mb-2">Simulados</h3>
              <p className="text-green-400 font-semibold">500+</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-black mb-8 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            ENTROPIA
          </h3>
          <button 
            id="approval-btn"
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-12 py-4 rounded-full font-bold text-xl mb-8 hover:scale-105 transition-transform"
          >
            🎯 GARANTIR MINHA APROVAÇÃO 🎓
          </button>
          <p className="text-gray-400">
            © 2024 Entropia Cursinho. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Easter Eggs - carregados apenas após hidratação */}
      {hydrated && <EasterEggs />}

      {/* Instructions */}
      <div className="fixed bottom-8 right-8 bg-black/80 border border-green-500/20 rounded-xl p-4 max-w-xs">
        <h4 className="text-green-400 font-bold text-sm mb-2">🎮 Easter Eggs</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>↑↑↓↓←→←→BA = Explosão</li>
          <li>5x no logo = Matrix</li>
          <li>Botão final = Confetti</li>
        </ul>
      </div>
    </div>
  )
}