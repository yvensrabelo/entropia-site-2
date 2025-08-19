'use client'

import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  School, 
  Users, 
  User,
  Heart,
  TreePine,
  Home,
  DollarSign,
  CheckCircle,
  XCircle,
  TrendingUp,
  Target,
  Lock
} from 'lucide-react';
import { 
  PROCESSOS, 
  CURSOS, 
  COTAS_POR_PROCESSO, 
  CAMPOS_POR_PROCESSO,
  NOTAS_DE_CORTE,
  DESCRICOES_COTA
} from '@/data/vestibular-data';
import notasDeCorte from '@/data/notas-corte-psc-2024.json';
import notasCorteMacro from '@/data/notas-corte-macro-2025.json';
import notasCorteSis from '@/data/notas-corte-sis-2025.json';

type Processo = typeof PROCESSOS[number];
type Curso = typeof CURSOS[number];

// Mapeamento entre nomes de cotas do código e do JSON MACRO
const cotasMacroMapping: Record<string, string> = {
  'Interior AM': 'Estudantes do Interior Amazonas',
  'Portador de Diploma': 'Portador de Diploma Brasil',
  'PCD AM': 'Pessoas com Deficiência (PCD) Amazonas',
  'PCD': 'Pessoas com Deficiência (PCD) Brasil',
  'Pessoas Indígenas AM': 'Pessoas Indígenas Amazonas',
  'Pessoas Indígenas': 'Pessoas Indígenas Brasil',
  'Pessoas Pretas AM': 'Pessoas Pretas Amazonas',
  'Pessoas Pretas': 'Pessoas Pretas Brasil',
  'Escola Pública AM': 'Estudantes de Escola Pública Amazonas',
  'Escola Pública Brasil': 'Estudantes de Escola Pública Brasil',
  'Qualquer Natureza AM': 'Estudantes de Escola de Qualquer Natureza Amazonas',
  'Qualquer Natureza Brasil': 'Estudantes de Escola de Qualquer Natureza Brasil'
};

// Mapeamento entre nomes de cotas do código e do JSON SIS
const cotasSisMapping: Record<string, string> = {
  // Concorrência Geral
  'GRUPO A': 'GRUPO 01 - A - Escola Pública (Geral)',
  'GRUPO B': 'GRUPO 02 - B - Qualquer Escola (Geral)',
  'GRUPO C': 'GRUPO 03 - C - PCD (Geral)',
  'GRUPO D': 'GRUPO 04 - D - Pretos (Geral)',
  'GRUPO E': 'GRUPO 05 - E - Indígenas (Geral)',
  // Reserva de Vagas AM
  'GRUPO F': 'GRUPO 06 - F - Escola Pública AM',
  'GRUPO G': 'GRUPO 07 - G - Qualquer Escola AM',
  'GRUPO H': 'GRUPO 08 - H - PCD AM',
  'GRUPO I': 'GRUPO 09 - I - Pretos AM',
  'GRUPO J': 'GRUPO 10 - J - Indígenas AM',
  'GRUPO K': 'GRUPO 11 - K - Interior AM'
};

// Função para criar mapa de notas
const criarNotasMap = () => {
  const map: Record<string, Record<string, Record<string, any>>> = {};
  
  // Processar PSC
  notasDeCorte.forEach((item: any) => {
    if (!map[item.processo]) map[item.processo] = {};
    if (!map[item.processo][item.cota]) map[item.processo][item.cota] = {};
    
    // Para PSC, usar a maior nota se já existe entrada para o curso
    if (!map[item.processo][item.cota][item.curso]) {
      map[item.processo][item.cota][item.curso] = item.nota;
    } else {
      const notaAnterior = map[item.processo][item.cota][item.curso];
      map[item.processo][item.cota][item.curso] = Math.max(notaAnterior, item.nota);
    }
  });
  
  // Processar MACRO com novo formato
  notasCorteMacro.forEach((item: any) => {
    if (!map[item.processo]) map[item.processo] = {};
    
    // Mapear nome da cota do JSON para nosso nome interno
    const nomeInterno = Object.keys(cotasMacroMapping).find(key => 
      cotasMacroMapping[key] === item.cota
    ) || item.cota;
    
    if (!map[item.processo][nomeInterno]) map[item.processo][nomeInterno] = {};
    
    // Para MACRO, usar a menor nota se já existe entrada para o curso
    if (!map[item.processo][nomeInterno][item.curso]) {
      map[item.processo][nomeInterno][item.curso] = item.nota;
    } else {
      map[item.processo][nomeInterno][item.curso] = Math.min(
        map[item.processo][nomeInterno][item.curso],
        item.nota
      );
    }
  });
  
  // Processar SIS
  notasCorteSis.forEach((item: any) => {
    if (!map[item.processo]) map[item.processo] = {};
    
    // Mapear nome da cota do JSON para nosso nome interno
    const nomeInterno = Object.keys(cotasSisMapping).find(key => 
      cotasSisMapping[key] === item.cota
    ) || item.cota;
    
    if (!map[item.processo][nomeInterno]) map[item.processo][nomeInterno] = {};
    
    // Para SIS, usar a menor nota se já existe entrada para o curso
    if (!map[item.processo][nomeInterno][item.curso]) {
      map[item.processo][nomeInterno][item.curso] = item['nota-corte'];
    } else {
      map[item.processo][nomeInterno][item.curso] = Math.min(
        map[item.processo][nomeInterno][item.curso],
        item['nota-corte']
      );
    }
  });
  
  return map;
};

