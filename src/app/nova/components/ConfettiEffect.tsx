'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiEffectProps {
  onComplete: () => void
  maxParticles: number
}

export default function ConfettiEffect({ onComplete, maxParticles }: ConfettiEffectProps) {
  const emojis = ['🎉', '🎊', '🎓', '📚', '🏆', '⭐']

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[10000]">
        {Array.from({ length: Math.min(maxParticles, 50) }, (_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-50px'
            }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800,
              rotate: 720,
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: 4,
              ease: "easeIn"
            }}
            onAnimationComplete={() => i === 0 && onComplete()}
          >
            {emojis[i % emojis.length]}
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  )
}