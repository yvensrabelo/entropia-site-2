'use client'

import React, { useRef, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

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
  const {
    videoRef,
    isMuted,
    isLoaded,
    hasError,
    toggleMute
  } = useVideo({
    autoPlay,
    loop: true,
    muted: true,
    persistMuteState: true,
    onLoadedData: () => console.log('Video loaded successfully'),
    onError: () => console.error('Video failed to load')
  })

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