// Função para obter dados detalhados do MACRO
const obterDadosMacro = (curso: string, cota: string) => {
  // Mapear nome da cota interna para nome do JSON
  const nomeJsonCota = cotasMacroMapping[cota] || cota;
  
  // Encontrar todos os registros para este curso e cota
  const registros = notasCorteMacro.filter((item: any) => 
    item.curso === curso && item.cota === nomeJsonCota
  );
  
  if (registros.length === 0) return null;
  
  // Se há múltiplos registros, pegar o com menor nota
  const melhorRegistro = registros.reduce((menor: any, atual: any) => 
    atual.nota < menor.nota ? atual : menor
  );
  
  return {
    nota: melhorRegistro.nota,
    turno: melhorRegistro.turno,
    cidade: melhorRegistro.cidade
  };
};

// Função para obter dados detalhados do SIS
const obterDadosSis = (curso: string, cota: string) => {
  // Mapear nome da cota interna para nome do JSON
  const nomeJsonCota = cotasSisMapping[cota] || cota;
  
  // Encontrar todos os registros para este curso e cota
  const registros = notasCorteSis.filter((item: any) => 
    item.curso === curso && item.cota === nomeJsonCota
  );
  
  if (registros.length === 0) return null;
  
  // Se há múltiplos registros, pegar o com menor nota
  const melhorRegistro = registros.reduce((menor: any, atual: any) => 
    atual['nota-corte'] < menor['nota-corte'] ? atual : menor
  );
  
  return {
    nota: melhorRegistro['nota-corte'],
    turno: melhorRegistro.turno,
    campus: melhorRegistro.campus
  };
};

// Hook personalizado para debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Extrair lista única de cursos do JSON
const cursosUnicos = [...new Set([...notasDeCorte, ...notasCorteMacro, ...notasCorteSis].map(item => item.curso))];

interface DadosCotas {
  escolaPublica: boolean;
  baixaRenda: boolean;
  // Mudando para booleanos separados
  preto: boolean;
  indigena: boolean;
  pcd: boolean;
  quilombola: boolean;
  // Campos MACRO
  amazonense: boolean;
  interiorAmazonas: boolean;
  portadorDiploma: boolean;
}

interface NotasState {
  [key: string]: number;
}

interface ResultadoCurso {
  curso: string;
  notaCorte: number | string;
  diferenca: number;
  aprovado: boolean;
  percentual: number;
  turno?: string;
  cidade?: string;
  campus?: string;
}


