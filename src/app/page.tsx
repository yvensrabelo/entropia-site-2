'use client';

import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900">
          Em breve
        </h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Estamos preparando algo incrível para você.
        </p>
      </motion.div>
    </div>
  );
}