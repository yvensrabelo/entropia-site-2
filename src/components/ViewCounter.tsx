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
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    const updateViews = async () => {
      try {
        console.log('🔍 ViewCounter: Iniciando busca de views...')
        
        // Primeiro, buscar o número atual
        const getResponse = await fetch('/api/views', {
          method: 'GET',
          cache: 'no-store'
        })
        
        console.log('📡 GET Response status:', getResponse.status)
        
        if (!getResponse.ok) {
          const errorText = await getResponse.text()
          console.error('❌ GET failed:', errorText)
          throw new Error(`GET falhou: ${getResponse.status} - ${errorText}`)
        }
        
        const getData = await getResponse.json()
        console.log('📊 GET Data:', getData)
        setDebugInfo(`GET: ${getData.source || 'unknown'}`)
        
        // Depois, incrementar
        console.log('🔍 ViewCounter: Incrementando contador...')
        const postResponse = await fetch('/api/views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        console.log('📡 POST Response status:', postResponse.status)
        
        if (!postResponse.ok) {
          const errorText = await postResponse.text()
          console.error('❌ POST failed:', errorText)
          throw new Error(`POST falhou: ${postResponse.status} - ${errorText}`)
        }
        
        const postData = await postResponse.json()
        console.log('📊 POST Data:', postData)
        
        const finalViews = postData.views || getData.views || 0
        setViewCount(finalViews)
        setDebugInfo(`${postData.source || getData.source || 'unknown'}: ${finalViews}`)
        setError(false)
        
        console.log('✅ ViewCounter: Sucesso!', finalViews)
      } catch (err) {
        console.error('💥 Erro ao atualizar visualizações:', err)
        setError(true)
        setViewCount(0)
        setDebugInfo(`Erro: ${err instanceof Error ? err.message : 'Desconhecido'}`)
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
      <div className={`flex items-center gap-2 text-red-400 ${className}`}>
        <Eye className="w-5 h-5" />
        <div className="flex flex-col">
          <span className="text-sm font-mono">--- visualizações</span>
          <span className="text-xs text-gray-500 max-w-xs truncate">
            {debugInfo || 'Erro desconhecido'}
          </span>
        </div>
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
      
      {/* Badge de "ao vivo" com debug */}
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-400 uppercase tracking-wider">
          {debugInfo.includes('vercel-kv') ? 'kv' : debugInfo.includes('local') ? 'local' : 'ao vivo'}
        </span>
      </div>
    </div>
  )
}