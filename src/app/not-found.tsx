'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Home, Search, ArrowLeft, BookOpen, Calculator, Phone } from 'lucide-react'

export default function NotFound() {
  const linksSugeridos = [
    { href: '/', label: 'Página Inicial', icon: Home },
    { href: '/calculadora', label: 'Calculadora', icon: Calculator },
    { href: '/materiais', label: 'Materiais', icon: BookOpen },
    { href: '/contato', label: 'Contato', icon: Phone },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Número 404 */}
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
            className="relative"
          >
            <h1 className="text-8xl md:text-9xl font-extrabold text-green-600 opacity-20">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="text-green-600 w-24 h-24" />
            </div>
          </motion.div>

          {/* Título e descrição */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Oops! Página não encontrada
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              A página que você está procurando pode ter sido movida, removida ou não existe. 
              Mas não se preocupe, vamos te ajudar a encontrar o que precisa!
            </p>
          </motion.div>

          {/* Links sugeridos */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-gray-800">
              Que tal visitar uma dessas páginas?
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {linksSugeridos.map((link, index) => {
                const Icon = link.icon
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-green-500 hover:shadow-lg transition-all group"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <Icon size={20} />
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                        {link.label}
                      </span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Botão principal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="space-y-4"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-2xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <ArrowLeft size={20} />
              Voltar ao início
            </Link>
            
            <p className="text-sm text-gray-500">
              Ou use a navegação acima para encontrar o que procura
            </p>
          </motion.div>

          {/* Informações extras */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="pt-8 border-t border-gray-200"
          >
            <p className="text-gray-600">
              Se você acredita que isso é um erro, entre em contato conosco via{' '}
              <a 
                href="https://wa.me/5592999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium underline"
              >
                WhatsApp
              </a>
              {' '}ou{' '}
              <Link 
                href="/contato" 
                className="text-green-600 hover:text-green-700 font-medium underline"
              >
                nossa página de contato
              </Link>
              .
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}