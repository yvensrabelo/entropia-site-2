'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface MatrixEffectProps {
  maxParticles: number
}

export default function MatrixEffect({ maxParticles }: MatrixEffectProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] bg-black/50">
      {Array.from({ length: maxParticles }, (_, i) => (
        <motion.div
          key={i}
          className="absolute text-green-400 font-mono"
          style={{
            left: `${(i * 2) % 100}%`,
            fontSize: '14px'
          }}
          animate={{
            y: [0, typeof window !== 'undefined' ? window.innerHeight + 50 : 800],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "linear"
          }}
        >
          {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
        </motion.div>
      ))}
    </div>
  )
}