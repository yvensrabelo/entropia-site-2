'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'

interface DiagonalDividerProps {
  position: 'top' | 'bottom'
  color?: string
  height?: number
  molecularBreak?: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  color: string
}

export default function DiagonalDivider({ 
  position = 'top', 
  color = '#f3f4f6',
  height = 120,
  molecularBreak = true
}: DiagonalDividerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>(0)
  const waveOffset = useMotionValue(0)
  
  useEffect(() => {
    const controls = animate(waveOffset, [0, 100], {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    })
    
    return () => controls.stop()
  }, [waveOffset])

  useEffect(() => {
    if (!molecularBreak) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = height
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const createParticle = (x: number, y: number) => {
      const colors = ['#10b981', '#34d399', '#6ee7b7', '#86efac', '#d1fae5']
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 1,
        size: Math.random() * 3 + 1,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create particles along the diagonal edge
      if (Math.random() < 0.3) {
        const x = Math.random() * canvas.width
        const y = position === 'top' 
          ? (Math.sin(x / 100 + Date.now() / 1000) * 20 + height / 2)
          : canvas.height - (Math.sin(x / 100 + Date.now() / 1000) * 20 + height / 2)
        createParticle(x, y)
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.05 // gravity
        particle.life -= 0.02

        if (particle.life <= 0) return false

        ctx.save()
        ctx.globalAlpha = particle.life * 0.8
        ctx.fillStyle = particle.color
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        return particle.life > 0
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [position, height, molecularBreak])

  const pathVariants = {
    animate: {
      d: position === 'top' 
        ? [
          "M0,0 L0,60 Q300,100 600,80 T1200,60 L1200,0 Z",
          "M0,0 L0,80 Q300,40 600,60 T1200,80 L1200,0 Z",
          "M0,0 L0,60 Q300,100 600,80 T1200,60 L1200,0 Z"
        ]
        : [
          "M0,60 Q300,20 600,40 T1200,60 L1200,120 L0,120 Z",
          "M0,40 Q300,80 600,60 T1200,40 L1200,120 L0,120 Z",
          "M0,60 Q300,20 600,40 T1200,60 L1200,120 L0,120 Z"
        ]
    }
  }

  return (
    <div 
      className={`absolute ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 overflow-hidden pointer-events-none`} 
      style={{ height: `${height}px` }}
    >
      {/* Main diagonal shape with wave animation */}
      <motion.svg
        className="absolute w-full h-full"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{ 
          height: `${height}px`,
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
        }}
      >
        <motion.path
          fill={color}
          initial={{ 
            d: position === 'top' 
              ? "M0,0 L0,60 Q300,100 600,80 T1200,60 L1200,0 Z"
              : "M0,60 Q300,20 600,40 T1200,60 L1200,120 L0,120 Z"
          }}
          animate="animate"
          variants={pathVariants}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Gradient overlay for depth */}
        <defs>
          <linearGradient id="dividerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* Molecular break lines */}
        {molecularBreak && Array.from({ length: 5 }).map((_, i) => (
          <motion.line
            key={i}
            x1={240 * i}
            y1={position === 'top' ? 0 : 120}
            x2={240 * i + 120}
            y2={position === 'top' ? 80 : 40}
            stroke="#10b981"
            strokeWidth="0.5"
            opacity="0.3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.svg>

      {/* Molecular particles canvas */}
      {molecularBreak && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.8 }}
        />
      )}

      {/* Glowing edge effect */}
      <div 
        className={`absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-50 ${
          position === 'top' ? 'bottom-0' : 'top-0'
        }`}
        style={{
          boxShadow: '0 0 20px #10b981'
        }}
      />
    </div>
  )
}