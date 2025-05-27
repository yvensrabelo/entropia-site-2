'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'

interface VideoBackgroundProps {
  desktopVideoSrc?: string
  mobileVideoSrc?: string
  className?: string
  showMuteButton?: boolean
  autoPlay?: boolean
  useHookDetection?: boolean // Toggle between CSS and hook-based detection
}

export default function VideoBackgroundSSR({ 
  desktopVideoSrc = "/videos/background-desktop.mp4",
  mobileVideoSrc = "/videos/background-mobile.mp4",
  className = "",
  showMuteButton = true,
  autoPlay = true,
  useHookDetection = false
}: VideoBackgroundProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const desktopVideoRef = useRef<HTMLVideoElement>(null)
  const mobileVideoRef = useRef<HTMLVideoElement>(null)
  const isMobile = useIsMobile(768)
  
  useEffect(() => {
    const currentVideoRef = useHookDetection 
      ? (isMobile ? mobileVideoRef.current : desktopVideoRef.current)
      : null

    if (currentVideoRef && autoPlay) {
      currentVideoRef.play().catch(() => {
        console.log('Auto-play was blocked')
      })
    }

    // For CSS-based detection, try both videos
    if (!useHookDetection && autoPlay) {
      if (desktopVideoRef.current) {
        desktopVideoRef.current.play().catch(() => {
          console.log('Desktop video auto-play was blocked')
        })
      }
      if (mobileVideoRef.current) {
        mobileVideoRef.current.play().catch(() => {
          console.log('Mobile video auto-play was blocked')
        })
      }
    }
  }, [autoPlay, isMobile, useHookDetection])

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    
    if (useHookDetection) {
      const currentVideoRef = isMobile ? mobileVideoRef.current : desktopVideoRef.current
      if (currentVideoRef) {
        currentVideoRef.muted = newMutedState
      }
    } else {
      // Update both videos for CSS-based detection
      if (desktopVideoRef.current) {
        desktopVideoRef.current.muted = newMutedState
      }
      if (mobileVideoRef.current) {
        mobileVideoRef.current.muted = newMutedState
      }
    }
  }

  const handleLoadedData = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
  }

  // Hook-based detection: render only the appropriate video
  if (useHookDetection) {
    const videoSrc = isMobile ? mobileVideoSrc : desktopVideoSrc
    const videoRef = isMobile ? mobileVideoRef : desktopVideoRef

    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover scale-110"
          autoPlay={false}
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

  // CSS-based detection: render both videos with responsive classes
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Desktop Video */}
      <video
        ref={desktopVideoRef}
        className="hidden md:block absolute inset-0 w-full h-full object-cover scale-110"
        autoPlay={false}
        loop
        muted
        playsInline
        onLoadedData={handleLoadedData}
        onError={handleError}
      >
        <source src={desktopVideoSrc} type="video/mp4" />
      </video>
      
      {/* Mobile Video */}
      <video
        ref={mobileVideoRef}
        className="block md:hidden absolute inset-0 w-full h-full object-cover scale-110"
        autoPlay={false}
        loop
        muted
        playsInline
        onLoadedData={handleLoadedData}
        onError={handleError}
      >
        <source src={mobileVideoSrc} type="video/mp4" />
      </video>
      
      {/* Fallback visual quando há erro */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
      )}
      
      {/* Dark overlay */}
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