'use client'

import { useState, useEffect } from 'react'

export default function EasterEggs() {
  const [sequence, setSequence] = useState<string[]>([])
  const [logoClicks, setLogoClicks] = useState(0)
  const [knowledgeExplosion, setKnowledgeExplosion] = useState(false)
  const [matrixMode, setMatrixMode] = useState(false)
  const [confetti, setConfetti] = useState(false)

  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']

  // Konami Code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setSequence(prev => {
        const newSequence = [...prev, e.code].slice(-konamiCode.length)
        if (JSON.stringify(newSequence) === JSON.stringify(konamiCode)) {
          setKnowledgeExplosion(true)
          setTimeout(() => setKnowledgeExplosion(false), 3000)
          return []
        }
        return newSequence
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Logo clicks
  useEffect(() => {
    const logo = document.querySelector('h1')
    if (!logo) return

    const handleClick = () => {
      setLogoClicks(prev => {
        const newCount = prev + 1
        if (newCount === 5) {
          setMatrixMode(true)
          setTimeout(() => setMatrixMode(false), 10000)
          return 0
        }
        setTimeout(() => setLogoClicks(0), 2000)
        return newCount
      })
    }

    logo.addEventListener('click', handleClick)
    return () => logo.removeEventListener('click', handleClick)
  }, [])

  // Approval button
  useEffect(() => {
    const button = document.getElementById('approval-btn')
    if (!button) return

    const handleClick = () => {
      setConfetti(true)
      setTimeout(() => setConfetti(false), 4000)
    }

    button.addEventListener('click', handleClick)
    return () => button.removeEventListener('click', handleClick)
  }, [])

  return (
    <>
      {/* Knowledge Explosion */}
      {knowledgeExplosion && (
        <div className="fixed inset-0 pointer-events-none z-[10000]">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="absolute text-2xl font-bold animate-ping"
              style={{
                left: '50%',
                top: '50%',
                color: ['#10b981', '#34d399', '#6ee7b7'][i % 3],
                transform: `translate(${(Math.random() - 0.5) * 800}px, ${(Math.random() - 0.5) * 800}px)`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '3s'
              }}
            >
              {['FÍSICA', 'MATEMÁTICA', 'QUÍMICA', 'BIOLOGIA', '🧠', '📚', '🎓'][i % 7]}
            </div>
          ))}
        </div>
      )}

      {/* Matrix Mode */}
      {matrixMode && (
        <div className="fixed inset-0 pointer-events-none z-[9999] bg-black/50">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute text-green-400 font-mono text-sm animate-pulse"
              style={{
                left: `${(i * 2) % 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`
              }}
            >
              {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
            </div>
          ))}
        </div>
      )}

      {/* Confetti */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-[10000]">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-50px',
                animationDelay: `${i * 0.1}s`,
                animationDuration: '4s'
              }}
            >
              {['🎉', '🎊', '🎓', '📚', '🏆', '⭐'][i % 6]}
            </div>
          ))}
        </div>
      )}
    </>
  )
}