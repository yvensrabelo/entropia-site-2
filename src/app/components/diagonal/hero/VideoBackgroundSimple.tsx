'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface VideoBackgroundProps {
  videoSrc?: string
  className?: string
  showMuteButton?: boolean
  autoPlay?: boolean
}

export default function VideoBackgroundSimple({ 
  videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  className = "",
  showMuteButton = true,
  autoPlay = true
}: VideoBackgroundProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (videoRef.current && isLoaded && autoPlay) {
      videoRef.current.play().catch(() => {
        console.log('Auto-play was blocked')
      })
    }
  }, [isLoaded, autoPlay])

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    
    if (videoRef.current) {
      videoRef.current.muted = newMutedState
    }
  }

  const handleLoadedData = () => {
    setIsLoaded(true)
    console.log('Video loaded successfully')
  }

  const handleError = () => {
    setHasError(true)
    console.error('Video failed to load')
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {!hasError ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover scale-110"
          autoPlay={mounted ? autoPlay : false}
          loop
          muted={isMuted}
          playsInline
          onLoadedData={handleLoadedData}
          onError={handleError}
          style={{ display: mounted ? 'block' : 'none' }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        /* Fallback para quando o vídeo falha */
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
      )}
      
      {/* Dark overlay for video */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Placeholder overlay quando não está montado */}
      {!mounted && (
        <div className="absolute inset-0 bg-black" />
      )}
      
      {/* Mute/Unmute Button */}
      {showMuteButton && isLoaded && !hasError && mounted && (
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