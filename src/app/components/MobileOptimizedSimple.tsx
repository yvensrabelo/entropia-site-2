'use client'

import React, { useEffect, useState } from 'react'

interface MobileOptimizedSimpleProps {
  children: React.ReactNode
}

export default function MobileOptimizedSimple({ children }: MobileOptimizedSimpleProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <div 
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        touchAction: 'manipulation'
      }}
    >
      {children}
    </div>
  )
}