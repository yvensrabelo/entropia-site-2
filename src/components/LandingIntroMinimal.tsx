'use client'

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  onComplete?: () => void;
};

export default function LandingIntroMinimal({ onComplete }: Props) {
  const [show, setShow] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Check localStorage after mount
  useEffect(() => {
    setMounted(true);
    const introSeen = localStorage.getItem("intro_minimal_seen") === "1";
    if (introSeen) {
      setShow(false);
      onComplete?.();
    }
  }, [onComplete]);

  // Auto-hide after animation
  useEffect(() => {
    if (!show || !mounted) return;
    const timer = setTimeout(() => {
      finish();
    }, 3500);
    return () => clearTimeout(timer);
  }, [show, mounted]);

  function finish() {
    try {
      localStorage.setItem("intro_minimal_seen", "1");
    } catch {}
    setShow(false);
    onComplete?.();
  }

  // Avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="relative flex flex-col items-center justify-center px-4">
            {/* Main Icon - Simple and Clean */}
            <motion.div
              className="mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.6,
                ease: [0.21, 1.11, 0.81, 0.99]
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600"
              >
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <rect x="8" y="6" width="8" height="4" />
                <path d="M8 14h2" />
                <path d="M14 14h2" />
                <path d="M8 18h2" />
                <path d="M14 18h2" />
              </svg>
            </motion.div>

            {/* Title - Clean Typography */}
            <motion.h1
              className="text-4xl md:text-5xl font-light text-gray-900 mb-2 tracking-tight"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Calculadora
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg text-gray-500 mb-12 font-light"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              PSC • MACRO • SIS • ENEM
            </motion.p>

            {/* Developer Credit - Minimal and Elegant */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                Desenvolvido por
              </p>
              <h2 className="text-2xl font-light text-gray-900 tracking-wide">
                Yvens Rabelo
              </h2>
            </motion.div>

            {/* Loading Bar - Subtle Progress Indicator */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                className="h-full bg-green-600"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: 2.5,
                  delay: 1,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Skip Button - Minimal */}
            <motion.button
              onClick={finish}
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Pular
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}