// Navbar móvel - disposição reimaginada
const MobileNavbar = ({ 
  processoSelecionado,
  cotaDeterminada, 
  notaTotal,
  notas,
  onReset,
  hasResults
}: { 
  processoSelecionado: string;
  cotaDeterminada: string;
  notaTotal: number;
  notas: any;
  onReset: () => void;
  hasResults: boolean;
}) => {
  if (!hasResults || notaTotal === 0) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetCalculator = () => {
    onReset();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm shadow-2xl border-t border-gray-800">
        <div className="px-4 py-2.5">
          {/* Layout horizontal com 3 seções */}
          <div className="flex items-center justify-between gap-3">
            
            {/* Seção 1: Info da Cota */}
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{cotaDeterminada}</span>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-2 py-1">
                <p className="text-[15px] font-bold text-white leading-tight">{notaTotal.toFixed(3)}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-wide">pontos</p>
              </div>
            </div>

            {/* Divisor vertical */}
            <div className="w-px h-12 bg-gray-700"></div>

            {/* Seção 2: Breakdown das notas */}
            <div className="flex-1">
              {processoSelecionado === 'PSC' ? (
                <div className="grid grid-cols-4 gap-1 text-center">
                  <div>
                    <p className="text-[9px] text-gray-500">E1</p>
                    <p className="text-xs font-semibold text-green-400">{notas['PSC 1'] || '0'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500">E2</p>
                    <p className="text-xs font-semibold text-green-400">{notas['PSC 2'] || '0'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500">E3</p>
                    <p className="text-xs font-semibold text-green-400">{notas['PSC 3'] || '0'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500">RED</p>
                    <p className="text-xs font-semibold text-green-400">{notas['Redação'] || '0'}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div>
                    <p className="text-[9px] text-gray-500">D1</p>
                    <p className="text-xs font-semibold text-green-400">{notas['Dia 1 (0-84)'] || '0'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500">D2</p>
                    <p className="text-xs font-semibold text-green-400">{notas['Dia 2 (0-36)'] || '0'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500">RED</p>
                    <p className="text-xs font-semibold text-green-400">{notas['Redação (0-28)'] || '0'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Divisor vertical */}
            <div className="w-px h-12 bg-gray-700"></div>

            {/* Seção 3: Ações */}
            <div className="flex gap-2">
              <button
                onClick={scrollToTop}
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-all duration-200 group"
                title="Voltar ao topo"
              >
                <svg className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
              
              <button
                onClick={resetCalculator}
                className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all duration-200 group"
                title="Nova consulta"
              >
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CalculadoraDinamica() {
  // Criar mapa de notas usando useMemo
  const notasMap = useMemo(() => criarNotasMap(), []);

  // Estados principais
  const [processoSelecionado, setProcessoSelecionado] = useState<Processo>('PSC');
  const [dadosCotas, setDadosCotas] = useState<DadosCotas>({
    escolaPublica: false,
    baixaRenda: false,
    preto: false,
    indigena: false,
    pcd: false,
    quilombola: false,
    amazonense: false,
    interiorAmazonas: false,
    portadorDiploma: false
  });
  const [notas, setNotas] = useState<NotasState>({});
  const [notaTotal, setNotaTotal] = useState(0);
  const [cotaDeterminada, setCotaDeterminada] = useState('AC');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Solução para zoom do WhatsApp sem afetar scroll
  React.useEffect(() => {
    // Configura viewport apenas uma vez
    const metaViewport = document.querySelector('meta[name=viewport]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
      );
    }
  }, []); // Array vazio - executa apenas uma vez

  // Debug temporário para monitorar scroll
  React.useEffect(() => {
    console.log('Componente montado. Posição do scroll:', window.scrollY);
    
    const handleScroll = () => {
      console.log('Scroll detectado! Posição:', window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Criar lista de cursos ordenada (apenas cursos com dados disponíveis)
  const cursosOrdenados = useMemo(() => {
    // Filtrar cursos que têm dados para o processo atual
    const cursosDisponiveis = cursosUnicos.filter(curso => {
      return notasMap[processoSelecionado]?.[cotaDeterminada]?.[curso] !== undefined;
    });

    // Criar lista de cursos com suas notas AC para ordenação
    const cursosComNotaAC = cursosDisponiveis.map(curso => ({
      nome: curso,
      notaAC: notasMap['PSC']?.['AC']?.[curso] || notasMap[processoSelecionado]?.[cotaDeterminada]?.[curso] || 0
    }));

    // Ordenar cursos por nota de corte decrescente
    return cursosComNotaAC
      .sort((a, b) => {
        if (a.notaAC === 0 && b.notaAC === 0) return a.nome.localeCompare(b.nome);
        if (a.notaAC === 0) return 1;
        if (b.notaAC === 0) return -1;
        return b.notaAC - a.notaAC;
      })
      .map(item => item.nome);
  }, [notasMap, processoSelecionado, cotaDeterminada]);

  // Determinar cota automaticamente
  useEffect(() => {
    let novaCota = 'AC';
    
    // Para PSC
    if (processoSelecionado === 'PSC') {
      if (dadosCotas.escolaPublica) {
        const ppi = dadosCotas.preto || dadosCotas.indigena;
        if (dadosCotas.pcd) {
          novaCota = dadosCotas.baixaRenda ? 'PCD1' : 'PCD2';
        } else if (dadosCotas.indigena) {
          novaCota = dadosCotas.baixaRenda ? 'IND1' : 'IND2';
        } else if (dadosCotas.quilombola) {
          novaCota = dadosCotas.baixaRenda ? 'QLB1' : 'QLB2';
        } else if (ppi) {
          novaCota = dadosCotas.baixaRenda ? 'PP1' : 'PP2';
        } else {
          novaCota = dadosCotas.baixaRenda ? 'NDC1' : 'NDC2';
        }
      }
    } else if (processoSelecionado === 'MACRO') {
      // Interior tem prioridade
      if (dadosCotas.interiorAmazonas && dadosCotas.amazonense) {
        novaCota = 'Interior AM';
      }
      // Portador de Diploma
      else if (dadosCotas.portadorDiploma) {
        novaCota = 'Portador de Diploma';
      }
      // PCD
      else if (dadosCotas.pcd) {
        novaCota = dadosCotas.amazonense ? 'PCD AM' : 'PCD';
      }
      // Indígenas
      else if (dadosCotas.indigena) {
        novaCota = dadosCotas.amazonense ? 'Pessoas Indígenas AM' : 'Pessoas Indígenas';
      }
      // Pretos (NO MACRO não inclui pardos, apenas pretos)
      else if (dadosCotas.preto) {
        novaCota = dadosCotas.amazonense ? 'Pessoas Pretas AM' : 'Pessoas Pretas';
      }
      // Escola Pública
      else if (dadosCotas.escolaPublica) {
        novaCota = dadosCotas.amazonense ? 'Escola Pública AM' : 'Escola Pública Brasil';
      }
      // Ampla concorrência
      else {
        novaCota = dadosCotas.amazonense ? 'Qualquer Natureza AM' : 'Qualquer Natureza Brasil';
      }
    } else if (processoSelecionado === 'SIS') {
      // Prioridade de grupos conforme edital SIS
      
      // GRUPO K - Interior AM (tem prioridade sobre todos os outros)
      if (dadosCotas.interiorAmazonas && dadosCotas.amazonense) {
        novaCota = 'GRUPO K';
      }
      // Grupos do Amazonas (F, G, H, I, J)
      else if (dadosCotas.amazonense) {
        // GRUPO J - Indígenas AM
        if (dadosCotas.indigena) {
          novaCota = 'GRUPO J';
        }
        // GRUPO I - Pretos AM
        else if (dadosCotas.preto) {
          novaCota = 'GRUPO I';
        }
        // GRUPO H - PCD AM
        else if (dadosCotas.pcd) {
          novaCota = 'GRUPO H';
        }
        // GRUPO F - Escola Pública AM
        else if (dadosCotas.escolaPublica) {
          novaCota = 'GRUPO F';
        }
        // GRUPO G - Qualquer Escola AM
        else {
          novaCota = 'GRUPO G';
        }
      }
      // Grupos Gerais (A, B, C, D, E)
      else {
        // GRUPO E - Indígenas (Geral)
        if (dadosCotas.indigena) {
          novaCota = 'GRUPO E';
        }
        // GRUPO D - Pretos (Geral)
        else if (dadosCotas.preto) {
          novaCota = 'GRUPO D';
        }
        // GRUPO C - PCD (Geral)
        else if (dadosCotas.pcd) {
          novaCota = 'GRUPO C';
        }
        // GRUPO A - Escola Pública (Geral)
        else if (dadosCotas.escolaPublica) {
          novaCota = 'GRUPO A';
        }
        // GRUPO B - Qualquer Escola (Geral)
        else {
          novaCota = 'GRUPO B';
        }
      }
    } else if (processoSelecionado === 'ENEM') {
      if (dadosCotas.pcd) {
        novaCota = 'PCD';
      } else if (dadosCotas.preto || dadosCotas.indigena) {
        novaCota = 'PPI';
      } else if (dadosCotas.escolaPublica) {
        novaCota = 'Escola Pública';
      }
    }
    
    setCotaDeterminada(novaCota);
  }, [processoSelecionado, dadosCotas]);

  // Calcular nota total
  useEffect(() => {
    let total = 0;
    
    if (processoSelecionado === 'PSC') {
      // Cálculo direto do PSC sem divisão por 54 ou multiplicação por 10
      const acertosPSC1 = parseFloat(String(notas['PSC 1'])) || 0;
      const acertosPSC2 = parseFloat(String(notas['PSC 2'])) || 0;
      const acertosPSC3 = parseFloat(String(notas['PSC 3'])) || 0;
      const notaRedacao = parseFloat(String(notas['Redação'])) || 0;
      
      // Fórmula: soma dos acertos multiplicados por 3 mais redação multiplicada por 6
      const notaFinal = (acertosPSC1 * 3) + (acertosPSC2 * 3) + (acertosPSC3 * 3) + (notaRedacao * 6);
      total = parseFloat(notaFinal.toFixed(3));
    } else if (processoSelecionado === 'MACRO') {
      const dia1 = (notas['Dia 1 (0-84)'] || 0) * 100 / 84;
      const dia2 = (notas['Dia 2 (0-36)'] || 0) * 2 + (notas['Redação (0-28)'] || 0);
      const notaFinal = (dia1 + dia2) / 2;
      total = parseFloat(notaFinal.toFixed(3));
    } else if (processoSelecionado === 'SIS') {
      // SIS: 3 provas de 60 questões (1 ponto cada) + 2 redações (0-10 com peso 2)
      const prova1 = notas['SIS 1'] || 0; // 0-60 pontos
      const prova2 = notas['SIS 2'] || 0; // 0-60 pontos
      const prova3 = notas['SIS 3'] || 0; // 0-60 pontos
      const redacao2 = (notas['Redação SIS 2'] || 0) * 2; // 0-10 * peso 2 = 0-20 pontos
      const redacao3 = (notas['Redação SIS 3'] || 0) * 2; // 0-10 * peso 2 = 0-20 pontos
      
      const resultado = prova1 + prova2 + prova3 + redacao2 + redacao3;
      total = parseFloat(resultado.toFixed(3));
    } else if (processoSelecionado === 'ENEM') {
      const somaNotas = Object.values(notas).reduce((acc, nota) => acc + (nota || 0), 0);
      const camposPreenchidos = Object.values(notas).filter(nota => nota > 0).length;
      const resultado = camposPreenchidos > 0 ? somaNotas / camposPreenchidos : 0;
      total = parseFloat(resultado.toFixed(3));
    }
    
    setNotaTotal(total);
  }, [notas, processoSelecionado]);

  // Filtrar cursos com debounce para melhor performance
  const cursosFiltrados = useMemo(() => {
    if (!debouncedSearchTerm) return cursosOrdenados;
    return cursosOrdenados.filter(curso => 
      curso.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [cursosOrdenados, debouncedSearchTerm]);

  // Calcular resultados para todos os cursos
  const resultadosPorCurso = useMemo((): ResultadoCurso[] => {
    // Primeiro calcular os resultados para os cursos filtrados
    const resultados = cursosFiltrados.map(curso => {
      let notaCorte = 0;
      let turno: string | undefined = undefined;
      let cidade: string | undefined = undefined;
      let campus: string | undefined = undefined;
      
      // Para MACRO, obter dados detalhados incluindo turno e cidade
      if (processoSelecionado === 'MACRO') {
        const dadosMacro = obterDadosMacro(curso, cotaDeterminada);
        if (dadosMacro) {
          notaCorte = dadosMacro.nota;
          turno = dadosMacro.turno;
          cidade = dadosMacro.cidade;
        }
      } 
      // Para SIS, obter dados detalhados incluindo turno e campus
      else if (processoSelecionado === 'SIS') {
        const dadosSis = obterDadosSis(curso, cotaDeterminada);
        if (dadosSis) {
          notaCorte = dadosSis.nota;
          turno = dadosSis.turno;
          campus = dadosSis.campus;
        }
      } else {
        // Para outros processos, usar o mapa existente
        notaCorte = notasMap[processoSelecionado]?.[cotaDeterminada]?.[curso] || 0;
      }
      
      const diferenca = notaTotal - notaCorte;
      const aprovado = notaTotal >= notaCorte && notaCorte > 0;
      const percentual = notaCorte > 0 ? ((notaTotal / notaCorte) * 100) : 0;
      
      return {
        curso,
        notaCorte: notaCorte || 'Sem vagas ou aprovados na última edição', // Mostrar mensagem se não disponível
        diferenca,
        aprovado,
        percentual,
        turno,
        cidade,
        campus
      };
    });
    
    // Separar cursos aprovados e não aprovados
    const cursosAprovados = resultados
      .filter(curso => curso.aprovado)
      .sort((a, b) => {
        // Ordenar por nota de corte decrescente
        const notaA = typeof a.notaCorte === 'number' ? a.notaCorte : 0;
        const notaB = typeof b.notaCorte === 'number' ? b.notaCorte : 0;
        return notaB - notaA;
      });
      
    const cursosReprovados = resultados
      .filter(curso => !curso.aprovado)
      .sort((a, b) => {
        // Ordenar por nota de corte decrescente
        const notaA = typeof a.notaCorte === 'number' ? a.notaCorte : 0;
        const notaB = typeof b.notaCorte === 'number' ? b.notaCorte : 0;
        return notaB - notaA;
      });
    
    // Retornar cursos ordenados: primeiro aprovados, depois reprovados
    return [...cursosAprovados, ...cursosReprovados];
  }, [processoSelecionado, cotaDeterminada, notaTotal, cursosFiltrados]);

  const handleNotaChange = (campo: string, valor: string) => {
    let numero = parseFloat(valor) || 0;
    
    // Validação específica para campos PSC (máximo 54)
    if (campo.includes('PSC')) {
      numero = Math.min(54, Math.max(0, Math.round(numero)));
    }
    // Validação específica para redação
    else if (campo.includes('Redação')) {
      if (campo.includes('(0-28)')) {
        numero = Math.min(28, Math.max(0, numero)); // MACRO
      } else if (campo.includes('SIS')) {
        numero = Math.min(10, Math.max(0, numero)); // SIS
      } else {
        numero = Math.min(9, Math.max(0, numero)); // PSC
      }
    }
    // Validação específica para campos MACRO
    else if (campo.includes('Dia 1')) {
      numero = Math.min(84, Math.max(0, numero));
    }
    else if (campo.includes('Dia 2')) {
      numero = Math.min(36, Math.max(0, numero));
    }
    // Validação específica para campos SIS
    else if (campo.includes('SIS')) {
      numero = Math.min(60, Math.max(0, Math.round(numero)));
    }
    
    setNotas(prev => ({ ...prev, [campo]: numero }));
  };

  const handleMacroBlur = (campo: string, valor: string) => {
    let numero = parseFloat(valor);
    if (isNaN(numero) || numero < 0) {
      numero = 0;
    } else if (campo.includes('Dia 1') && numero > 84) {
      numero = 84;
    } else if (campo.includes('Dia 2') && numero > 36) {
      numero = 36;
    } else if (campo.includes('Redação') && numero > 28) {
      numero = 28;
    }
    setNotas(prev => ({ ...prev, [campo]: numero }));
  };

  const handleReset = () => {
    setNotas({});
    setSearchTerm('');
    setDadosCotas({
      escolaPublica: false,
      baixaRenda: false,
      preto: false,
      indigena: false,
      pcd: false,
      quilombola: false,
      amazonense: false,
      interiorAmazonas: false,
      portadorDiploma: false
    });
  };

  const camposNota = CAMPOS_POR_PROCESSO[processoSelecionado];

  return (
    <div className={`w-full max-w-7xl mx-auto ${resultadosPorCurso.length > 0 ? 'pb-20 md:pb-0' : ''}`}>
      {/* Header - removido conforme solicitado */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Coluna Esquerda - Inputs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl p-4 sm:p-6"
        >
          {/* Seleção de Processo - título removido */}
          <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROCESSOS.map(processo => {
                const isDisabled = processo === 'ENEM';
                return (
                  <button
                    key={processo}
                    onClick={() => {
                      if (!isDisabled) {
                        setProcessoSelecionado(processo);
                        setNotas({});
                      }
                    }}
                    disabled={isDisabled}
                    className={`min-h-[48px] py-3 px-4 rounded-xl font-medium transition-all w-full flex items-center justify-center ${
                      isDisabled
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500'
                        : processoSelecionado === processo
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isDisabled && <Lock className="w-4 h-4 mr-2" />}
                    {processo === 'ENEM' ? 'ENEM (Em breve)' : processo}
                  </button>
                );
              })}
            </div>
          </div>


          <div className="mb-6 bg-gray-50 p-6 rounded-xl">
            <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
              <User className="mr-2 text-green-600" />
              DEFINA SUA COTA
            </h3>
            
            <div className="space-y-4">
              {/* Campos específicos do MACRO e SIS */}
              {(processoSelecionado === 'MACRO' || processoSelecionado === 'SIS') && (
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  {/* Amazonense */}
                  <label className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dadosCotas.amazonense}
                      onChange={(e) => {
                        setDadosCotas({
                          ...dadosCotas,
                          amazonense: e.target.checked,
                          interiorAmazonas: e.target.checked ? dadosCotas.interiorAmazonas : false
                        });
                      }}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700 font-medium">Sou do estado do Amazonas</span>
                  </label>

                  {/* Interior do Amazonas */}
                  {dadosCotas.amazonense && (
                    <label className="flex items-center space-x-3 p-3 ml-6 bg-white rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dadosCotas.interiorAmazonas}
                        onChange={(e) => setDadosCotas({...dadosCotas, interiorAmazonas: e.target.checked})}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700">Sou do interior do Amazonas</span>
                    </label>
                  )}

                  {/* Portador de Diploma - apenas MACRO */}
                  {processoSelecionado === 'MACRO' && (
                    <label className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dadosCotas.portadorDiploma}
                        onChange={(e) => setDadosCotas({...dadosCotas, portadorDiploma: e.target.checked})}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700 font-medium">Possuo diploma de graduação</span>
                    </label>
                  )}
                </div>
              )}

              {/* Escola Pública */}
              <label className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={dadosCotas.escolaPublica}
                  onChange={(e) => setDadosCotas({...dadosCotas, escolaPublica: e.target.checked})}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <School className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 font-medium">Cursei todo o ensino médio em escola pública</span>
              </label>

              {/* Baixa Renda - apenas PSC com escola pública */}
              {dadosCotas.escolaPublica && processoSelecionado === 'PSC' && (
                <label className="flex items-center space-x-3 p-3 ml-6 bg-white rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dadosCotas.baixaRenda}
                    onChange={(e) => setDadosCotas({...dadosCotas, baixaRenda: e.target.checked})}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700">Renda per capita ≤ 1,5 salário mínimo</span>
                </label>
              )}

              {/* Declaração étnico-racial */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-3">Como você se declara?</p>
                
                <div className="space-y-3">
                  {/* Preto/Pardo */}
                  <label className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dadosCotas.preto}
                      onChange={(e) => setDadosCotas({...dadosCotas, preto: e.target.checked})}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700">
                      {processoSelecionado === 'MACRO' || processoSelecionado === 'SIS' ? 'Preto(a)' : 'Preto(a) ou Pardo(a)'}
                    </span>
                  </label>

                  {/* Indígena */}
                  <label className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dadosCotas.indigena}
                      onChange={(e) => setDadosCotas({...dadosCotas, indigena: e.target.checked})}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700">Indígena</span>
                  </label>
                </div>
              </div>

              {/* PCD */}
              <label className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={dadosCotas.pcd}
                  onChange={(e) => setDadosCotas({...dadosCotas, pcd: e.target.checked})}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <Heart className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 font-medium">Pessoa com deficiência (PCD)</span>
              </label>

              {/* Quilombola - apenas PSC */}
              {processoSelecionado === 'PSC' && (
                <label className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dadosCotas.quilombola}
                    onChange={(e) => setDadosCotas({...dadosCotas, quilombola: e.target.checked})}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700 font-medium">Quilombola</span>
                </label>
              )}
            </div>

            {/* Cota determinada */}
            <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-200">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Sua cota:</span>{' '}
                <span className="font-bold text-green-800">{cotaDeterminada}</span>
              </p>
              {(processoSelecionado === 'PSC' || processoSelecionado === 'SIS') && DESCRICOES_COTA[cotaDeterminada] && (
                <p className="text-xs text-gray-600 mt-1">{DESCRICOES_COTA[cotaDeterminada]}</p>
              )}
            </div>
          </div>

          {/* Campos de Notas */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calculator size={20} className="text-green-600" />
              Insira suas Notas
            </h3>
            
            {/* Layout especial para PSC - Grid 2x2 no mobile */}
            {processoSelecionado === 'PSC' ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                {camposNota.map((campo, index) => (
                  <div key={campo.label} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      {campo.label === 'PSC 1' ? 'Etapa 1' :
                       campo.label === 'PSC 2' ? 'Etapa 2' :
                       campo.label === 'PSC 3' ? 'Etapa 3' :
                       campo.label === 'Redação' ? 'Redação' :
                       campo.label}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        pattern="[0-9]*"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        value={notas[campo.label] || ''}
                        onChange={(e) => handleNotaChange(campo.label, e.target.value)}
                        onFocus={(e) => {
                          e.target.setAttribute('readonly', 'true');
                          setTimeout(() => {
                            e.target.removeAttribute('readonly');
                          }, 100);
                        }}
                        min={0}
                        max={campo.label.includes('PSC') ? 54 : campo.label.includes('Redação') ? (campo.label.includes('(0-28)') ? 28 : 9) : campo.max}
                        step={campo.label.includes('Redação') ? 0.1 : 1}
                        className="w-full px-3 py-2 pr-12 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-0 transition-colors text-base"
                        placeholder={`0-${campo.label.includes('PSC') ? 54 : campo.label.includes('Redação') ? (campo.label.includes('(0-28)') ? 28 : 9) : campo.max}`}
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-medium">
                        /{campo.label.includes('PSC') ? 54 : campo.label.includes('Redação') ? (campo.label.includes('(0-28)') ? 28 : 9) : campo.max}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : processoSelecionado === 'MACRO' ? (
              // Layout especial para MACRO - Duas linhas
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                {/* Primeira linha: Dia 1 e Dia 2 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dia 1 (0-84)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      min="0"
                      max="84"
                      step="0.001"
                      value={notas['Dia 1 (0-84)'] || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value > 84) {
                          handleNotaChange('Dia 1 (0-84)', '84');
                        } else if (value < 0) {
                          handleNotaChange('Dia 1 (0-84)', '0');
                        } else {
                          handleNotaChange('Dia 1 (0-84)', e.target.value);
                        }
                      }}
                      onFocus={(e) => {
                        e.target.setAttribute('readonly', 'true');
                        setTimeout(() => {
                          e.target.removeAttribute('readonly');
                        }, 100);
                      }}
                      onBlur={(e) => handleMacroBlur('Dia 1 (0-84)', e.target.value)}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0.000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dia 2 (0-36)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      min="0"
                      max="36"
                      step="0.001"
                      value={notas['Dia 2 (0-36)'] || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value > 36) {
                          handleNotaChange('Dia 2 (0-36)', '36');
                        } else if (value < 0) {
                          handleNotaChange('Dia 2 (0-36)', '0');
                        } else {
                          handleNotaChange('Dia 2 (0-36)', e.target.value);
                        }
                      }}
                      onFocus={(e) => {
                        e.target.setAttribute('readonly', 'true');
                        setTimeout(() => {
                          e.target.removeAttribute('readonly');
                        }, 100);
                      }}
                      onBlur={(e) => handleMacroBlur('Dia 2 (0-36)', e.target.value)}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0.000"
                    />
                  </div>
                </div>
                
                {/* Segunda linha: Redação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Redação (0-28)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    min="0"
                    max="28"
                    step="0.001"
                    value={notas['Redação (0-28)'] || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value > 28) {
                        handleNotaChange('Redação (0-28)', '28');
                      } else if (value < 0) {
                        handleNotaChange('Redação (0-28)', '0');
                      } else {
                        handleNotaChange('Redação (0-28)', e.target.value);
                      }
                    }}
                    onFocus={(e) => {
                      e.target.setAttribute('readonly', 'true');
                      setTimeout(() => {
                        e.target.removeAttribute('readonly');
                      }, 100);
                    }}
                    onBlur={(e) => handleMacroBlur('Redação (0-28)', e.target.value)}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0.000"
                  />
                </div>
              </motion.div>
            ) : processoSelecionado === 'SIS' ? (
              // Layout especial para SIS
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                {/* Provas */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SIS 1 (0-60)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      min="0"
                      max="60"
                      step="1"
                      value={notas['SIS 1'] || ''}
                      onChange={(e) => handleNotaChange('SIS 1', e.target.value)}
                      onFocus={(e) => {
                        e.target.setAttribute('readonly', 'true');
                        setTimeout(() => {
                          e.target.removeAttribute('readonly');
                        }, 100);
                      }}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SIS 2 (0-60)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      min="0"
                      max="60"
                      step="1"
                      value={notas['SIS 2'] || ''}
                      onChange={(e) => handleNotaChange('SIS 2', e.target.value)}
                      onFocus={(e) => {
                        e.target.setAttribute('readonly', 'true');
                        setTimeout(() => {
                          e.target.removeAttribute('readonly');
                        }, 100);
                      }}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SIS 3 (0-60)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      min="0"
                      max="60"
                      step="1"
                      value={notas['SIS 3'] || ''}
                      onChange={(e) => handleNotaChange('SIS 3', e.target.value)}
                      onFocus={(e) => {
                        e.target.setAttribute('readonly', 'true');
                        setTimeout(() => {
                          e.target.removeAttribute('readonly');
                        }, 100);
                      }}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0-60"
                    />
                  </div>
                </div>
                
                {/* Redações */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Redação SIS 2 (0-10)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      min="0"
                      max="10"
                      step="0.1"
                      value={notas['Redação SIS 2'] || ''}
                      onChange={(e) => handleNotaChange('Redação SIS 2', e.target.value)}
                      onFocus={(e) => {
                        e.target.setAttribute('readonly', 'true');
                        setTimeout(() => {
                          e.target.removeAttribute('readonly');
                        }, 100);
                      }}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0.0-10.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Redação SIS 3 (0-10)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      min="0"
                      max="10"
                      step="0.1"
                      value={notas['Redação SIS 3'] || ''}
                      onChange={(e) => handleNotaChange('Redação SIS 3', e.target.value)}
                      onFocus={(e) => {
                        e.target.setAttribute('readonly', 'true');
                        setTimeout(() => {
                          e.target.removeAttribute('readonly');
                        }, 100);
                      }}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0.0-10.0"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              // Layout normal para outros processos
              camposNota.map((campo, index) => (
                <motion.div
                  key={campo.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <label className="block text-base font-medium text-gray-800 mb-2">
                    {campo.label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      pattern="[0-9]*"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      value={notas[campo.label] || ''}
                      onChange={(e) => handleNotaChange(campo.label, e.target.value)}
                      onFocus={(e) => {
                        e.target.setAttribute('readonly', 'true');
                        setTimeout(() => {
                          e.target.removeAttribute('readonly');
                        }, 100);
                      }}
                      min={0}
                      max={campo.label.includes('PSC') ? 54 : campo.label.includes('Redação') ? (campo.label.includes('(0-28)') ? 28 : 9) : campo.max}
                      step={campo.label.includes('Redação') ? 0.1 : 1}
                      className="w-full px-4 py-3 pr-20 min-h-[48px] border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-0 transition-colors text-base"
                      placeholder={`0 - ${campo.label.includes('PSC') ? 54 : campo.label.includes('Redação') ? (campo.label.includes('(0-28)') ? 28 : 9) : campo.max}`}
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-base font-medium">
                      /{campo.label.includes('PSC') ? 54 : campo.label.includes('Redação') ? (campo.label.includes('(0-28)') ? 28 : 9) : campo.max}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
            
            {/* Nota Total */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-blue-50 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-800">Nota Total:</span>
                <span className="text-2xl font-bold text-blue-900">{notaTotal.toFixed(3)}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Coluna Direita - Resultados */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl p-4 sm:p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp size={20} className="text-green-600" />
              Suas Chances em Cada Curso
            </span>
            <span className="text-sm text-gray-600">
              {resultadosPorCurso.length} cursos
              {searchTerm && ` (filtrados de ${cursosOrdenados.length})`}
            </span>
          </h3>

          {/* Campo de pesquisa */}
          <div className="mb-4">
            <input
              type="text"
              inputMode="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Pesquisar curso..."
              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            <AnimatePresence>
              {resultadosPorCurso.map((resultado, index) => (
                <motion.div
                  key={resultado.curso}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    resultado.aprovado 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{resultado.curso}</h4>
                      {processoSelecionado === 'MACRO' && resultado.turno && resultado.cidade && (
                        <p className="text-sm text-gray-600 uppercase">
                          {resultado.turno} | {resultado.cidade}
                        </p>
                      )}
                      {processoSelecionado === 'SIS' && resultado.turno && resultado.campus && (
                        <p className="text-sm text-gray-600 uppercase">
                          {resultado.turno} | {resultado.campus}
                        </p>
                      )}
                    </div>
                    {resultado.aprovado ? (
                      <CheckCircle className="text-green-600" size={24} />
                    ) : (
                      <XCircle className="text-red-500" size={24} />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nota de Corte:</span>
                      <p className="font-bold text-gray-900">{resultado.notaCorte}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {resultado.aprovado ? 'Acima por:' : 'Faltam:'}
                      </span>
                      <p className={`font-bold ${
                        resultado.aprovado ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(resultado.diferenca).toFixed(3)} pontos
                      </p>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(resultado.percentual, 100)}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className={`h-full ${
                          resultado.aprovado ? 'bg-green-500' : 'bg-red-400'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {resultado.percentual.toFixed(1)}% da nota de corte
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </motion.div>
      </div>

      {/* Informações */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center text-sm text-gray-500"
      >
        <p>
          💡 Calculadora baseada em notas de corte anteriores. Resultados reais podem variar.
        </p>
      </motion.div>


      {/* Navbar móvel */}
      <MobileNavbar 
        processoSelecionado={processoSelecionado}
        cotaDeterminada={cotaDeterminada}
        notaTotal={notaTotal}
        notas={notas}
        onReset={handleReset}
        hasResults={resultadosPorCurso.length > 0}
      />
    </div>
  );
}