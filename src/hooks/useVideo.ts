'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

interface UseVideoOptions {
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  persistMuteState?: boolean
  onLoadedData?: () => void
  onError?: () => void
}

interface UseVideoReturn {
  videoRef: React.RefObject<HTMLVideoElement>
  isPlaying: boolean
  isMuted: boolean
  isLoaded: boolean
  hasError: boolean
  currentTime: number
  duration: number
  volume: number
  play: () => Promise<void>
  pause: () => void
  togglePlay: () => void
  toggleMute: () => void
  setVolume: (volume: number) => void
  seek: (time: number) => void
  restart: () => void
}

export function useVideo({
  autoPlay = true,
  loop = true,
  muted = true,
  persistMuteState = true,
  onLoadedData,
  onError
}: UseVideoOptions = {}): UseVideoReturn {
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Use localStorage to persist mute state if enabled
  const [storedMuted, setStoredMuted] = useLocalStorage(
    'video-muted-state',
    muted
  )
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(persistMuteState ? storedMuted : muted)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)

  // Play video
  const play = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.warn('Video play failed:', error)
        setHasError(true)
      }
    }
  }, [])

  // Pause video
  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    
    if (videoRef.current) {
      videoRef.current.muted = newMutedState
    }
    
    if (persistMuteState) {
      setStoredMuted(newMutedState)
    }
  }, [isMuted, persistMuteState, setStoredMuted])

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clampedVolume)
    
    if (videoRef.current) {
      videoRef.current.volume = clampedVolume
    }
  }, [])

  // Seek to specific time
  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, time))
    }
  }, [duration])

  // Restart video
  const restart = useCallback(() => {
    seek(0)
    if (!isPlaying) {
      play()
    }
  }, [isPlaying, play, seek])

  // Setup video element when component mounts
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Event handlers
    const handleLoadedData = () => {
      setIsLoaded(true)
      setDuration(video.duration)
      onLoadedData?.()
    }

    const handleError = () => {
      setHasError(true)
      onError?.()
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleVolumeChange = () => {
      setVolumeState(video.volume)
      setIsMuted(video.muted)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    // Add event listeners
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('volumechange', handleVolumeChange)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    // Set initial properties
    video.loop = loop
    video.muted = isMuted
    video.volume = volume

    // Auto-play if enabled
    if (autoPlay && isLoaded) {
      play()
    }

    // Cleanup
    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('volumechange', handleVolumeChange)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [autoPlay, loop, isMuted, volume, isLoaded, play, onLoadedData, onError])

  return {
    videoRef,
    isPlaying,
    isMuted,
    isLoaded,
    hasError,
    currentTime,
    duration,
    volume,
    play,
    pause,
    togglePlay,
    toggleMute,
    setVolume,
    seek,
    restart
  }
}

export default useVideo