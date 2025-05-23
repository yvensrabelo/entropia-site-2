'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface KnowledgeExplosionProps {
  onComplete: () => void
  maxParticles: number
}

export default function KnowledgeExplosion({ onComplete, maxParticles }: KnowledgeExplosionProps) {
  const subjects = ['FÍSICA', 'MATEMÁTICA', 'QUÍMICA', 'BIOLOGIA', '🧠', '📚', '🎓']
  const colors = ['#10b981', '#34d399', '#6ee7b7']

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[10000]">
        {Array.from({ length: Math.min(maxParticles, 30) }, (_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl font-bold"
            style={{
              left: '50%',
              top: '50%',
              color: colors[i % colors.length]
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: 1,
              opacity: 0,
              x: (Math.random() - 0.5) * 800,
              y: (Math.random() - 0.5) * 800,
              rotate: 360
            }}
            transition={{ duration: 3, ease: "easeOut" }}
            onAnimationComplete={() => i === 0 && onComplete()}
          >
            {subjects[i % subjects.length]}
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  )
}