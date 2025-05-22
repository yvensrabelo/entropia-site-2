'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  Menu, 
  X, 
  Sparkles, 
  Zap, 
  Calculator,
  Leaf,
  Lightbulb
} from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { href: '/calculadora', label: 'Calculadora', icon: Calculator }
  ];

  // Partículas flutuantes
  const particleVariants = {
    animate: {
      y: [-20, -60, -20],
      x: [-10, 10, -10],
      rotate: [0, 180, 360],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-gradient-to-r from-green-800/95 via-green-700/95 to-emerald-700/95 backdrop-blur-2xl shadow-2xl shadow-green-500/25' 
          : 'bg-gradient-to-r from-green-700/90 via-green-600/85 to-emerald-600/90 backdrop-blur-xl'
      }`}
    >
      {/* Efeitos de fundo animados */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Ondas de fundo */}
        <motion.div
          animate={{
            x: [-100, 100, -100],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full blur-xl"
        />
        
        <motion.div
          animate={{
            x: [100, -100, 100],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -top-2 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-lg"
        />

        {/* Partículas flutuantes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            variants={particleVariants}
            animate="animate"
            style={{
              left: `${15 + i * 15}%`,
              top: `${10 + (i % 2) * 20}px`,
            }}
            transition={{
              delay: i * 0.5,
              duration: 3 + i * 0.5,
              repeat: Infinity,
            }}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo com animações elaboradas */}
        <Link href="/">
          <motion.div 
            whileHover={{ scale: 1.1, rotateY: 10 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-white to-emerald-200 rounded-2xl blur-md opacity-20"
              />
              <div className="relative bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30 shadow-xl">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Leaf className="text-white" size={28} />
                </motion.div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <motion.span 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white font-extrabold text-2xl tracking-tight drop-shadow-lg group-hover:drop-shadow-2xl transition-all"
              >
                Entropia
              </motion.span>
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-green-100 text-xs font-medium tracking-wider uppercase"
              >
                Cursinho
              </motion.span>
            </div>
            
            {/* Sparkles animados */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-yellow-200"
            >
              <Sparkles size={16} />
            </motion.div>
          </motion.div>
        </Link>

        {/* Menu Desktop com efeitos visuais incríveis */}
        <div className="hidden md:flex items-center gap-2">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link key={index} href={item.href}>
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    y: -3,
                    rotateX: 5
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-emerald-200/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  
                  <div className="relative flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg group-hover:bg-white/25 group-hover:border-white/40 group-hover:shadow-xl transition-all duration-300">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <IconComponent size={18} className="text-white group-hover:text-green-50" />
                    </motion.div>
                    <span className="text-white font-medium text-sm group-hover:text-green-50 transition-colors">
                      {item.label}
                    </span>
                  </div>
                  
                  {/* Brilho hover */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-emerald-400/20 rounded-2xl blur-md -z-10"
                  />
                </motion.div>
              </Link>
            );
          })}
          
          {/* Botão Área do Aluno com visual especial */}
          <Link href="/login">
            <motion.div
              whileHover={{ 
                scale: 1.08, 
                y: -4,
                boxShadow: "0 20px 40px rgba(255,255,255,0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white to-green-100 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
              
              <div className="relative flex items-center gap-2 px-4 py-2.5 bg-white text-green-600 rounded-2xl font-bold shadow-xl border border-white/50 group-hover:bg-green-50 transition-all duration-300">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <User size={18} />
                </motion.div>
                <span>Área do Aluno</span>
                
                {/* Ícone de brilho */}
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-yellow-500"
                >
                  <Zap size={14} />
                </motion.div>
              </div>
            </motion.div>
          </Link>

          {/* Botão Admin com visual elite */}
          <Link href="/admin/login">
            <motion.div
              whileHover={{ 
                scale: 1.08, 
                y: -4,
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="relative ml-2 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
              
              <div className="relative flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-900 to-black text-green-400 rounded-2xl font-bold shadow-xl border border-green-500/30 group-hover:border-green-400/50 transition-all duration-300">
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Shield size={18} />
                </motion.div>
                <span>Admin</span>
                
                {/* Partículas admin */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-green-300"
                >
                  <Lightbulb size={14} />
                </motion.div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Botão Mobile com animação especial */}
        <div className="md:hidden">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9, rotate: -5 }}
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <X className="text-white" size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -180, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Menu className="text-white" size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Menu Mobile com animações elaboradas */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="md:hidden bg-gradient-to-b from-green-700/95 to-emerald-700/95 backdrop-blur-2xl border-t border-white/20 shadow-2xl"
          >
            <div className="px-6 py-6 space-y-3">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Link key={index} href={item.href}>
                    <motion.div
                      initial={{ opacity: 0, x: -50, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-emerald-200/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      
                      <div className="relative flex items-center gap-3 p-4 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg group-hover:bg-white/25 group-hover:border-white/40 transition-all duration-300">
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.5 }}
                          className="bg-white/20 p-2 rounded-xl"
                        >
                          <IconComponent size={20} className="text-white" />
                        </motion.div>
                        <span className="text-white font-medium">{item.label}</span>
                        
                        {/* Seta animada */}
                        <motion.div
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                          className="ml-auto text-white/60"
                        >
                          →
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
              
              {/* Botões especiais mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="pt-4 space-y-3"
              >
                {/* Área do Aluno Mobile */}
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-3 p-4 bg-white text-green-600 rounded-2xl font-bold shadow-xl"
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={20} />
                    <span>Área do Aluno</span>
                    <Sparkles size={16} className="text-yellow-500" />
                  </motion.div>
                </Link>
                
                {/* Admin Mobile */}
                <Link href="/admin/login">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-gray-900 to-black text-green-400 rounded-2xl font-bold shadow-xl border border-green-500/30"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield size={20} />
                    <span>Painel Admin</span>
                    <Zap size={16} className="text-green-300" />
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}