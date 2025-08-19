'use client'

import { useState, useEffect } from 'react'

interface ViewCounterProps {
  className?: string
}

export default function ViewCounter({ className = '' }: ViewCounterProps) {
  const [viewCount, setViewCount] = useState<number>(0)
  const [displayCount, setDisplayCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const updateViews = async () => {
      try {
        // Buscar o número atual
        const getResponse = await fetch('/api/views', {
          method: 'GET',
          cache: 'no-store'
        })
        
        if (!getResponse.ok) {
          throw new Error(`GET falhou: ${getResponse.status}`)
        }
        
        const getData = await getResponse.json()
        
        // Incrementar
        const postResponse = await fetch('/api/views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!postResponse.ok) {
          throw new Error(`POST falhou: ${postResponse.status}`)
        }
        
        const postData = await postResponse.json()
        
        const finalViews = postData.views || getData.views || 0
        setViewCount(finalViews)
        setError(false)
        
      } catch (err) {
        console.error('Erro ao atualizar visualizações:', err)
        setError(true)
        setViewCount(0)
      } finally {
        setLoading(false)
      }
    }

    updateViews()
  }, [])

  // Animação de contagem crescente
  useEffect(() => {
    if (viewCount === 0) return

    const duration = 2000 // 2 segundos
    const steps = 60
    const increment = viewCount / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= viewCount) {
        setDisplayCount(viewCount)
        clearInterval(timer)
      } else {
        setDisplayCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [viewCount])

  // Função para formatar número com separador de milhares
  const formatNumber = (num: number): string => {
    return num.toLocaleString('pt-BR')
  }

  // Separar os dígitos para o display
  const getDigits = (num: number): string[] => {
    const formatted = formatNumber(num)
    return formatted.split('').map(char => char)
  }

  if (loading) {
    return (
      <div className={`flip-clock-counter ${className}`}>
        <style jsx>{`
          .flip-clock-counter {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 16px 24px;
            background: linear-gradient(135deg, #111 0%, #1a1a1a 100%);
            border-radius: 12px;
            border: 1px solid #333;
          }
          .loading-text {
            color: #666;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .loading-digit {
            width: 32px;
            height: 42px;
            background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
            border: 1px solid #333;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 0 1.5px;
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.1; }
          }
          .loading-digit::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: rgba(0,0,0,0.3);
          }
        `}</style>
        <span className="loading-text">Carregando</span>
        <div style={{ display: 'inline-flex', gap: '3px' }}>
          <div className="loading-digit"></div>
          <div className="loading-digit"></div>
          <div className="loading-digit"></div>
          <div className="loading-digit"></div>
        </div>
        <span className="loading-text">alunos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flip-clock-counter error ${className}`}>
        <style jsx>{`
          .flip-clock-counter.error {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 16px 24px;
            background: linear-gradient(135deg, #1a0a0a 0%, #1a1a1a 100%);
            border-radius: 12px;
            border: 1px solid #433;
            color: #a66;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>
        <span>Erro ao carregar contador</span>
      </div>
    )
  }

  const digits = getDigits(displayCount)

  return (
    <div className={`flip-clock-counter ${className}`}>
      <style jsx>{`
        .flip-clock-counter {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px;
          background: linear-gradient(135deg, #111 0%, #1a1a1a 100%);
          border-radius: 12px;
          border: 1px solid #333;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .counter-text {
          color: #ffffff;
          font-size: 16px;
          text-transform: uppercase;
        }

        .digit-container {
          display: inline-flex;
          gap: 3px;
          margin: 0 4px;
        }

        .digit {
          width: 32px;
          height: 42px;
          background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
          border: 1px solid #333;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          color: #10b981;
          font-family: 'Courier New', monospace;
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
          animation: flipIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .digit::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(0,0,0,0.3);
          z-index: 2;
        }

        .digit::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
        }

        .digit.separator {
          width: 12px;
          background: transparent;
          border: none;
          box-shadow: none;
          color: #444;
          font-size: 16px;
        }

        .digit.separator::before,
        .digit.separator::after {
          display: none;
        }

        @keyframes flipIn {
          0% {
            opacity: 0;
            transform: perspective(400px) rotateX(90deg);
          }
          40% {
            transform: perspective(400px) rotateX(-20deg);
          }
          70% {
            transform: perspective(400px) rotateX(10deg);
          }
          100% {
            opacity: 1;
            transform: perspective(400px) rotateX(0deg);
          }
        }

        .digit:nth-child(1) { animation-delay: 0.1s; }
        .digit:nth-child(2) { animation-delay: 0.15s; }
        .digit:nth-child(3) { animation-delay: 0.2s; }
        .digit:nth-child(4) { animation-delay: 0.25s; }
        .digit:nth-child(5) { animation-delay: 0.3s; }
        .digit:nth-child(6) { animation-delay: 0.35s; }
        .digit:nth-child(7) { animation-delay: 0.4s; }

        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-left: 8px;
          padding: 4px 10px;
          background: rgba(255,0,0,0.1);
          border-radius: 6px;
          border: 1px solid rgba(255,0,0,0.2);
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background: #ff0000;
          border-radius: 50%;
          animation: livePulse 1.5s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(255,0,0,0.6);
        }

        @keyframes livePulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.5; 
            transform: scale(1.2);
          }
        }

        .live-text {
          font-size: 11px;
          color: #ff6666;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 600;
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .flip-clock-counter {
            padding: 12px 16px;
            gap: 6px;
            flex-wrap: wrap;
            justify-content: center;
            text-align: center;
          }

          .counter-text {
            font-size: 14px;
          }

          .digit {
            width: 28px;
            height: 36px;
            font-size: 18px;
          }

          .digit-container {
            gap: 2px;
          }

          .live-indicator {
            margin-left: 0;
            margin-top: 8px;
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .flip-clock-counter {
            padding: 10px 12px;
          }

          .counter-text {
            font-size: 13px;
          }

          .digit {
            width: 24px;
            height: 32px;
            font-size: 16px;
          }
        }
      `}</style>

      <span className="counter-text">
        <div className="digit-container" style={{ display: 'inline-flex' }}>
          {digits.map((digit, index) => (
            <div 
              key={index} 
              className={`digit ${digit === '.' ? 'separator' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {digit}
            </div>
          ))}
        </div>
        {' '}alunos confiaram na Entropia para calcular suas notas
      </span>

      <div className="live-indicator">
        <div className="live-dot"></div>
        <span className="live-text">Atualizado em tempo real</span>
      </div>
    </div>
  )
}