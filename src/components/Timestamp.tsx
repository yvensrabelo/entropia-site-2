'use client'

import { useEffect, useState } from 'react'

export default function Timestamp() {
  const [timestamp, setTimestamp] = useState<string>('')

  useEffect(() => {
    setTimestamp(new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Manaus',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }))
  }, [])

  return (
    <div className="text-xs text-gray-500 text-center mt-4">
      Deploy: {timestamp || 'Carregando...'} {timestamp && '(Manaus)'}
    </div>
  )
}