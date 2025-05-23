'use client'

import React, { useState, useRef } from 'react'
import { FileText, Video, Headphones, Download, Filter, BookOpen, Archive } from 'lucide-react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'

const materiais = [
  {
    id: 1,
    titulo: 'Física Quântica Aplicada',
    tipo: 'apostila',
    categoria: 'Exatas',
    paginas: 245,
    tamanho: '18 MB',
    downloads: 1543,
    preview: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
    cor: 'from-blue-500 to-indigo-600',
    height: 320
  },
  {
    id: 2,
    titulo: 'Redação ENEM 2025',
    tipo: 'video',
    categoria: 'Linguagens',
    duracao: '2h 30min',
    tamanho: '1.2 GB',
    downloads: 2890,
    preview: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
    cor: 'from-purple-500 to-pink-600',
    height: 280
  },
  {
    id: 3,
    titulo: 'História do Brasil Colonial',
    tipo: 'podcast',
    categoria: 'Humanas',
    episodios: 12,
    tamanho: '450 MB',
    downloads: 987,
    preview: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    cor: 'from-green-500 to-emerald-600',
    height: 350
  },
  {
    id: 4,
    titulo: 'Química Orgânica',
    tipo: 'simulado',
    categoria: 'Exatas',
    questoes: 180,
    tamanho: '25 MB',
    downloads: 3421,
    preview: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
    cor: 'from-orange-500 to-red-600',
    height: 300
  },
  {
    id: 5,
    titulo: 'Literatura Brasileira',
    tipo: 'apostila',
    categoria: 'Linguagens',
    paginas: 180,
    tamanho: '12 MB',
    downloads: 2100,
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    cor: 'from-rose-500 to-pink-600',
    height: 340
  },
  {
    id: 6,
    titulo: 'Matemática Básica',
    tipo: 'video',
    categoria: 'Exatas',
    duracao: '4h 15min',
    tamanho: '2.8 GB',
    downloads: 4521,
    preview: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400',
    cor: 'from-cyan-500 to-blue-600',
    height: 290
  },
  {
    id: 7,
    titulo: 'Geografia Política',
    tipo: 'podcast',
    categoria: 'Humanas',
    episodios: 8,
    tamanho: '320 MB',
    downloads: 1234,
    preview: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400',
    cor: 'from-teal-500 to-green-600',
    height: 310
  },
  {
    id: 8,
    titulo: 'Biologia Molecular',
    tipo: 'simulado',
    categoria: 'Biológicas',
    questoes: 200,
    tamanho: '30 MB',
    downloads: 2876,
    preview: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400',
    cor: 'from-emerald-500 to-green-600',
    height: 330
  }
]

const categorias = ['Todos', 'Exatas', 'Humanas', 'Linguagens', 'Biológicas']
const tipos = [
  { value: 'todos', label: 'Todos', icon: Archive },
  { value: 'apostila', label: 'Apostilas', icon: FileText },
  { value: 'video', label: 'Vídeos', icon: Video },
  { value: 'podcast', label: 'Podcasts', icon: Headphones },
  { value: 'simulado', label: 'Simulados', icon: BookOpen }
]

function MaterialCard({ material, index }: { material: any, index: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const rotateX = useTransform(y, [-100, 100], [5, -5])
  const rotateY = useTransform(x, [-100, 100], [-5, 5])
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const getIcon = () => {
    switch (material.tipo) {
      case 'apostila': return FileText
      case 'video': return Video
      case 'podcast': return Headphones
      case 'simulado': return BookOpen
      default: return FileText
    }
  }

  const Icon = getIcon()

  return (
    <motion.div
      ref={cardRef}
      className="relative group cursor-pointer"
      style={{
        height: material.height,
        transform: `rotate(${index % 2 === 0 ? '-2deg' : '2deg'})`
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="h-full relative overflow-hidden rounded-2xl"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          perspective: 1000
        }}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={material.preview}
            alt={material.titulo}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${material.cor} opacity-80`} />
        </div>

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col justify-between text-white">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Icon className="w-6 h-6" />
              </div>
              <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                {material.categoria}
              </span>
            </div>
            
            <h3 className="text-2xl font-bold mb-2">{material.titulo}</h3>
            
            <div className="space-y-1 text-sm text-white/80">
              {material.paginas && <p>{material.paginas} páginas</p>}
              {material.duracao && <p>{material.duracao}</p>}
              {material.episodios && <p>{material.episodios} episódios</p>}
              {material.questoes && <p>{material.questoes} questões</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>{material.tamanho}</span>
              <span>{material.downloads} downloads</span>
            </div>
            
            <motion.button
              className="w-full bg-white/20 backdrop-blur-sm py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              Baixar Material
            </motion.button>
          </div>
        </div>

        {/* Animated Preview on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center p-6"
              >
                <Icon className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <p className="text-white text-lg font-semibold mb-2">Prévia Disponível</p>
                <p className="text-gray-300 text-sm">Clique para visualizar</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

function LiquidFilter({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative px-6 py-2 rounded-full font-medium transition-colors ${
        isActive ? 'text-white' : 'text-gray-400 hover:text-white'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full -z-10"
          layoutId="activeFilter"
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 30
          }}
        />
      )}
    </motion.button>
  )
}

export default function MateriaisSection() {
  const [selectedCategoria, setSelectedCategoria] = useState('Todos')
  const [selectedTipo, setSelectedTipo] = useState('todos')
  const [showFilters, setShowFilters] = useState(false)

  const filteredMateriais = materiais.filter(material => {
    const categoriaMatch = selectedCategoria === 'Todos' || material.categoria === selectedCategoria
    const tipoMatch = selectedTipo === 'todos' || material.tipo === selectedTipo
    return categoriaMatch && tipoMatch
  })

  return (
    <section id="materiais" className="relative py-20 bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-emerald-900/20"></div>
      
      <div className="relative z-10 container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-5xl md:text-7xl font-black mb-4">
            Biblioteca <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Digital</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore nossa coleção de materiais em layout diagonal interativo
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 mb-8"
              >
                {/* Category Filters */}
                <div className="flex flex-wrap justify-center gap-2">
                  {categorias.map(categoria => (
                    <LiquidFilter
                      key={categoria}
                      isActive={selectedCategoria === categoria}
                      onClick={() => setSelectedCategoria(categoria)}
                    >
                      {categoria}
                    </LiquidFilter>
                  ))}
                </div>

                {/* Type Filters */}
                <div className="flex flex-wrap justify-center gap-2">
                  {tipos.map(tipo => {
                    const Icon = tipo.icon
                    return (
                      <LiquidFilter
                        key={tipo.value}
                        isActive={selectedTipo === tipo.value}
                        onClick={() => setSelectedTipo(tipo.value)}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {tipo.label}
                        </span>
                      </LiquidFilter>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredMateriais.map((material, index) => (
            <MaterialCard key={material.id} material={material} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-400 mb-6">
            Mais de 10.000 materiais disponíveis para alunos matriculados
          </p>
          <motion.button 
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Acessar Portal Completo
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}