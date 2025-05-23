'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const EasterEggs = dynamic(() => import('./working/EasterEggs'), { 
  ssr: false,
  loading: () => null
})

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md p-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h1 
            data-logo
            className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform"
          >
            ENTROPIA
          </h1>
          <div className="flex gap-6">
            <a href="#turmas" className="hover:text-green-400 transition-colors">Turmas</a>
            <a href="#materiais" className="hover:text-green-400 transition-colors">Materiais</a>
            <a href="/calculadora" className="hover:text-green-400 transition-colors">Calculadora</a>
          </div>
        </div>
      </nav>

      {/* Hero Section com Hexágonos */}
      <section className="min-h-screen flex items-center justify-center relative pt-20 overflow-hidden">
        {/* Hexagon Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="hexagons" width="10" height="8.66" patternUnits="userSpaceOnUse">
                <polygon points="5,0 10,2.5 10,6.16 5,8.66 0,6.16 0,2.5" fill="none" stroke="#10b981" strokeWidth="0.1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        <div className="text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-black mb-8">
            <span className="block text-white">TRANSFORME</span>
            <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              SEU FUTURO
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            O cursinho pré-vestibular com metodologia comprovada e resultados extraordinários
          </p>
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform mb-4">
            Comece Agora
          </button>
          <div className="text-sm font-medium text-gray-400 h-6">
            {mounted && (
              <>
                {new Date().toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })} - yvens
              </>
            )}
          </div>
        </div>
      </section>

      {/* Turmas Section com Cards Hexagonais */}
      <section id="turmas" className="py-20 bg-gray-50 text-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-black text-center mb-16">
            Nossas <span className="text-green-600">Turmas</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Intensivo PSC */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-8 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 mb-6 flex items-center justify-center" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}>
                  <span className="text-white text-2xl font-bold">PSC</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Intensivo PSC</h3>
                <p className="text-gray-600 mb-4">Preparação focada para o Processo Seletivo Contínuo da UFAM</p>
                <ul className="text-sm text-gray-600 mb-6 space-y-2">
                  <li>• Manhã e Tarde</li>
                  <li>• 6 meses de duração</li>
                  <li>• Simulados semanais</li>
                  <li>• Material exclusivo</li>
                </ul>
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                  Saiba Mais
                </button>
              </div>
            </div>

            {/* ENEM Total */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-8 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 mb-6 flex items-center justify-center" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}>
                  <span className="text-white text-xl font-bold">ENEM</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">ENEM Total</h3>
                <p className="text-gray-600 mb-4">Curso completo para conquistar sua vaga pelo ENEM</p>
                <ul className="text-sm text-gray-600 mb-6 space-y-2">
                  <li>• Período matutino</li>
                  <li>• 8 meses de duração</li>
                  <li>• Redação nota 1000</li>
                  <li>• Plantão de dúvidas</li>
                </ul>
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                  Saiba Mais
                </button>
              </div>
            </div>

            {/* SIS/MACRO */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-8 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 mb-6 flex items-center justify-center" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}>
                  <span className="text-white text-xl font-bold">SIS</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">SIS/MACRO</h3>
                <p className="text-gray-600 mb-4">Preparação especializada para UEA e universidades privadas</p>
                <ul className="text-sm text-gray-600 mb-6 space-y-2">
                  <li>• Período noturno</li>
                  <li>• 4 meses de duração</li>
                  <li>• Foco em questões</li>
                  <li>• Material atualizado</li>
                </ul>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                  Saiba Mais
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Materiais Section */}
      <section id="materiais" className="py-20 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-black text-center mb-16">
            Biblioteca <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Digital</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-2xl hover:scale-105 transition-transform before:absolute before:inset-[-2px] before:bg-gradient-to-r before:from-transparent before:via-green-400 before:to-transparent before:rounded-2xl before:opacity-0 hover:before:opacity-30 before:transition-opacity before:-z-10">
              <h3 className="text-xl font-bold mb-2">Apostilas</h3>
              <p className="text-green-400 font-semibold text-3xl">200+</p>
              <p className="text-gray-400 text-sm mt-2">PDFs completos</p>
            </div>
            <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-6 rounded-2xl hover:scale-105 transition-transform before:absolute before:inset-[-2px] before:bg-gradient-to-r before:from-transparent before:via-blue-400 before:to-transparent before:rounded-2xl before:opacity-0 hover:before:opacity-30 before:transition-opacity before:-z-10">
              <h3 className="text-xl font-bold mb-2">Vídeos</h3>
              <p className="text-blue-400 font-semibold text-3xl">1000+</p>
              <p className="text-gray-400 text-sm mt-2">Aulas gravadas</p>
            </div>
            <div className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-2xl hover:scale-105 transition-transform before:absolute before:inset-[-2px] before:bg-gradient-to-r before:from-transparent before:via-purple-400 before:to-transparent before:rounded-2xl before:opacity-0 hover:before:opacity-30 before:transition-opacity before:-z-10">
              <h3 className="text-xl font-bold mb-2">Podcasts</h3>
              <p className="text-purple-400 font-semibold text-3xl">150+</p>
              <p className="text-gray-400 text-sm mt-2">Áudios educativos</p>
            </div>
            <div className="relative bg-gradient-to-br from-orange-500/20 to-red-500/20 p-6 rounded-2xl hover:scale-105 transition-transform before:absolute before:inset-[-2px] before:bg-gradient-to-r before:from-transparent before:via-orange-400 before:to-transparent before:rounded-2xl before:opacity-0 hover:before:opacity-30 before:transition-opacity before:-z-10">
              <h3 className="text-xl font-bold mb-2">Simulados</h3>
              <p className="text-orange-400 font-semibold text-3xl">500+</p>
              <p className="text-gray-400 text-sm mt-2">Questões resolvidas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-5xl font-black text-green-400 mb-2">850+</h3>
              <p className="text-gray-400">Alunos Aprovados</p>
            </div>
            <div>
              <h3 className="text-5xl font-black text-green-400 mb-2">95%</h3>
              <p className="text-gray-400">Taxa de Aprovação</p>
            </div>
            <div>
              <h3 className="text-5xl font-black text-green-400 mb-2">12</h3>
              <p className="text-gray-400">Anos de Experiência</p>
            </div>
            <div>
              <h3 className="text-5xl font-black text-green-400 mb-2">50+</h3>
              <p className="text-gray-400">Professores</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-black border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-black mb-8 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            ENTROPIA
          </h3>
          <button 
            data-confetti
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-12 py-4 rounded-full font-bold text-xl mb-8 hover:scale-105 transition-transform"
          >
            🎯 GARANTIR MINHA APROVAÇÃO 🎓
          </button>
          <p className="text-gray-400">
            © 2024 Entropia Cursinho. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Easter Eggs */}
      {mounted && <EasterEggs />}

      {/* Instructions */}
      {mounted && (
        <div className="fixed bottom-8 right-8 bg-black/80 border border-green-500/20 rounded-xl p-4 max-w-xs">
          <h4 className="text-green-400 font-bold text-sm mb-2">🎮 Easter Eggs</h4>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>↑↑↓↓←→←→BA = Explosão</li>
            <li>5x no logo = Matrix</li>
            <li>Botão final = Confetti</li>
          </ul>
        </div>
      )}

    </div>
  )
}