'use client'

import { useEffect } from 'react'

export function useServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {
            console.log('Service Worker registrado com sucesso:', registration)
            
            // Verificar atualizações periodicamente
            setInterval(() => {
              registration.update()
            }, 60000) // A cada minuto
            
            // Notificar quando houver atualização
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Nova versão disponível
                    console.log('Nova versão do app disponível!')
                  }
                })
              }
            })
          })
          .catch(error => {
            console.error('Erro ao registrar Service Worker:', error)
          })
      })
    }
  }, [])
}