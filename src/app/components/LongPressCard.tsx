'use client'

import React, { useState, useRef, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Share2, Star, Copy, Eye, Trash2, Edit } from 'lucide-react'

interface ContextAction {
  icon: ReactNode
  label: string
  onClick: () => void
  destructive?: boolean
}

interface LongPressCardProps {
  children: ReactNode
  actions?: ContextAction[]
  onLongPress?: () => void
  longPressDuration?: number
  className?: string
  disabled?: boolean
}

export default function LongPressCard({
  children,
  actions = [],
  onLongPress,
  longPressDuration = 500,
  className = '',
  disabled = false,
}: LongPressCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [pressPosition, setPressPosition] = useState({ x: 0, y: 0 })
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const handlePressStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (disabled) return

    const event = 'touches' in e ? e.touches[0] : e
    const rect = cardRef.current?.getBoundingClientRect()
    
    if (rect) {
      setPressPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })
    }

    longPressTimer.current = setTimeout(() => {
      setShowActions(true)
      onLongPress?.()
      
      // Vibração haptica em dispositivos móveis
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }, longPressDuration)
  }, [disabled, longPressDuration, onLongPress])

  const handlePressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handleActionClick = useCallback((action: ContextAction) => {
    action.onClick()
    setShowActions(false)
  }, [])

  // Fechar menu ao clicar fora
  React.useEffect(() => {
    if (!showActions) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowActions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showActions])

  return (
    <div 
      ref={cardRef}
      className={`relative ${className}`}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Card content */}
      <motion.div
        animate={{
          scale: showActions ? 0.95 : 1,
          opacity: showActions ? 0.8 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>

      {/* Context menu */}
      <AnimatePresence>
        {showActions && actions.length > 0 && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setShowActions(false)}
            />

            {/* Actions menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute z-50 bg-white rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
              style={{
                left: pressPosition.x > 150 ? 'auto' : pressPosition.x,
                right: pressPosition.x > 150 ? 0 : 'auto',
                top: pressPosition.y > 200 ? 'auto' : pressPosition.y,
                bottom: pressPosition.y > 200 ? 0 : 'auto',
              }}
            >
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleActionClick(action)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
                    action.destructive ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                  }`}
                >
                  <span className="w-5 h-5">{action.icon}</span>
                  <span className="font-medium text-sm">{action.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Ações predefinidas comuns
export const commonActions = {
  download: (onClick: () => void): ContextAction => ({
    icon: <Download size={18} />,
    label: 'Baixar',
    onClick,
  }),
  share: (onClick: () => void): ContextAction => ({
    icon: <Share2 size={18} />,
    label: 'Compartilhar',
    onClick,
  }),
  favorite: (onClick: () => void): ContextAction => ({
    icon: <Star size={18} />,
    label: 'Favoritar',
    onClick,
  }),
  copy: (onClick: () => void): ContextAction => ({
    icon: <Copy size={18} />,
    label: 'Copiar',
    onClick,
  }),
  view: (onClick: () => void): ContextAction => ({
    icon: <Eye size={18} />,
    label: 'Visualizar',
    onClick,
  }),
  edit: (onClick: () => void): ContextAction => ({
    icon: <Edit size={18} />,
    label: 'Editar',
    onClick,
  }),
  delete: (onClick: () => void): ContextAction => ({
    icon: <Trash2 size={18} />,
    label: 'Excluir',
    onClick,
    destructive: true,
  }),
}

/**
 * Hook para detectar long press
 */
export function useLongPress(
  callback: () => void,
  options: {
    delay?: number
    shouldPreventDefault?: boolean
  } = {}
) {
  const { delay = 500, shouldPreventDefault = true } = options
  const timeout = useRef<NodeJS.Timeout>()
  const target = useRef<EventTarget>()

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener('touchend', preventDefault, {
          passive: false,
        })
        target.current = event.target
      }

      timeout.current = setTimeout(callback, delay)
    },
    [callback, delay, shouldPreventDefault]
  )

  const clear = useCallback(() => {
    timeout.current && clearTimeout(timeout.current)

    if (shouldPreventDefault && target.current) {
      target.current.removeEventListener('touchend', preventDefault)
    }
  }, [shouldPreventDefault])

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
  }
}

function preventDefault(event: Event) {
  if (!event.defaultPrevented) {
    event.preventDefault()
  }
}