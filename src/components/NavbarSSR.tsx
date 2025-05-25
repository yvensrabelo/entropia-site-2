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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    // Verificar posição inicial
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 backdrop-blur-2xl shadow-2xl' 
            : 'bg-gradient-to-r from-green-700/90 via-green-600/85 to-emerald-600/90 backdrop-blur-xl'
        }`}
        role="navigation"
        aria-label="Menu principal"
      >
        <div className="relative max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link href="/" aria-label="Página inicial - Entropia Cursinho">
            <div className="flex items-center gap-3 cursor-pointer group">
              {/* Ícone com efeito glass */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white to-emerald-200 rounded-2xl blur-md opacity-20"></div>
                <div className="relative bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30 shadow-xl">
                  <Leaf className="text-white" size={28} />
                </div>
              </div>
              
              {/* Logo e texto */}
              <div className="flex flex-col">
                <span className="text-white font-black text-3xl tracking-tight drop-shadow-lg group-hover:drop-shadow-2xl transition-all bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                  ENTROPIA
                </span>
                <span className="text-green-200/40 text-[9px] font-light mt-0.5 hidden md:block">
                  v2025.05.22
                </span>
              </div>
              
              {/* Ícone decorativo */}
              <Sparkles size={16} className="text-yellow-200" />
            </div>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className="relative group"
                  tabIndex={0}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-emerald-200/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl border shadow-lg transition-all duration-300 ${
                    item.label === 'Admin' 
                      ? 'bg-transparent backdrop-blur-sm border-white/40 group-hover:bg-white/10 group-hover:border-white/60' 
                      : 'bg-white/15 backdrop-blur-sm border-white/20 group-hover:bg-white/25 group-hover:border-white/40'
                  } group-hover:shadow-xl`}>
                    <item.icon className="text-white group-hover:text-green-50" size={18} />
                    <span className="text-white font-medium text-sm group-hover:text-green-50 transition-colors">
                      {item.label}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg"
              tabIndex={0}
              aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute top-0 left-0 w-6 h-0.5 bg-white origin-center transition-all duration-300 ${
                    isOpen ? 'rotate-45 translate-y-[11px]' : ''
                  }`}
                />
                <span
                  className={`absolute top-[11px] left-0 w-6 h-0.5 bg-white transition-all duration-300 ${
                    isOpen ? 'opacity-0 -translate-x-5' : ''
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-0 w-6 h-0.5 bg-white origin-center transition-all duration-300 ${
                    isOpen ? '-rotate-45 -translate-y-[11px]' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

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
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-50 bg-gradient-to-b from-green-700 via-green-600 to-emerald-700 backdrop-blur-2xl shadow-2xl md:hidden"
          >
            {/* Header do drawer */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative bg-white/20 backdrop-blur-sm p-2.5 rounded-2xl border border-white/30">
                  <Leaf className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">ENTROPIA</h2>
                  <p className="text-green-200/60 text-xs">Menu Principal</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                aria-label="Fechar menu"
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            {/* Conteúdo do drawer */}
            <nav className="p-6 space-y-3">
              {menuItems.map((item, index) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className="flex items-center gap-4 px-4 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all group"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-base">{item.label}</span>
                      <p className="text-xs text-green-200/60 mt-0.5">
                        {item.label === 'Materiais' && 'Recursos de estudo'}
                        {item.label === 'Banco de Provas' && 'Provas anteriores'}
                        {item.label === 'Calculadora' && 'Calcule suas notas'}
                        {item.label === 'Admin' && 'Área administrativa'}
                      </p>
                    </div>
                    <div className="text-white/40">→</div>
                  </motion.div>
                </Link>
              ))}

              {/* Botão CTA */}
              <Link href="/matricula">
                <button
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all mt-6"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calendar size={20} />
                    <span>Matricule-se Agora</span>
                  </div>
                </button>
              </Link>
            </nav>

            {/* Footer do drawer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
              <div className="text-center text-green-200/40 text-xs">
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