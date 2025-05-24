'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ToastProvider } from '@/components/Toast'

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  // Service worker registration moved to useEffect to avoid Safari issues
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {
            console.log('Service Worker registrado com sucesso:', registration)
          })
          .catch(error => {
            console.error('Erro ao registrar Service Worker:', error)
          })
      })
    }
  }, [])
  
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }
    
    window.addEventListener('beforeinstallprompt', handler)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])
  
  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('PWA instalado')
    }
    
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }
  
  return (
    <ToastProvider>
      {children}
      
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-green-600 text-white p-4 rounded-xl shadow-2xl z-50"
          >
            <h3 className="font-bold text-lg mb-2">Instalar Entropia App</h3>
            <p className="text-sm mb-4">
              Acesse rapidamente calculadora, materiais e mais!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-white text-green-600 py-2 px-4 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Instalar
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="px-4 py-2 bg-green-700 rounded-lg hover:bg-green-800 transition-colors"
              >
                Agora não
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastProvider>
  )
}