'use client'

import { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'

interface ViewCounterProps {
  className?: string
}

export default function ViewCounter({ className = '' }: ViewCounterProps) {
  const [viewCount, setViewCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const updateViews = async () => {
      try {
        // Primeiro, buscar o número atual
        const getResponse = await fetch('/api/views', {
          method: 'GET',
          cache: 'no-store'
        })
        
        if (!getResponse.ok) {
          throw new Error('Falha ao buscar views')
        }
        
        const getData = await getResponse.json()
        
        // Depois, incrementar
        const postResponse = await fetch('/api/views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!postResponse.ok) {
          throw new Error('Falha ao incrementar views')
        }
        
        const postData = await postResponse.json()
        setViewCount(postData.views || getData.views || 0)
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

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <Eye className="w-5 h-5 animate-pulse" />
        <span className="text-sm font-mono">Carregando...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <Eye className="w-5 h-5" />
        <span className="text-sm font-mono">--- visualizações</span>
      </div>
    )
  }

  return (
    <div className={`view-counter flex items-center gap-2 ${className}`}>
      {/* Ícone de olho com animação */}
      <div className="relative">
        <Eye className="w-5 h-5 text-green-400" />
        <div className="absolute inset-0 animate-ping">
          <Eye className="w-5 h-5 text-green-400 opacity-30" />
        </div>
      </div>
      
      {/* Contador com animação de números */}
      <div className="flex items-center gap-1">
        <span className="text-green-400 font-mono font-bold text-lg">
          {viewCount.toLocaleString('pt-BR')}
        </span>
        <span className="text-gray-300 text-sm">
          visualizações
        </span>
      </div>
      
      {/* Badge de "ao vivo" */}
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-400 uppercase tracking-wider">
          ao vivo
        </span>
      </div>
    </div>
  )
}