'use client';

import React, { useState, useEffect } from 'react';
import { TurmaSimples } from '@/lib/types/turma';
import { cleanupObsoleteStorage } from '@/lib/utils/cleanup-storage';
import { turmasService } from '@/services/turmasService';
import { Sun, Cloud, Moon } from 'lucide-react';

// Componente de conteúdo dinâmico
const ConteudoDinamico = ({ serieAtiva, turnoSelecionado }: { serieAtiva: string; turnoSelecionado?: string | null }) => {
  const [turmas, setTurmas] = useState<TurmaSimples[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarTurmas = async () => {
      try {
        const turmasAtivas = await turmasService.listarTurmas(true); // true para apenas ativas
        setTurmas(turmasAtivas);
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      } finally {
        setLoading(false);
      }
    };
    carregarTurmas();
  }, []);

  // Mapear série para encontrar turma correspondente (com filtro de turno)
  const getTurmaForSerie = (serie: string) => {
    const serieMapeamento: Record<string, string> = {
      '1serie': '1',
      '2serie': '2', 
      '3serie': '3',
      'formado': 'formado'
    };

    const serieCorrespondente = serieMapeamento[serie];
    
    // Filtrar turmas por série e turno
    const turmasCandidatas = turmas.filter(turma => {
      // Verificação específica para EXTENSIVA - deve aparecer apenas no 3º ano e formados
      if (turma.nome?.toUpperCase().includes('EXTENSIVA')) {
        const atendeExtensiva = (serieCorrespondente === '3' || serieCorrespondente === 'formado') && 
                               (turma.seriesAtendidas?.includes('3' as any) || 
                                turma.seriesAtendidas?.includes('formado' as any));
        const contemTurno = !turnoSelecionado || turma.turnos?.includes(turnoSelecionado as any);
        console.log(`[HOMEPAGE EXTENSIVA] ${turma.nome} - série: ${serieCorrespondente}, atende: ${atendeExtensiva}, turno ok: ${contemTurno}`);
        return atendeExtensiva && contemTurno;
      }
      
      // Lógica normal para outras turmas
      const contemSerie = turma.seriesAtendidas?.includes(serieCorrespondente as any) || turma.serie === serieCorrespondente;
      const contemTurno = !turnoSelecionado || turma.turnos?.includes(turnoSelecionado as any);
      return contemSerie && contemTurno;
    });
    
    // Retornar a primeira turma que atende aos critérios
    return turmasCandidatas[0] || null;
  };

  // Fallback para quando não há turmas cadastradas
  const getFallbackData = (serie: string) => {
    const fallbacks: Record<string, any> = {
      '1serie': {
        titulo: 'PSC UFAM',
        foco: 'PREPARAÇÃO COMPLETA PARA O PSC',
        beneficios: [
          { texto: '3 anos de preparação completa', destaquePlatinado: false },
          { texto: 'Material específico PSC', destaquePlatinado: true },
          { texto: 'Simulados mensais', destaquePlatinado: false }
        ]
      },
      '2serie': {
        titulo: 'ENEM PRO', 
        foco: 'FOCO TOTAL ENEM',
        beneficios: [
          { texto: 'Foco total ENEM', destaquePlatinado: true },
          { texto: 'Redação nota 1000', destaquePlatinado: false },
          { texto: 'Mentoria personalizada', destaquePlatinado: false }
        ]
      },
      '3serie': {
        titulo: 'INTENSIVO MAX',
        foco: 'REVISÃO COMPLETA PARA VESTIBULAR',
        beneficios: [
          { texto: 'Revisão completa', destaquePlatinado: true },
          { texto: 'Aulões ao vivo', destaquePlatinado: false },
          { texto: 'Simulados 2x/semana', destaquePlatinado: true }
        ]
      },
      'formado': {
        titulo: 'MED VIP',
        foco: 'TURMA EXCLUSIVA PARA MEDICINA',
        beneficios: [
          { texto: 'Turma reduzida', destaquePlatinado: true },
          { texto: 'Professor particular', destaquePlatinado: true },
          { texto: 'Garantia aprovação', destaquePlatinado: false }
        ]
      }
    };
    return fallbacks[serie];
  };

  const turmaAtual = getTurmaForSerie(serieAtiva);
  const dados = turmaAtual ? {
    titulo: turmaAtual.nome,
    foco: turmaAtual.foco,
    beneficios: turmaAtual.beneficios,
    turmaId: turmaAtual.id,
    serie: turmaAtual.serie
  } : getFallbackData(serieAtiva);

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-12 bg-gray-300 rounded mb-6"></div>
          <div className="h-12 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Nome da Turma */}
      <h3 className="text-3xl font-black text-gray-900 mb-2 text-center">
        {dados.titulo}
      </h3>
      
      {/* Foco da Turma */}
      <p className="text-lg font-medium text-gray-600 text-center mb-6">
        {dados.foco}
      </p>
      
      {!turmaAtual && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <p className="text-orange-700 text-xs text-center">
            💡 Dados de exemplo - Configure turmas no admin para personalizar
          </p>
        </div>
      )}

      {/* Lista de Benefícios */}
      {dados.beneficios && dados.beneficios.length > 0 ? (
        <ul className="space-y-3 mb-6">
          {dados.beneficios.map((item, idx) => (
            <li key={idx} className={
              item.destaquePlatinado 
                ? "beneficio-platinado p-3 rounded-lg shadow-sm border border-white/20 backdrop-blur-sm"
                : "flex items-center gap-3 text-gray-800 font-medium"
            }>
              {item.destaquePlatinado ? (
                <div className="flex items-start gap-3 text-gray-900 font-semibold">
                  <span className="text-purple-600 text-lg flex-shrink-0">✦</span>
                  <span className="break-words hyphens-auto">{item.texto}</span>
                </div>
              ) : (
                <>
                  <span className="text-green-600 text-lg flex-shrink-0">✓</span> 
                  <span className="break-words hyphens-auto">{item.texto}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500 mb-6">
          <p className="text-sm">Configure os benefícios no painel administrativo</p>
        </div>
      )}

      {/* Botão Reservar Minha Vaga */}
      <button 
        onClick={() => {
          // Sempre redirecionar para o formulário completo
          const params = new URLSearchParams();
          if (dados.turmaId) {
            params.set('turma_id', dados.turmaId.toString());
            params.set('turma', dados.titulo);
          }
          if (dados.serie) {
            params.set('serie', dados.serie);
          }
          if (turnoSelecionado) {
            params.set('turno', turnoSelecionado);
          }
          params.set('origem', 'home');
          window.location.href = `/matricula/novo-formulario?${params.toString()}`;
        }}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer"
      >
        RESERVAR MINHA VAGA
      </button>

      {/* CSS para efeito platinado */}
      <style jsx>{`
        .beneficio-platinado {
          background: linear-gradient(to right, 
            rgba(74, 222, 128, 0.2),  /* green */
            rgba(96, 165, 250, 0.2),  /* blue */
            rgba(196, 181, 253, 0.2)  /* purple */
          );
          backdrop-filter: blur(8px);
        }
      `}</style>
    </>
  );
};

// Componente de filtros de turno
const FiltroTurnos = ({ turnoSelecionado, onTurnoChange, serieAtiva, turmas }: {
  turnoSelecionado: string | null;
  onTurnoChange: (turno: string | null) => void;
  serieAtiva: string;
  turmas: TurmaSimples[];
}) => {
  // Mapear série para buscar turnos disponíveis
  const serieMapeamento: Record<string, string> = {
    '1serie': '1',
    '2serie': '2', 
    '3serie': '3',
    'formado': 'formado'
  };
  
  const serieCorrespondente = serieMapeamento[serieAtiva];
  
  // Encontrar turnos disponíveis para a série selecionada
  const turnosDisponiveis = new Set<string>();
  turmas.forEach(turma => {
    // Verificação específica para EXTENSIVA - deve aparecer apenas no 3º ano e formados
    if (turma.nome?.toUpperCase().includes('EXTENSIVA')) {
      const atendeExtensiva = (serieCorrespondente === '3' || serieCorrespondente === 'formado') && 
                             (turma.seriesAtendidas?.includes('3' as any) || 
                              turma.seriesAtendidas?.includes('formado' as any));
      if (atendeExtensiva && turma.turnos) {
        turma.turnos.forEach(turno => turnosDisponiveis.add(turno));
      }
      return;
    }
    
    // Lógica normal para outras turmas
    const contemSerie = turma.seriesAtendidas?.includes(serieCorrespondente as any) || turma.serie === serieCorrespondente;
    if (contemSerie && turma.turnos) {
      turma.turnos.forEach(turno => turnosDisponiveis.add(turno));
    }
  });
  
  const turnosArray = Array.from(turnosDisponiveis).sort();
  
  if (turnosArray.length <= 1) {
    return null; // Não mostrar filtro se há apenas um turno ou nenhum
  }

  const turnos = [
    { value: 'matutino', label: 'Matutino', icon: Sun, color: 'from-yellow-400 to-orange-500' },
    { value: 'vespertino', label: 'Vespertino', icon: Cloud, color: 'from-orange-500 to-pink-500' },
    { value: 'noturno', label: 'Noturno', icon: Moon, color: 'from-blue-500 to-purple-600' }
  ].filter(turno => turnosArray.includes(turno.value));

  return (
    <div className="space-y-3 mt-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-3 border border-white/20 shadow-xl">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${turnos.length}, 1fr)` }}>
          {/* Botões de turno */}
          {turnos.map((turno) => {
            const Icon = turno.icon;
            return (
              <button
                key={turno.value}
                onClick={() => onTurnoChange(turnoSelecionado === turno.value ? null : turno.value)}
                className={`
                  py-3 px-2 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-1
                  ${turnoSelecionado === turno.value 
                    ? 'bg-gradient-to-r ' + turno.color + ' text-white shadow-lg' 
                    : 'text-white/80 hover:bg-white/10'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{turno.label}</span>
                <span className="sm:hidden">{turno.label.slice(0, 3)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [serieAtiva, setSerieAtiva] = useState('3serie');
  const [turnoSelecionado, setTurnoSelecionado] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [turmas, setTurmas] = useState<TurmaSimples[]>([]);
  const [key, setKey] = useState(0); // Forçar re-render no mobile

  // Limpeza de dados obsoletos e carregamento de turmas
  useEffect(() => {
    cleanupObsoleteStorage();
    
    const carregarTurmas = async () => {
      try {
        const turmasAtivas = await turmasService.listarTurmas(true);
        setTurmas(turmasAtivas);
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      }
    };
    carregarTurmas();
  }, []);
  
  // Reset turno quando mudar série
  useEffect(() => {
    setTurnoSelecionado(null);
  }, [serieAtiva]);

  // Função para mudança de série com forçamento de re-render
  const handleSerieChange = (serie: string) => {
    setSerieAtiva(serie);
    setKey(prev => prev + 1); // Forçar re-render
    
    // Forçar atualização do DOM no mobile
    setTimeout(() => {
      const elemento = document.querySelector(`[data-serie="${serie}"]`);
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  return (
    <>
      {/* NAVBAR COM GLASSMORPHISM */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-black/10 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              
              {/* Logo/Brand */}
              <div className="flex items-center space-x-3">
                {/* Logo Icon */}
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 
                              rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-xl">E</span>
                </div>
                <div>
                  <h1 className="text-white font-black text-xl leading-tight">ENTROPIA</h1>
                  <p className="text-green-300 text-xs">CURSINHO PRÉ-VESTIBULAR</p>
                </div>
              </div>
              
              {/* Menu Desktop */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="/" className="text-white/70 hover:text-white transition-colors 
                                     font-medium text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Início
                </a>
                
                <a href="/banco-de-provas" className="text-white/70 hover:text-white transition-colors 
                                                   font-medium text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Banco de Provas
                </a>
                
                <a href="/calculadora" className="text-white/70 hover:text-white transition-colors 
                                                font-medium text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Calculadora
                </a>
                
                <a href="/admin" className="text-white/70 hover:text-white transition-colors 
                                          font-medium text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin
                </a>
              </div>
              
              
              {/* Menu Mobile Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white/70 hover:text-white transition-colors p-2"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Menu Mobile */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-black/10 backdrop-blur-md border-t border-white/10">
              <div className="px-4 py-3 space-y-2">
                <a href="/" className="flex items-center gap-3 px-3 py-2 text-white/70 
                                     hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Início
                </a>
                
                <a href="/banco-de-provas" className="flex items-center gap-3 px-3 py-2 text-white/70 
                                                     hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Banco de Provas
                </a>
                
                <a href="/calculadora" className="flex items-center gap-3 px-3 py-2 text-white/70 
                                                hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Calculadora
                </a>
                
                <a href="/admin" className="flex items-center gap-3 px-3 py-2 text-white/70 
                                          hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin
                </a>
                
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* RESTO DO CONTEÚDO DA PÁGINA */}
      <div className="min-h-screen relative pt-24 lg:pt-20">
      
      {/* BANNER VERDE COMO FUNDO FIXO */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-800 via-green-700 to-green-600">
        {/* Textura adicional opcional */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%)`,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Efeito de gradiente radial */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] 
                        bg-green-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="relative z-10">
        
        {/* Botões Mobile - Topo */}
        <div className="lg:hidden px-4 py-3 space-y-3">
          <a href="/calculadora" className="block">
            <button className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 px-6 rounded-lg flex items-center justify-between hover:bg-white/20 transition-all">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">Calculadora de Notas</span>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </a>
          
          <a href="/banco-de-provas" className="block">
            <button className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 px-6 rounded-lg flex items-center justify-between hover:bg-white/20 transition-all">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-semibold">Banco de Provas</span>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </a>
        </div>
        
        {/* Container principal com grid para desktop */}
        <div className="min-h-screen px-4 py-1">
          <div className="max-w-7xl mx-auto py-4">
            <div className="grid lg:grid-cols-4 gap-6 items-start">
              
              {/* COLUNA ESQUERDA - Cards Simples - Apenas Desktop */}
              <div className="hidden lg:block lg:col-span-1 space-y-4">
                
                {/* Card 1 - Lucca */}
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <img 
                    src="/images/lucca-beulch.png"
                    alt="Lucca Beulch"
                    className="w-full rounded-xl shadow-lg"
                  />
                </div>
                
                {/* Card 2 - Eduarda */}
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <img 
                    src="/images/eduarda-braga.png"
                    alt="Eduarda Braga"
                    className="w-full rounded-xl shadow-lg"
                  />
                </div>
                
                {/* Card 3 - Gabriela */}
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <img 
                    src="/images/gabriela-parente.png"
                    alt="Gabriela Parente"
                    className="w-full rounded-xl shadow-lg"
                  />
                </div>
                
              </div>

              {/* COLUNA CENTRAL - Seletor Principal */}
              <div className="lg:col-span-2 flex items-start justify-center pt-4">
                <div className="w-full max-w-md animate-slide-up">
                  
                  {/* HEADER COM GLASSMORPHISM */}
                  <div className="text-center mb-2">
                    
                    {/* Container específico para o título */}
                    <div className="inline-block">
                      <h1 className="text-5xl md:text-7xl font-black text-white mb-2 leading-relaxed py-2
                                   text-transparent bg-clip-text 
                                   bg-gradient-to-r from-green-300 to-white
                                   drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
                          style={{ lineHeight: '1.2', display: 'block' }}>
                        ENTROPIA
                      </h1>
                    </div>
                    
                    {/* Divisor com animação */}
                    <div className="flex items-center justify-center gap-3 my-2">
                      <div className="h-px w-20 bg-gradient-to-r from-transparent to-white/50"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <div className="h-px w-20 bg-gradient-to-l from-transparent to-white/50"></div>
                    </div>
                    
                    {/* Call to Action */}
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      SELECIONE A SUA SÉRIE
                    </h2>
                    
                    {/* Seta animada */}
                    <div className="mt-4 animate-bounce">
                      <svg className="w-8 h-8 text-white/80 mx-auto" 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>

                  {/* SELETORES DE SÉRIE */}
                  <div className="space-y-3">
                    
                    {/* Bloco 1: Séries do Ensino Médio */}
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-2 
                                  border border-white/20 shadow-xl glass-effect" key={`series-${key}`}>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          data-serie="1serie"
                          onClick={() => handleSerieChange('1serie')}
                          className={`
                            py-4 rounded-2xl font-bold transition-all
                            ${serieAtiva === '1serie' 
                              ? 'bg-white text-green-800 shadow-lg' 
                              : 'text-white/80 hover:bg-white/10'
                            }
                          `}
                        >
                          1ª Série
                        </button>
                        
                        <button
                          data-serie="2serie"
                          onClick={() => handleSerieChange('2serie')}
                          className={`
                            py-4 rounded-2xl font-bold transition-all
                            ${serieAtiva === '2serie' 
                              ? 'bg-white text-green-800 shadow-lg' 
                              : 'text-white/80 hover:bg-white/10'
                            }
                          `}
                        >
                          2ª Série
                        </button>
                        
                        <button
                          data-serie="3serie"
                          onClick={() => handleSerieChange('3serie')}
                          className={`
                            py-4 rounded-2xl font-bold transition-all
                            ${serieAtiva === '3serie' 
                              ? 'bg-white text-gray-900 shadow-lg' 
                              : 'text-white/80 hover:bg-white/10'
                            }
                          `}
                        >
                          3ª Série
                        </button>
                      </div>
                    </div>
                    
                    {/* Bloco 2: Já Formado */}
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-2 
                                  border border-white/20 shadow-xl glass-effect" key={`formado-${key}`}>
                      <button
                        data-serie="formado"
                        onClick={() => handleSerieChange('formado')}
                        className={`
                          w-full py-4 rounded-2xl font-bold transition-all
                          ${serieAtiva === 'formado' 
                            ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg' 
                            : 'text-white/80 hover:bg-white/10'
                          }
                        `}
                      >
                        Já Formado
                      </button>
                    </div>
                  </div>
                  
                  {/* FILTROS DE TURNO */}
                  <FiltroTurnos 
                    turnoSelecionado={turnoSelecionado}
                    onTurnoChange={setTurnoSelecionado}
                    serieAtiva={serieAtiva}
                    turmas={turmas}
                  />

                  {/* CARD DE CONTEÚDO */}
                  <div className="mt-8 bg-white/95 backdrop-blur-xl rounded-3xl 
                                shadow-2xl p-8 border border-white/50 glass-effect" 
                       key={`content-${serieAtiva}-${turnoSelecionado}-${key}`}>
                    {/* Conteúdo dinâmico baseado na série e turno */}
                    <ConteudoDinamico serieAtiva={serieAtiva} turnoSelecionado={turnoSelecionado} />
                  </div>


                </div>

              </div>

              {/* COLUNA DIREITA - Botões de Acesso Rápido */}
              <div className="hidden lg:block lg:col-span-1 space-y-4">
                
                {/* Botão Calculadora ENEM */}
                <a href="/calculadora" className="block group">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 
                                rounded-2xl p-6 hover:bg-white/15 transition-all duration-300
                                hover:scale-[1.02] hover:shadow-2xl cursor-pointer">
                    
                    {/* Ícone e Gradiente */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 
                                    rounded-xl flex items-center justify-center shadow-lg
                                    group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-white/50 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Texto */}
                    <h3 className="text-white font-bold text-xl mb-2">
                      Calculadora de Notas
                    </h3>
                    <p className="text-white/70 text-sm">
                      Calcule sua nota e veja suas chances de aprovação
                    </p>
                    
                    {/* Badge */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full">
                        Ferramenta Gratuita
                      </span>
                    </div>
                  </div>
                </a>
                
                {/* Botão Banco de Provas */}
                <a href="/banco-de-provas" className="block group">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 
                                rounded-2xl p-6 hover:bg-white/15 transition-all duration-300
                                hover:scale-[1.02] hover:shadow-2xl cursor-pointer">
                    
                    {/* Ícone e Gradiente */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 
                                    rounded-xl flex items-center justify-center shadow-lg
                                    group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="text-white/50 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Texto */}
                    <h3 className="text-white font-bold text-xl mb-2">
                      Banco de Provas
                    </h3>
                    <p className="text-white/70 text-sm">
                      Acesse provas anteriores e simulados exclusivos
                    </p>
                    
                    {/* Badge */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full">
                        Acesso Gratuito
                      </span>
                    </div>
                  </div>
                </a>
                
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default HomePage;