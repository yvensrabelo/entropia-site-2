'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Zap, BookOpen, Sparkles, School } from 'lucide-react';
import { cn } from '@/lib/utils';

const TestHero = () => {
  return (
    <section className={cn(
      "relative text-center py-20 md:py-28 min-h-[100vh] flex flex-col justify-center items-center overflow-hidden",
      "hero-background pt-24"
    )}>
      {/* Triângulo decorativo no rodapé */}
      <div 
        className="absolute bottom-0 left-0 w-full h-20 md:h-32 bg-gradient-to-br from-gray-900 via-gray-50 to-gray-900"
        style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
      />
      
      {/* Fundo com imagem e overlay */}
      <div className="absolute inset-0 -z-20">
        <img  
          className="absolute inset-0 w-full h-full object-cover opacity-20" 
          alt="Estudantes colaborando em um ambiente de estudo moderno e inspirador"
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f" 
        />
        <div className="absolute inset-0 hero-overlay"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 p-4 md:p-0 container mx-auto"
      >
        {/* Badge de destaque */}
        <motion.div 
          className="inline-block px-4 py-2 mb-8 bg-green-100 border border-green-300 rounded-full text-sm text-green-600 font-medium backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          <Sparkles className="inline-block mr-2 h-4 w-4" />
          2º lugar em aprovações Medicina UFAM
        </motion.div>

        {/* Título com gradiente animado */}
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 animate-gradient-bg bg-[length:200%_auto]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Estude conosco
        </motion.h1>

        {/* Subtítulo */}
        <motion.p 
          className="text-base sm:text-lg md:text-xl text-gray-600 max-w-lg md:max-w-xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Conheça nossos materiais e ferramentas gratuitas para turbinar sua preparação!
        </motion.p>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 150 }}
            whileHover={{ scale: 1.05, y: -2 }} 
            whileTap={{ scale: 0.95 }} 
            className="w-full sm:w-auto"
          >
            <Button 
              size="lg" 
              className="w-full sm:w-auto hero-button-primary text-white transition-all duration-300 px-6 sm:px-8 py-3 sm:py-6 text-sm sm:text-base"
              onClick={() => {
                const turmasSection = document.querySelector('.turmas-section');
                turmasSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <School className="mr-2 h-4 sm:h-5 w-4 sm:w-5" /> 
              Nossas Turmas
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 150 }}
            whileHover={{ scale: 1.05, y: -2 }} 
            whileTap={{ scale: 0.95 }} 
            className="w-full sm:w-auto"
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto hero-button-outline-green transition-all duration-300 px-6 sm:px-8 py-3 sm:py-6 text-sm sm:text-base"
              onClick={() => window.location.href = '/banco-de-provas'}
            >
              <BookOpen className="mr-2 h-4 sm:h-5 w-4 sm:w-5" /> 
              Banco de Provas
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 150 }}
            whileHover={{ scale: 1.05, y: -2 }} 
            whileTap={{ scale: 0.95 }} 
            className="w-full sm:w-auto"
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto hero-button-outline-cyan transition-all duration-300 px-6 sm:px-8 py-3 sm:py-6 text-sm sm:text-base"
              onClick={() => window.location.href = '/calculadora'}
            >
              <Zap className="mr-2 h-4 sm:h-5 w-4 sm:w-5" /> 
              Calculadora de Notas
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default TestHero;