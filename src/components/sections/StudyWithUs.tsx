'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { BookOpen, Sparkles, School, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

const StudyWithUs = () => {
  return (
    <section className={cn(
      "relative text-center py-20 md:py-28 flex flex-col justify-center items-center overflow-hidden",
      "study-with-us-section" 
    )}>
      <div className="relative z-10 p-4 md:p-0 container mx-auto">
        <motion.div 
          className="inline-block px-4 py-2 mb-8 bg-green-100 border border-green-300 rounded-full text-sm text-green-600 font-medium study-badge"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          <Sparkles className="inline-block mr-2 h-4 w-4" />
          2� lugar em aprova��es Medicina UFAM
        </motion.div>

        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 text-green-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Estude conosco
        </motion.h1>

        <motion.p 
          className="text-base sm:text-lg md:text-xl text-gray-600 max-w-lg md:max-w-xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Conhe�a nossos materiais e ferramentas gratuitas para turbinar sua prepara��o!
        </motion.p>

        <div className="flex flex-col justify-center items-center gap-4 max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 150 }}
            whileHover={{ scale: 1.05, y: -2 }} 
            whileTap={{ scale: 0.95 }} 
            className="w-full"
          >
            <Button 
              size="lg" 
              className="w-full study-button-primary text-white transition-all duration-300 px-8 py-6 text-base"
              onClick={() => {
                const turmasSection = document.querySelector('.turmas-section');
                turmasSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <School className="mr-2 h-5 w-5" /> 
              Nossas Turmas
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 150 }}
            whileHover={{ scale: 1.05, y: -2 }} 
            whileTap={{ scale: 0.95 }} 
            className="w-full"
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full study-button-outline text-green-700 transition-all duration-300 px-8 py-6 text-base"
              onClick={() => window.location.href = '/banco-de-provas'}
            >
              <BookOpen className="mr-2 h-5 w-5" /> 
              Banco de Provas
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 150 }}
            whileHover={{ scale: 1.05, y: -2 }} 
            whileTap={{ scale: 0.95 }} 
            className="w-full"
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full study-button-outline text-green-700 transition-all duration-300 px-8 py-6 text-base"
              onClick={() => window.location.href = '/calculadora'}
            >
              <Calculator className="mr-2 h-5 w-5" /> 
              Calculadora de Notas
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StudyWithUs;