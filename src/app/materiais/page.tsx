'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Download, 
  FileText, 
  Video, 
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Play,
  Eye,
  Calendar,
  Award
} from 'lucide-react'

export default function MateriaisPage() {
  const [filtroAtivo, setFiltroAtivo] = useState('todos')
  const [busca, setBusca] = useState('')

  const categorias = [
    { id: 'todos', label: 'Todos', icon: BookOpen },
    { id: 'apostilas', label: 'Apostilas', icon: FileText },
    { id: 'exercicios', label: 'Exercícios', icon: Award },
    { id: 'simulados', label: 'Simulados', icon: Clock },
    { id: 'videos', label: 'Videoaulas', icon: Video },
  ]

  const materiais = [
    {
      id: 1,
      titulo: 'Apostila de Matemática - Funções',
      categoria: 'apostilas',
      disciplina: 'Matemática',
      descricao: 'Material completo sobre funções do 1º e 2º grau, logarítmicas e exponenciais.',
      tamanho: '2.5 MB',
      paginas: 45,
      downloads: 1234,
      dataUpload: '2024-01-15',
      disponivel: true,
      nivel: 'Intermediário',
      tags: ['PSC', 'ENEM', 'Funções']
    },
    {
      id: 2,
      titulo: 'Lista de Exercícios - Física Mecânica',
      categoria: 'exercicios',
      disciplina: 'Física',
      descricao: '50 questões resolvidas e comentadas sobre cinemática e dinâmica.',
      tamanho: '1.8 MB',
      paginas: 28,
      downloads: 892,
      dataUpload: '2024-01-20',
      disponivel: true,
      nivel: 'Avançado',
      tags: ['PSC', 'Mecânica', 'Resolução']
    },
    {
      id: 3,
      titulo: 'Simulado ENEM 2024 - Completo',
      categoria: 'simulados',
      disciplina: 'Geral',
      descricao: 'Simulado completo no estilo ENEM com 180 questões + redação.',
      tamanho: '4.2 MB',
      paginas: 65,
      downloads: 2156,
      dataUpload: '2024-02-01',
      disponivel: true,
      nivel: 'Todos',
      tags: ['ENEM', 'Simulado', 'Completo']
    },
    {
      id: 4,
      titulo: 'Videoaula - Química Orgânica',
      categoria: 'videos',
      disciplina: 'Química',
      descricao: 'Aula completa sobre funções orgânicas e nomenclatura IUPAC.',
      duracao: '45 min',
      visualizacoes: 3421,
      dataUpload: '2024-01-25',
      disponivel: true,
      nivel: 'Intermediário',
      tags: ['Química', 'Orgânica', 'IUPAC']
    },
    {
      id: 5,
      titulo: 'Apostila de Biologia - Genética',
      categoria: 'apostilas',
      disciplina: 'Biologia',
      descricao: 'Hereditariedade, leis de Mendel e genética molecular moderna.',
      tamanho: '3.1 MB',
      paginas: 52,
      downloads: 1567,
      dataUpload: '2024-01-30',
      disponivel: false,
      nivel: 'Avançado',
      tags: ['Biologia', 'Genética', 'Mendel']
    },
    {
      id: 6,
      titulo: 'Exercícios - Literatura Brasileira',
      categoria: 'exercicios',
      disciplina: 'Literatura',
      descricao: 'Questões sobre romantismo, realismo e modernismo brasileiro.',
      tamanho: '1.2 MB',
      paginas: 20,
      downloads: 745,
      dataUpload: '2024-02-05',
      disponivel: true,
      nivel: 'Intermediário',
      tags: ['Literatura', 'Brasil', 'Movimentos']
    }
  ]

  const materiaisFiltrados = materiais.filter(material => {
    const matchCategoria = filtroAtivo === 'todos' || material.categoria === filtroAtivo
    const matchBusca = material.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                      material.disciplina.toLowerCase().includes(busca.toLowerCase()) ||
                      material.descricao.toLowerCase().includes(busca.toLowerCase())
    return matchCategoria && matchBusca
  })

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Materiais de <span className="text-green-600">Estudo</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Acesse nossa biblioteca completa de apostilas, exercícios, simulados e videoaulas 
              desenvolvidos pelos melhores professores de Manaus.
            </p>
          </motion.div>

          {/* Stats dos Materiais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '150+', label: 'Apostilas', icon: FileText },
              { number: '500+', label: 'Exercícios', icon: Award },
              { number: '50+', label: 'Simulados', icon: Clock },
              { number: '200+', label: 'Videoaulas', icon: Video },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-green-600" size={32} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Filtros e Busca */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar materiais..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2 overflow-x-auto">
              {categorias.map((categoria) => {
                const Icon = categoria.icon
                return (
                  <button
                    key={categoria.id}
                    onClick={() => setFiltroAtivo(categoria.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      filtroAtivo === categoria.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={18} />
                    {categoria.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Lista de Materiais */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-gray-600">
              Encontrados <span className="font-semibold text-green-600">{materiaisFiltrados.length}</span> materiais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {materiaisFiltrados.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Header do Card */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        material.categoria === 'apostilas' ? 'bg-blue-100 text-blue-600' :
                        material.categoria === 'exercicios' ? 'bg-purple-100 text-purple-600' :
                        material.categoria === 'simulados' ? 'bg-orange-100 text-orange-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {material.categoria === 'apostilas' && <FileText size={24} />}
                        {material.categoria === 'exercicios' && <Award size={24} />}
                        {material.categoria === 'simulados' && <Clock size={24} />}
                        {material.categoria === 'videos' && <Video size={24} />}
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          material.categoria === 'apostilas' ? 'bg-blue-100 text-blue-800' :
                          material.categoria === 'exercicios' ? 'bg-purple-100 text-purple-800' :
                          material.categoria === 'simulados' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {material.disciplina}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      material.disponivel 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {material.disponivel ? 'Disponível' : 'Em breve'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {material.titulo}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {material.descricao}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {material.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer do Card */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {material.categoria === 'videos' ? (
                        <>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {material.duracao}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye size={14} />
                            {material.visualizacoes}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1">
                            <FileText size={14} />
                            {material.paginas} pág.
                          </div>
                          <div className="flex items-center gap-1">
                            <Download size={14} />
                            {material.downloads}
                          </div>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatarData(material.dataUpload)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      material.nivel === 'Básico' ? 'text-green-600' :
                      material.nivel === 'Intermediário' ? 'text-yellow-600' :
                      material.nivel === 'Avançado' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {material.nivel}
                    </span>

                    <button
                      disabled={!material.disponivel}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        material.disponivel
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {material.categoria === 'videos' ? (
                        <>
                          <Play size={16} />
                          Assistir
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Baixar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mensagem quando não há resultados */}
          {materiaisFiltrados.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Search className="text-gray-400 w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum material encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros ou buscar por outros termos.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Quer acesso completo aos nossos materiais?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Faça parte da família Entropia e tenha acesso ilimitado a todos os nossos conteúdos exclusivos.
            </p>
            <button className="px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-2xl hover:bg-green-700 transition-colors shadow-lg">
              Quero me matricular
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}