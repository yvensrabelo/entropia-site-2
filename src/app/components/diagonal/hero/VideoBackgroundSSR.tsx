'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface VideoBackgroundProps {
  videoSrc?: string
  className?: string
  showMuteButton?: boolean
  autoPlay?: boolean
}

export default function VideoBackgroundSSR({ 
  videoSrc = "/background.mp4",
  className = "",
  showMuteButton = true,
  autoPlay = true
}: VideoBackgroundProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  useEffect(() => {
    if (videoRef.current && autoPlay) {
      videoRef.current.play().catch(() => {
        console.log('Auto-play was blocked')
      })
    }
  }, [autoPlay])

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    
    if (videoRef.current) {
      videoRef.current.muted = newMutedState
    }
  }

  const handleLoadedData = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Sempre renderizar o vídeo */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover scale-110"
        autoPlay={false} // Desabilitar autoplay no HTML, controlar via JS
        loop
        muted
        playsInline
        onLoadedData={handleLoadedData}
        onError={handleError}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      
      {/* Fallback visual quando há erro */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
      )}
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Mute/Unmute Button - só renderizar no cliente */}
      {showMuteButton && isLoaded && !hasError && (
        <button
          onClick={toggleMute}
          className="absolute top-6 right-6 z-10 p-3 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm transition-all duration-200"
          aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      )}
    </div>
  )
}