'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full text-center p-8">
        <h2 className="text-4xl font-bold text-red-500 mb-4">
          Ops! Algo deu errado
        </h2>
        <p className="text-gray-300 mb-8">
          Encontramos um erro inesperado. Por favor, tente novamente.
        </p>
        <button
          onClick={() => reset()}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  )
}