'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface VideoBackgroundProps {
  videoSrc?: string
  className?: string
  showMuteButton?: boolean
  autoPlay?: boolean
}

export default function VideoBackground({ 
  videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  className = "",
  showMuteButton = true,
  autoPlay = true
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMutedState = !isMuted
      videoRef.current.muted = newMutedState
      setIsMuted(newMutedState)
    }
  }, [isMuted])
  
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    const handleLoadedData = () => {
      setIsLoaded(true)
      console.log('Video loaded successfully')
    }
    
    const handleError = () => {
      setHasError(true)
      console.error('Video failed to load')
    }
    
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)
    
    // Set initial properties
    video.loop = true
    video.muted = isMuted
    
    // Try to play if autoPlay is enabled
    if (autoPlay) {
      video.play().catch(err => {
        console.warn('Autoplay failed:', err)
      })
    }
    
    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
    }
  }, [autoPlay, isMuted])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {!hasError ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover scale-110"
          playsInline
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        /* Fallback para quando o vídeo falha */
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
      )}
      
      {/* Dark overlay for video */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Mute/Unmute Button */}
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