'use client'

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  onComplete?: () => void;
};

export default function LandingIntroDark({ onComplete }: Props) {
  const [show, setShow] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentDot, setCurrentDot] = useState(0);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dotTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate dots
  useEffect(() => {
    if (!show || !mounted) return;
    
    dotTimerRef.current = setInterval(() => {
      setCurrentDot(prev => (prev + 1) % 6);
    }, 800);

    return () => {
      if (dotTimerRef.current) clearInterval(dotTimerRef.current);
    };
  }, [show, mounted]);

  // Auto close after 4 seconds
  useEffect(() => {
    if (!show || !mounted) return;
    
    closeTimerRef.current = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [show, mounted]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShow(false);
      setIsExiting(false);
      onComplete?.();
    }, 1200);
  };

  const handleReopen = () => {
    setCurrentDot(0);
    setIsExiting(false);
    setShow(true);
  };

  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            animate={isExiting ? {
              scale: 8,
              opacity: 0,
              filter: "blur(15px)"
            } : {
              scale: 1,
              opacity: 1,
              filter: "blur(0px)"
            }}
            transition={isExiting ? {
              duration: 1,
              ease: [0.4, 0, 0.6, 1]
            } : {}}
            style={{
              background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #0d0d0d 100%)',
            }}
          >
            {/* Noise texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,.01) 2px, rgba(255,255,255,.01) 4px)`
              }}
            />

            {/* Center light effect */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full pointer-events-none"
              initial={{ scale: 1, opacity: 0 }}
              animate={isExiting ? {
                scale: [1, 30, 100],
                opacity: [0, 0.8, 0]
              } : {
                scale: 1,
                opacity: 0
              }}
              transition={{
                duration: 1,
                ease: "easeOut"
              }}
              style={{
                background: 'radial-gradient(circle, #68a063, transparent)',
              }}
            />

            {/* Portal rings */}
            <motion.div 
              className="absolute inset-0 grid place-items-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: isExiting ? 1 : 0 }}
            >
              {[100, 200, 300].map((size, index) => (
                <motion.div
                  key={index}
                  className="absolute border-2 border-green-600 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isExiting ? {
                    scale: [0, 2.5],
                    opacity: [0, 0.5, 0]
                  } : {
                    scale: 0,
                    opacity: 0
                  }}
                  transition={{
                    duration: 1,
                    delay: index * 0.15,
                    ease: "easeOut"
                  }}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                  }}
                />
              ))}
            </motion.div>

            {/* Skip button */}
            <motion.button
              onClick={handleClose}
              className="absolute top-8 right-8 px-5 py-2 bg-transparent border border-white/10 text-gray-400 font-mono text-sm cursor-pointer transition-all hover:bg-white/5 hover:text-white hover:border-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              [SKIP]
            </motion.button>

            {/* Main container */}
            <div className="text-center relative z-10 p-8">
              {/* Brackets with icon */}
              <motion.div
                className="relative inline-block mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.span
                  className="absolute -left-[60px] top-1/2 -translate-y-1/2 text-7xl font-light text-green-600/20 font-mono"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 0.2, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {'{'}
                </motion.span>
                
                <motion.svg
                  className="w-[60px] h-[60px] text-green-600 mx-auto"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  initial={{ y: 0 }}
                  animate={{ y: [-10, 0, -10] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(104, 160, 99, 0.3))'
                  }}
                >
                  <rect x="4" y="2" width="16" height="20" rx="2"/>
                  <rect x="6" y="4" width="12" height="4" rx="1" fill="black" opacity="0.5"/>
                  <circle cx="8" cy="12" r="1" fill="black" opacity="0.5"/>
                  <circle cx="12" cy="12" r="1" fill="black" opacity="0.5"/>
                  <circle cx="16" cy="12" r="1" fill="black" opacity="0.5"/>
                  <circle cx="8" cy="16" r="1" fill="black" opacity="0.5"/>
                  <circle cx="12" cy="16" r="1" fill="black" opacity="0.5"/>
                  <circle cx="16" cy="16" r="1" fill="black" opacity="0.5"/>
                </motion.svg>

                <motion.span
                  className="absolute -right-[60px] top-1/2 -translate-y-1/2 text-7xl font-light text-green-600/20 font-mono"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 0.2, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {'}'}
                </motion.span>
              </motion.div>

              {/* Title with typewriter effect */}
              <div className="mt-12 mb-4">
                <h1 className="font-mono text-3xl font-light text-white tracking-tight">
                  <motion.div
                    className="overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: "auto" }}
                    transition={{ delay: 0.6, duration: 0.8, ease: "linear" }}
                  >
                    <span className="inline-block whitespace-nowrap typewriter-line1"
                      style={{
                        borderRight: '2px solid #68a063',
                        paddingRight: '2px'
                      }}
                    >
                      Calculadora
                    </span>
                  </motion.div>
                  <motion.div
                    className="overflow-hidden mt-2"
                    initial={{ width: 0 }}
                    animate={{ width: "auto" }}
                    transition={{ delay: 1.4, duration: 0.8, ease: "linear" }}
                  >
                    <span className="inline-block whitespace-nowrap typewriter-line2 text-green-600 font-semibold"
                      style={{
                        textShadow: '0 0 30px rgba(104, 160, 99, 0.5)',
                        borderRight: '2px solid #68a063',
                        paddingRight: '2px'
                      }}
                    >
                      ENTROPIA
                    </span>
                  </motion.div>
                </h1>
              </div>

              {/* Metadata */}
              <motion.div
                className="mt-12 pt-8 border-t border-gray-800/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
              >
                <span className="inline-flex items-center gap-2 mx-6 font-mono text-sm">
                  <span className="text-gray-600 text-xs uppercase tracking-wider">Author:</span>
                  <span className="text-white font-medium">Yvens Rabelo</span>
                </span>
                <span className="inline-flex items-center gap-2 mx-6 font-mono text-sm">
                  <span className="text-gray-600 text-xs uppercase tracking-wider">Version:</span>
                  <span className="text-white font-medium">2.0.0</span>
                </span>
              </motion.div>
            </div>

            {/* Progress dots */}
            <motion.div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <span
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentDot === index 
                      ? 'bg-green-600 shadow-[0_0_10px_rgba(104,160,99,0.5)]' 
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reopen button */}
      {!show && mounted && (
        <button
          onClick={handleReopen}
          className="fixed left-8 bottom-8 px-5 py-2.5 bg-[#1a1a1a] border border-green-600 text-green-600 font-mono font-medium cursor-pointer transition-all hover:bg-green-600 hover:text-[#0d0d0d] hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(104,160,99,0.3)]"
        >
          {'</>'} Reabrir
        </button>
      )}

      <style jsx>{`
        .typewriter-line1,
        .typewriter-line2 {
          animation: blink 0.8s step-end infinite;
        }

        @keyframes blink {
          0%, 50% { border-color: #68a063; }
          51%, 100% { border-color: transparent; }
        }
      `}</style>
    </>
  );
}