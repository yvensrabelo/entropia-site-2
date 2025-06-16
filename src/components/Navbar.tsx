'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo com gradiente verde animado */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 animate-gradient-bg bg-[length:200%_auto]">
              Entropia
            </h1>
          </motion.div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Início
            </a>
            <a href="/banco-de-provas" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Banco de Provas
            </a>
            <a href="/calculadora" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Calculadora
            </a>
            <a href="/admin/dashboard" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Admin
            </a>
          </div>

          {/* Menu Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-green-600 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 space-y-2 bg-white/95 backdrop-blur-md rounded-lg mt-2 shadow-lg"
          >
            <a href="/" className="block py-3 px-4 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors rounded-md">
              Início
            </a>
            <a href="/banco-de-provas" className="block py-3 px-4 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors rounded-md">
              Banco de Provas
            </a>
            <a href="/calculadora" className="block py-3 px-4 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors rounded-md">
              Calculadora
            </a>
            <a href="/admin/dashboard" className="block py-3 px-4 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors rounded-md">
              Admin
            </a>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;