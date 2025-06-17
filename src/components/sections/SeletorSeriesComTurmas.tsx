'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { turmasService } from '@/services/turmasService';

const SecaoMatriculasDescomplica = () => {
  const [planoAtivo, setPlanoAtivo] = useState('3serie'); // 3ª série como padrão
  const [turmasAtivas, setTurmasAtivas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const carregarTurmas = async () => {
      try {
        const turmas = await turmasService.listarTurmas(true);
        setTurmasAtivas(turmas);
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      } finally {
        setLoading(false);
      }
    };
    carregarTurmas();
  }, []);
  
  const planos = {
    '1serie': {
      nome: '1ª Série',
      titulo: 'PSC Start',
      preco: '180',
      precoOriginal: '220',
      badge: 'INÍCIO ANTECIPADO',
      cor: 'from-blue-400 to-blue-600',
      beneficios: [
        'Preparação focada no PSC UFAM',
        'Material didático exclusivo',
        'Simulados mensais PSC',
        'Acompanhamento 3 anos',
        'Grupo VIP no WhatsApp'
      ]
    },
    '2serie': {
      nome: '2ª Série',
      titulo: 'ENEM Pro',
      preco: '200',
      precoOriginal: '250',
      badge: 'MAIS PROCURADO',
      cor: 'from-purple-400 to-purple-600',
      beneficios: [
        'Foco total no ENEM',
        'Redação nota 1000',
        'Simulados semanais',
        'Correção de redação ilimitada',
        'Mentoria personalizada'
      ]
    },
    '3serie': {
      nome: '3ª Série',
      titulo: 'Intensivo Max',
      preco: '250',
      precoOriginal: '350',
      badge: 'RETA FINAL',
      cor: 'from-green-400 to-green-600',
      beneficios: [
        'Revisão completa intensiva',
        'Aulões ao vivo diários',
        'Simulados 2x por semana',
        'Material de revisão express',
        'Suporte psicológico'
      ]
    },
    'formado': {
      nome: 'Já Formado',
      titulo: 'Med VIP',
      preco: '300',
      precoOriginal: '400',
      badge: 'PREMIUM',
      cor: 'from-orange-400 to-red-600',
      beneficios: [
        'Foco em Medicina e cursos TOP',
        'Turma reduzida (máx 15 alunos)',
        'Professor particular incluído',
        'Material premium importado',
        'Garantia de aprovação*'
      ]
    }
  };

  const planoSelecionado = planos[planoAtivo as keyof typeof planos];

  const handleMatricula = (plano: string) => {
    const mapeamento: Record<string, string> = {
      '1serie': 'PSC',
      '2serie': 'ENEM',
      '3serie': 'INTENSIVO',
      'formado': 'INTENSIVO'
    };

    // Buscar turma correspondente no sistema de turmas simples
    const serieMapeamento: Record<string, string> = {
      '1serie': '1',
      '2serie': '2',
      '3serie': '3',
      'formado': 'formado'
    };
    
    const serie = serieMapeamento[plano];
    const turmaEncontrada = turmasAtivas.find((t: any) => 
      t.serie === serie && t.ativa !== false
    );

    if (turmaEncontrada && turmaEncontrada.id) {
      sessionStorage.setItem('plano_selecionado', plano);
      
      // Mapear plano para série para manter compatibilidade
      const serieMapeamento: Record<string, string> = {
        '1serie': '1',
        '2serie': '2',
        '3serie': '3',
        'formado': 'formado'
      };
      
      const serie = serieMapeamento[plano];
      sessionStorage.setItem('serie_selecionada', serie);
      
      // Criar query params corretos
      const queryParams = serie === 'formado' ? 
        `?turmaId=${turmaEncontrada.id}&formado=true&serie=${serie}` : 
        `?turmaId=${turmaEncontrada.id}&serie=${serie}`;
      
      router.push(`/matricula${queryParams}`);
    } else {
      alert('Vagas abertas em breve! Deixe seu contato.');
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-green-600 py-8 px-4 relative">
      {/* Overlay com padrão */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
      
      <div className="relative z-10 max-w-md mx-auto">
        {/* Header TOTALMENTE REFORMULADO */}
        <div className="text-center mb-10">
          {/* Badge Superior com Glassmorphism */}
          <div className="inline-block mb-6">
            <div className="bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full 
                          border border-white/20 shadow-lg">
              <p className="text-white/90 text-xs font-semibold uppercase tracking-widest">
                Cursinho Enem e Pré-Vestibular
              </p>
            </div>
          </div>
          
          {/* Título Principal com Efeito */}
          <div className="relative mb-8">
            {/* Brilho de fundo */}
            <div className="absolute inset-0 blur-3xl opacity-30">
              <div className="bg-green-400 rounded-full w-64 h-64 mx-auto"></div>
            </div>
            
            {/* Texto com gradiente */}
            <h1 className="relative">
              <span className="block text-6xl md:text-7xl font-black text-transparent 
                             bg-clip-text bg-gradient-to-r from-green-300 to-white
                             drop-shadow-2xl mb-2">
                SEJA
              </span>
              <span className="block text-6xl md:text-7xl font-black text-white
                             drop-shadow-2xl">
                ENTROPIA
              </span>
            </h1>
          </div>
          
          {/* Divisor animado */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-green-400"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-green-400"></div>
          </div>
          
          {/* Call to Action */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            SELECIONE A SUA <span className="text-green-300">SÉRIE</span>
          </h2>
          
          {/* Ícone indicativo */}
          <div className="animate-bounce mt-4">
            <svg className="w-6 h-6 text-green-300 mx-auto" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Pills/Tabs Seletor - DOIS BLOCOS SEPARADOS */}
        <div className="mb-6 space-y-2">
          
          {/* BLOCO 1: Primeira linha (1ª, 2ª e 3ª Série) */}
          <div className="bg-white/10 backdrop-blur-md rounded-full p-1.5 
                        shadow-lg border border-white/20 glass-block-1">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setPlanoAtivo('1serie')}
                className={`
                  py-3 px-3 rounded-full font-bold text-sm transition-all
                  ${planoAtivo === '1serie' 
                    ? 'bg-white text-gray-900 shadow-lg' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                1ª Série
              </button>
              
              <button
                onClick={() => setPlanoAtivo('2serie')}
                className={`
                  py-3 px-3 rounded-full font-bold text-sm transition-all
                  ${planoAtivo === '2serie' 
                    ? 'bg-white text-gray-900 shadow-lg' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                2ª Série
              </button>
              
              <button
                onClick={() => setPlanoAtivo('3serie')}
                className={`
                  py-3 px-3 rounded-full font-bold text-sm transition-all
                  ${planoAtivo === '3serie' 
                    ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                3ª Série
              </button>
            </div>
          </div>
          
          {/* BLOCO 2: Segunda linha (Já Formado) */}
          <div className="bg-white/10 backdrop-blur-md rounded-full p-1.5 
                        shadow-lg border border-white/20 glass-block-2">
            <div className="flex justify-center">
              <button
                onClick={() => setPlanoAtivo('formado')}
                className={`
                  py-3 px-8 rounded-full font-bold text-sm transition-all w-full
                  ${planoAtivo === 'formado' 
                    ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                Já Formado
              </button>
            </div>
          </div>
        </div>

        {/* Card Principal - Glassmorphism */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl 
                      border border-white/50 overflow-hidden
                      transform transition-all duration-500 card-transition">
          
          {/* Badge no topo */}
          {planoSelecionado.badge && (
            <div className={`bg-gradient-to-r ${planoSelecionado.cor} 
                          text-white text-xs font-bold py-2 text-center`}>
              {planoSelecionado.badge}
            </div>
          )}

          <div className="p-8">
            {/* Título do Plano */}
            <h3 className="text-3xl font-black text-gray-900 mb-6">
              {planoSelecionado.titulo}
            </h3>

            {/* Preço */}
            <div className="mb-8">
              <p className="text-gray-500 text-sm mb-1">
                De <span className="line-through">12x R${planoSelecionado.precoOriginal}</span> por:
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-gray-900">
                  12x R${planoSelecionado.preco}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                ou R$ {(Number(planoSelecionado.preco) * 12 * 0.9).toFixed(0)} à vista
              </p>
            </div>

            {/* Botão CTA Principal */}
            <button
              onClick={() => handleMatricula(planoAtivo)}
              className={`
                w-full py-4 rounded-full font-black text-lg
                bg-gradient-to-r ${planoSelecionado.cor}
                text-white shadow-lg transform transition-all
                hover:scale-105 active:scale-95
                relative overflow-hidden group shine-effect
              `}
            >
              <span className="relative z-10">Comece Agora</span>
              <div className="absolute inset-0 bg-white/20 
                            translate-y-full group-hover:translate-y-0 
                            transition-transform duration-300"></div>
            </button>

            {/* Benefícios */}
            <div className="mt-8 space-y-3">
              <p className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                Incluído no plano:
              </p>
              {planoSelecionado.beneficios.map((beneficio, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`
                    w-6 h-6 rounded-full bg-gradient-to-r ${planoSelecionado.cor}
                    flex items-center justify-center flex-shrink-0 mt-0.5
                  `}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 break-words hyphens-auto leading-relaxed flex-1">
                    {beneficio}
                  </span>
                </div>
              ))}
            </div>

            {/* Info adicional */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-500 text-sm">
                E muito mais...
              </p>
            </div>
          </div>
        </div>

        {/* Links do footer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-white/80 text-sm">
            Dúvidas? 
            <a href="https://wa.me/5592999999999" className="text-green-300 font-bold ml-1">
              Chama no WhatsApp
            </a>
          </p>
          <p className="text-white/60 text-xs">
            * Consulte regulamento
          </p>
        </div>
      </div>
    </section>
  );
};

export default SecaoMatriculasDescomplica;