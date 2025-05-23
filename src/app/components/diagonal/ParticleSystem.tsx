'use client'

import React, { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'

interface ParticleProps {
  index: number
  mouseX: any
  mouseY: any
}

function Particle({ index, mouseX, mouseY }: ParticleProps) {
  const [windowSize, setWindowSize] = useState({ width: 1000, height: 800 })
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      }
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const position = React.useMemo(() => ({
    x: (index * 137 + 100) % windowSize.width,
    y: (index * 211 + 100) % windowSize.height,
  }), [index, windowSize])

  const particleX = useMotionValue(position.x)
  const particleY = useMotionValue(position.y)

  const springConfig = { damping: 50, stiffness: 150 }
  
  const distanceX = useTransform(mouseX, (val: number) => val - particleX.get())
  const distanceY = useTransform(mouseY, (val: number) => val - particleY.get())
  
  const distance = useTransform([distanceX, distanceY], ([dx, dy]: number[]) => 
    Math.sqrt(dx * dx + dy * dy)
  )
  
  const springX = useSpring(distanceX, springConfig)
  const springY = useSpring(distanceY, springConfig)
  
  const scale = useTransform(distance, [0, 300], [2, 0.8])
  const opacity = useTransform(distance, [0, 300], [1, 0.4])

  useEffect(() => {
    const unsubscribeX = springX.on('change', (val) => {
      if (Math.abs(val) < 200) {
        particleX.set(particleX.get() + val * 0.01)
      }
    })
    
    const unsubscribeY = springY.on('change', (val) => {
      if (Math.abs(val) < 200) {
        particleY.set(particleY.get() + val * 0.01)
      }
    })

    return () => {
      unsubscribeX()
      unsubscribeY()
    }
  }, [springX, springY, particleX, particleY])

  const size = 6 + (index % 4) * 3
  const delay = index * 0.05
  const duration = 15 + (index % 3) * 10

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: particleX,
        top: particleY,
        width: size,
        height: size,
        scale,
        opacity,
        pointerEvents: 'none',
      }}
      animate={{
        x: [0, 30, -30, 0],
        y: [0, -30, 30, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      <div 
        className="w-full h-full rounded-full bg-green-500"
        style={{
          background: `radial-gradient(circle, ${
            ['#10b981', '#34d399', '#6ee7b7', '#86efac'][index % 4]
          } 0%, ${
            ['#10b981', '#34d399', '#6ee7b7', '#86efac'][index % 4]
          }80 50%, transparent 70%)`,
          boxShadow: `0 0 ${size * 3}px ${
            ['#10b981', '#34d399', '#6ee7b7', '#86efac'][index % 4]
          }, 0 0 ${size * 6}px ${
            ['#10b981', '#34d399', '#6ee7b7', '#86efac'][index % 4]
          }60`,
        }}
      />
    </motion.div>
  )
}

export default function ParticleSystem() {
  const [isClient, setIsClient] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    setIsClient(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  if (!isClient) return null

  const particleCount = 30

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: particleCount }).map((_, index) => (
        <Particle
          key={index}
          index={index}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      ))}
      
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: mouseX,
          top: mouseY,
          width: 120,
          height: 120,
          x: -60,
          y: -60,
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, #10b98120 0%, transparent 60%)',
            filter: 'blur(30px)',
          }}
        />
      </motion.div>
      
    </div>
  )
}