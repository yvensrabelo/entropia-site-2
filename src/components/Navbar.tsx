'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Sparkles, 
  Calculator,
  Leaf,
  BookOpen,
  Info,
  Calendar,
  Mail
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { href: '/sobre', label: 'Sobre', icon: Info },
    { href: '/materiais', label: 'Materiais', icon: BookOpen },
    { href: '/calculadora', label: 'Calculadora', icon: Calculator },
    { href: '/contato', label: 'Contato', icon: Mail }
  ];

  // Partículas flutuantes simplificadas
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

  if (!mounted) {
    return (
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="h-12"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 backdrop-blur-2xl shadow-2xl' 
            : 'bg-gradient-to-r from-green-700/90 via-green-600/85 to-emerald-600/90 backdrop-blur-xl'
        }`}
      >
        {/* Efeitos de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full blur-xl"
            animate={{ 
              x: [0, 20, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: '15px'
              }}
              variants={particleVariants}
              animate="animate"
              initial={{ y: -20 }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link href="/">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              tabIndex={0}
            >
              {/* Ícone com efeito glass */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white to-emerald-200 rounded-2xl blur-md opacity-20"></div>
                <div className="relative bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30 shadow-xl">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Leaf className="text-white" size={28} />
                  </motion.div>
                </div>
              </div>
              
              {/* Logo e texto */}
              <div className="flex flex-col">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <span className="text-white font-black text-3xl tracking-tight drop-shadow-lg group-hover:drop-shadow-2xl transition-all bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    ENTROPIA
                  </span>
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-green-300 to-transparent"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  />
                </motion.div>
                <motion.span 
                  className="text-green-200/40 text-[9px] font-light mt-0.5 hidden md:block"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  v2025.05.22
                </motion.span>
              </div>
              
              {/* Ícone decorativo */}
              <motion.div
                className="text-yellow-200"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles size={16} />
              </motion.div>
            </motion.div>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((item, index) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  tabIndex={0}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-emerald-200/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="relative flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg group-hover:bg-white/25 group-hover:border-white/40 group-hover:shadow-xl transition-all duration-300">
                    <item.icon className="text-white group-hover:text-green-50" size={18} />
                    <span className="text-white font-medium text-sm group-hover:text-green-50 transition-colors">
                      {item.label}
                    </span>
                  </div>
                  
                  {/* Efeito de brilho ao hover */}
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-emerald-400/20 rounded-2xl blur-md -z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              tabIndex={0}
            >
              <motion.div
                initial={{ opacity: 0, rotate: 180 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isOpen ? <X className="text-white" size={24} /> : <Menu className="text-white" size={24} />}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Menu Mobile Expandido */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-b from-green-700 to-green-800 backdrop-blur-xl shadow-2xl md:hidden"
          >
            <div className="px-6 py-4 space-y-3">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all"
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(Navbar);