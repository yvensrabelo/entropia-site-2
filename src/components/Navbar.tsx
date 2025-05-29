'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Calculator,
  Leaf,
  BookOpen,
  Info,
  Calendar,
  Mail,
  Lock
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check initial scroll position after mount
    if (window.scrollY > 20) {
      setScrolled(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
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
  }, [mounted]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    { href: '/materiais', label: 'Materiais', icon: BookOpen },
    { href: '/banco-de-provas', label: 'Banco de Provas', icon: BookOpen },
    { href: '/calculadora', label: 'Calculadora', icon: Calculator },
    { href: '/admin/login', label: 'Admin', icon: Lock }
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
      <nav className="fixed top-0 w-full z-50 bg-white shadow-md">
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
            ? 'bg-white shadow-lg' 
            : 'bg-white shadow-md'
        }`}
        role="navigation"
        aria-label="Menu principal"
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
          <Link href="/" aria-label="Página inicial - Entropia Cursinho">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Ícone com efeito glass */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-md opacity-20"></div>
                <div className="relative bg-green-500/10 backdrop-blur-sm p-3 rounded-2xl border border-green-500/30 shadow-xl">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Leaf className="text-green-600" size={28} />
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
                  <span className="text-gray-800 font-black text-3xl tracking-tight drop-shadow-sm group-hover:drop-shadow-md transition-all">
                    ENTROPIA
                  </span>
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-green-500 to-transparent"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  />
                </motion.div>
                <motion.span 
                  className="text-gray-400 text-[9px] font-light mt-0.5 hidden md:block"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  v2025.05.22
                </motion.span>
              </div>
              
              {/* Ícone decorativo */}
              <motion.div
                className="text-yellow-500"
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
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl border shadow-md transition-all duration-300 ${
                    item.label === 'Admin' 
                      ? 'bg-gray-50 border-gray-200 group-hover:bg-green-50 group-hover:border-green-300' 
                      : 'bg-white border-gray-200 group-hover:bg-green-50 group-hover:border-green-300'
                  } group-hover:shadow-lg`}>
                    <item.icon className="text-gray-600 group-hover:text-green-600" size={18} />
                    <span className="text-gray-700 font-medium text-sm group-hover:text-green-700 transition-colors">
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
              className="relative p-3 bg-gray-100 rounded-2xl border border-gray-300 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              tabIndex={0}
              aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <div className="relative w-6 h-6">
                <motion.span
                  className="absolute top-0 left-0 w-6 h-0.5 bg-gray-700 origin-center"
                  animate={{
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 11 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
                <motion.span
                  className="absolute top-[11px] left-0 w-6 h-0.5 bg-gray-700"
                  animate={{
                    opacity: isOpen ? 0 : 1,
                    x: isOpen ? -20 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
                <motion.span
                  className="absolute bottom-0 left-0 w-6 h-0.5 bg-gray-700 origin-center"
                  animate={{
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? -11 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              </div>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Backdrop com blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer lateral animado */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-50 bg-white shadow-2xl md:hidden"
          >
            {/* Header do drawer */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative bg-green-100 p-2.5 rounded-2xl border border-green-300">
                  <Leaf className="text-green-600" size={24} />
                </div>
                <div>
                  <h2 className="text-gray-800 font-bold text-xl">ENTROPIA</h2>
                  <p className="text-gray-500 text-xs">Menu Principal</p>
                </div>
              </div>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Fechar menu"
              >
                <X className="text-gray-700" size={24} />
              </motion.button>
            </div>

            {/* Conteúdo do drawer */}
            <nav className="p-6 space-y-3">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link href={item.href}>
                    <motion.div
                      className="flex items-center gap-4 px-4 py-4 bg-gray-50 rounded-2xl border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-300 transition-all group"
                      whileHover={{ x: 10 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="p-2 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
                        <item.icon className="text-green-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-base">{item.label}</span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.label === 'Materiais' && 'Recursos de estudo'}
                          {item.label === 'Banco de Provas' && 'Provas anteriores'}
                          {item.label === 'Calculadora' && 'Calcule suas notas'}
                          {item.label === 'Admin' && 'Área administrativa'}
                        </p>
                      </div>
                      <motion.div
                        className="text-gray-400"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        →
                      </motion.div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}

              {/* Botão CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="pt-6"
              >
                <Link href="/matricula">
                  <motion.button
                    className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Calendar size={20} />
                      <span>Matricule-se Agora</span>
                    </div>
                  </motion.button>
                </Link>
              </motion.div>
            </nav>

            {/* Footer do drawer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
              <div className="text-center text-gray-400 text-xs">
                <p>© 2025 Entropia Cursinho</p>
                <p className="mt-1">Transformando vidas através da educação</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(Navbar);