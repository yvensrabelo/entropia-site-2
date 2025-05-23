'use client'

import { useEffect } from 'react'

export default function FinalPage() {
  useEffect(() => {
    // Konami Code
    let sequence: string[] = []
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']
    
    const handleKeyDown = (e: KeyboardEvent) => {
      sequence = [...sequence, e.code].slice(-konamiCode.length)
      if (JSON.stringify(sequence) === JSON.stringify(konamiCode)) {
        triggerKnowledgeExplosion()
        sequence = []
      }
    }

    // Logo clicks for Matrix
    let logoClicks = 0
    const handleLogoClick = () => {
      logoClicks++
      if (logoClicks === 5) {
        triggerMatrix()
        logoClicks = 0
      }
      setTimeout(() => { logoClicks = 0 }, 2000)
    }

    // Confetti button
    const handleConfetti = () => {
      triggerConfetti()
    }

    const triggerKnowledgeExplosion = () => {
      const words = ['FÍSICA', 'MATEMÁTICA', 'QUÍMICA', 'BIOLOGIA', '🧠', '📚', '🎓']
      const colors = ['#10b981', '#34d399', '#6ee7b7']
      
      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          const particle = document.createElement('div')
          particle.textContent = words[i % words.length]
          particle.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            color: ${colors[i % colors.length]};
            font-size: 24px;
            font-weight: bold;
            pointer-events: none;
            z-index: 10000;
            transform: translate(-50%, -50%);
            animation: explode 3s ease-out forwards;
          `
          document.body.appendChild(particle)
          
          setTimeout(() => particle.remove(), 3000)
        }, i * 100)
      }
    }

    const triggerMatrix = () => {
      const overlay = document.createElement('div')
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        pointer-events: none;
        z-index: 9999;
      `
      
      for (let i = 0; i < 100; i++) {
        const char = document.createElement('div')
        char.textContent = String.fromCharCode(65 + Math.floor(Math.random() * 26))
        char.style.cssText = `
          position: absolute;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          color: #10b981;
          font-family: monospace;
          font-size: 14px;
          animation: matrix 2s linear infinite;
        `
        overlay.appendChild(char)
      }
      
      document.body.appendChild(overlay)
      setTimeout(() => overlay.remove(), 10000)
    }

    const triggerConfetti = () => {
      const emojis = ['🎉', '🎊', '🎓', '📚', '🏆', '⭐']
      
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          const confetto = document.createElement('div')
          confetto.textContent = emojis[i % emojis.length]
          confetto.style.cssText = `
            position: fixed;
            left: ${Math.random() * 100}%;
            top: -50px;
            font-size: 24px;
            pointer-events: none;
            z-index: 10000;
            animation: fall 4s ease-in forwards;
          `
          document.body.appendChild(confetto)
          
          setTimeout(() => confetto.remove(), 4000)
        }, i * 100)
      }
    }

    // Add CSS animations
    const style = document.createElement('style')
    style.textContent = `
      @keyframes explode {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
        100% { 
          transform: translate(calc(-50% + ${Math.random() * 800 - 400}px), calc(-50% + ${Math.random() * 800 - 400}px)) scale(1) rotate(360deg); 
          opacity: 0; 
        }
      }
      @keyframes matrix {
        0% { opacity: 1; }
        50% { opacity: 0.3; }
        100% { opacity: 1; }
      }
      @keyframes fall {
        0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(calc(100vh + 50px)) rotate(720deg); opacity: 0; }
      }
    `
    document.head.appendChild(style)

    // Event listeners
    window.addEventListener('keydown', handleKeyDown)
    
    // Wait for DOM to be ready
    setTimeout(() => {
      const logo = document.querySelector('[data-logo]')
      const button = document.querySelector('[data-confetti]')
      
      if (logo) logo.addEventListener('click', handleLogoClick)
      if (button) button.addEventListener('click', handleConfetti)
    }, 100)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      style.remove()
    }
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-emerald-900/20"></div>
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
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">
            Comece Agora
          </button>
        </div>
      </section>

      {/* Turmas Section */}
      <section id="turmas" className="py-20 bg-gray-100 text-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-black text-center mb-16">
            Nossas <span className="text-green-600">Turmas</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-2xl font-bold mb-4">Intensivo PSC</h3>
              <p className="text-gray-600 mb-6">Preparação focada para o Processo Seletivo Contínuo da UFAM</p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Simulados semanais</li>
                <li>• Material exclusivo</li>
                <li>• Monitoria personalizada</li>
                <li>• 40 vagas disponíveis</li>
              </ul>
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                Saiba Mais
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-2xl font-bold mb-4">ENEM Total</h3>
              <p className="text-gray-600 mb-6">Curso completo para conquistar sua vaga pelo ENEM</p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Redação nota 1000</li>
                <li>• Questões comentadas</li>
                <li>• Plantão de dúvidas</li>
                <li>• 35 vagas disponíveis</li>
              </ul>
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                Saiba Mais
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-2xl font-bold mb-4">SIS/MACRO</h3>
              <p className="text-gray-600 mb-6">Preparação especializada para UEA e universidades privadas</p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Foco em questões</li>
                <li>• Professores especialistas</li>
                <li>• Material atualizado</li>
                <li>• 30 vagas disponíveis</li>
              </ul>
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                Saiba Mais
              </button>
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
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-6 rounded-2xl hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold mb-2">Apostilas</h3>
              <p className="text-blue-400 font-semibold">200+ materiais</p>
              <p className="text-gray-400 text-sm mt-2">Material didático completo e atualizado</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-2xl hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold mb-2">Videoaulas</h3>
              <p className="text-purple-400 font-semibold">1000+ vídeos</p>
              <p className="text-gray-400 text-sm mt-2">Aulas gravadas disponíveis 24/7</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-2xl hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold mb-2">Podcasts</h3>
              <p className="text-green-400 font-semibold">150+ episódios</p>
              <p className="text-gray-400 text-sm mt-2">Conteúdo em áudio para qualquer lugar</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-6 rounded-2xl hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold mb-2">Simulados</h3>
              <p className="text-orange-400 font-semibold">500+ simulados</p>
              <p className="text-gray-400 text-sm mt-2">Questões comentadas e gabaritos detalhados</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400 mb-6">
              Mais de 10.000 materiais disponíveis para alunos matriculados
            </p>
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">
              Acessar Portal Completo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-black mb-8 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            ENTROPIA
          </h3>
          <p className="text-gray-400 mb-8">
            Transformando sonhos em realidade acadêmica desde 2009
          </p>
          
          <button 
            data-confetti
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-12 py-4 rounded-full font-bold text-xl mb-8 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300"
          >
            🎯 GARANTIR MINHA APROVAÇÃO 🎓
          </button>
          
          <div className="flex justify-center gap-6 mb-8">
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Instagram</a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">YouTube</a>
          </div>
          
          <p className="text-sm text-gray-500">
            © 2024 Entropia Cursinho. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Easter Eggs Instructions */}
      <div className="fixed bottom-8 right-8 bg-black/80 border border-green-500/20 rounded-xl p-4 max-w-xs backdrop-blur-sm">
        <h4 className="text-green-400 font-bold text-sm mb-2">🎮 Easter Eggs</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>↑↑↓↓←→←→BA = Explosão de conhecimento</li>
          <li>Clique 5x no logo = Modo Matrix</li>
          <li>Botão final = Confetti de aprovação</li>
        </ul>
      </div>
    </div>
  )
}