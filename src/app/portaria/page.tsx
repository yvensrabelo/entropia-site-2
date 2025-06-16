'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Lock, Sun, Cloud, Moon } from 'lucide-react';
import { getDiaAtual, isAulaAtual } from '@/lib/utils/horario-utils';

// Estilos CSS customizados para animações
const customStyles = `
  @keyframes pulse-slow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  
  @keyframes bounce-gentle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }
  
  .animate-bounce-gentle {
    animation: bounce-gentle 2s ease-in-out infinite;
  }
  
  .gradient-bg {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }
`;

interface PortariaLoginProps {
  onSuccess: () => void;
}

interface HorarioAula {
  id: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
  professor_id?: string;
  professor_nome?: string;
  materia: string;
  turma: string;
  sala: string;
  turno: 'manhã' | 'tarde' | 'noite';
  tempo: number;
}

interface AulaInfo {
  tempo: number;
  turma: string;
  materia: string;
  professor?: string;
  sala: string;
  hora_inicio: string;
  hora_fim: string;
  turno: 'manhã' | 'tarde' | 'noite';
  id: string;
}

const PortariaLogin = ({ onSuccess }: PortariaLoginProps) => {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [tentativas, setTentativas] = useState(0);
  
  const verificarCodigo = () => {
    const codigoSalvo = localStorage.getItem('codigo_portaria') || 'PORTARIA';
    if (codigo.toUpperCase() === codigoSalvo) {
      sessionStorage.setItem('portaria_autorizada', 'true');
      onSuccess();
    } else {
      setErro('Código inválido');
      setTentativas(tentativas + 1);
      if (tentativas >= 2) {
        setErro('Código inválido. Entre em contato com o administrador.');
      }
      setTimeout(() => setErro(''), 3000);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verificarCodigo();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-6 rounded-2xl">
            <Lock className="w-12 h-12 text-gray-400" />
          </div>
        </div>
        <h2 className="text-2xl font-light mb-8 text-center text-gray-900 tracking-wide">Acesso Portaria</h2>
        <p className="text-gray-500 text-center mb-8 font-light">
          Digite o código de acesso fornecido pela administração
        </p>
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          placeholder="CÓDIGO"
          className="w-full p-4 border border-gray-200 bg-gray-50 text-gray-900 rounded-2xl text-center text-xl font-mono tracking-wider focus:border-gray-300 focus:outline-none transition-colors"
          maxLength={10}
          autoFocus
        />
        {erro && (
          <p className="text-red-500 text-sm mt-4 text-center bg-red-50 py-3 rounded-xl border border-red-100">
            {erro}
          </p>
        )}
        <button
          onClick={verificarCodigo}
          className="w-full mt-8 bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-medium text-sm tracking-wider transition-all duration-300 uppercase"
        >
          Acessar Sistema
        </button>
      </div>
    </div>
  );
};

const PortariaView = () => {
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [turnoAtual, setTurnoAtual] = useState<'manhã' | 'tarde' | 'noite'>('manhã');
  const [horariosOrganizados, setHorariosOrganizados] = useState<Record<string, Record<string, Record<string, AulaInfo[]>>>>({});
  const [horarios, setHorarios] = useState<HorarioAula[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [chegadas, setChegadas] = useState<Record<string, string>>({});
  const [descritores, setDescritores] = useState<Record<string, boolean>>({});
  const [atrasos, setAtrasos] = useState<Record<string, boolean>>({});
  const [descritoresDia, setDescritoresDia] = useState<Record<string, any>>({});

  // Atualizar relógio
  useEffect(() => {
    const timer = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determinar turno baseado na hora atual
  useEffect(() => {
    const hora = horaAtual.getHours();
    if (hora < 12) {
      setTurnoAtual('manhã');
    } else if (hora < 18) {
      setTurnoAtual('tarde');
    } else {
      setTurnoAtual('noite');
    }
  }, [horaAtual]);

  // Função para verificar se é atraso
  const verificarAtraso = (horaInicio: string, horaChegada: string): boolean => {
    const [hInicio, mInicio] = horaInicio.split(':').map(Number);
    const [hChegada, mChegada] = horaChegada.split(':').map(Number);
    
    const minutosInicio = hInicio * 60 + mInicio;
    const minutosChegada = hChegada * 60 + mChegada;
    
    return (minutosChegada - minutosInicio) > 5;
  };


  // Marcar chegada com verificação de atraso
  const marcarChegada = (aulaId: string, horaInicio: string) => {
    const horaChegada = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const novasChegadas = { ...chegadas, [aulaId]: horaChegada };
    setChegadas(novasChegadas);
    
    // Verificar atraso
    const novosAtrasos = { ...atrasos };
    if (verificarAtraso(horaInicio, horaChegada)) {
      novosAtrasos[aulaId] = true;
      setAtrasos(novosAtrasos);
    }
    
    localStorage.setItem(`chegadas_${new Date().toISOString().split('T')[0]}`, JSON.stringify(novasChegadas));
    localStorage.setItem(`atrasos_${new Date().toISOString().split('T')[0]}`, JSON.stringify(novosAtrasos));
  };

  // Desconsiderar atraso
  const desconsiderarAtraso = (aulaId: string) => {
    const novosAtrasos = { ...atrasos };
    delete novosAtrasos[aulaId];
    setAtrasos(novosAtrasos);
    localStorage.setItem(`atrasos_${new Date().toISOString().split('T')[0]}`, JSON.stringify(novosAtrasos));
  };

  // Remover presença
  const removerPresenca = (aulaId: string) => {
    const novasChegadas = { ...chegadas };
    delete novasChegadas[aulaId];
    setChegadas(novasChegadas);
    
    const novosAtrasos = { ...atrasos };
    delete novosAtrasos[aulaId];
    setAtrasos(novosAtrasos);
    
    localStorage.setItem(`chegadas_${new Date().toISOString().split('T')[0]}`, JSON.stringify(novasChegadas));
    localStorage.setItem(`atrasos_${new Date().toISOString().split('T')[0]}`, JSON.stringify(novosAtrasos));
  };

  // Carregar chegadas, atrasos e descritores do dia
  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0];
    
    const chegadasSalvas = localStorage.getItem(`chegadas_${hoje}`);
    if (chegadasSalvas) {
      setChegadas(JSON.parse(chegadasSalvas));
    }
    
    const atrasosSalvos = localStorage.getItem(`atrasos_${hoje}`);
    if (atrasosSalvos) {
      setAtrasos(JSON.parse(atrasosSalvos));
    }
    
    // Carregar descritores
    const descritoresSalvos = localStorage.getItem(`descritores_${hoje}`);
    if (descritoresSalvos) {
      setDescritoresDia(JSON.parse(descritoresSalvos));
      console.log('🏢 [PORTARIA] Descritores carregados:', JSON.parse(descritoresSalvos));
    }
  }, []);

  // Carregar dados
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Atualizar a cada 5 segundos para capturar descritores
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    // Carregar horários
    const storedHorarios = localStorage.getItem('horarios_aulas');
    if (storedHorarios) {
      const horariosData = JSON.parse(storedHorarios);
      setHorarios(horariosData);
      console.log('🏢 [PORTARIA] Horários carregados:', horariosData.length, 'aulas');
      if (horariosData.length > 0) {
        console.log('🏢 [PORTARIA] Estrutura da primeira aula:', {
          dia_semana: horariosData[0].dia_semana,
          turno: horariosData[0].turno,
          tempo: horariosData[0].tempo,
          materia: horariosData[0].materia,
          turma: horariosData[0].turma,
          sala: horariosData[0].sala,
          professor_nome: horariosData[0].professor_nome
        });
      }
    }

    // Carregar professores
    const storedProfessores = localStorage.getItem('professores');
    if (storedProfessores) {
      setProfessores(JSON.parse(storedProfessores));
    }
    
    // Carregar descritores do dia atual
    const hoje = new Date().toISOString().split('T')[0];
    const descritoresSalvos = localStorage.getItem(`descritores_${hoje}`);
    if (descritoresSalvos) {
      setDescritoresDia(JSON.parse(descritoresSalvos));
    }
  };

  // Obter dia da semana atual (em português minúsculo)
  const getDiaDaSemanaAtual = () => {
    return getDiaAtual();
  };

  // Organizar horários
  useEffect(() => {
    organizarHorarios();
  }, [horarios, professores]);

  const organizarHorarios = () => {
    const diaAtual = getDiaDaSemanaAtual();
    const organizado: Record<string, Record<string, Record<string, AulaInfo[]>>> = {
      'manhã': {},
      'tarde': {},
      'noite': {}
    };

    console.log('🏢 [PORTARIA] Organizando horários para:', diaAtual);
    // Filtrar apenas aulas do dia atual
    const aulasHoje = horarios.filter(h => h.dia_semana === diaAtual);
    console.log('🏢 [PORTARIA] Aulas de hoje encontradas:', aulasHoje.length);
    if (aulasHoje.length > 0) {
      console.log('🏢 [PORTARIA] Primeira aula:', aulasHoje[0]);
    }

    aulasHoje.forEach(aula => {
      // Usar turno já calculado
      const turno = aula.turno;
      const sala = aula.sala;
      
      // Inicializar estrutura se necessário
      if (!organizado[turno][sala]) {
        organizado[turno][sala] = {};
      }
      if (!organizado[turno][sala][aula.turma]) {
        organizado[turno][sala][aula.turma] = [];
      }

      // Usar dados já calculados
      const professor = professores.find(p => p.id === aula.professor_id);
      const tempo = aula.tempo;

      const aulaInfo: AulaInfo = {
        tempo,
        turma: aula.turma,
        materia: aula.materia,
        professor: aula.professor_nome || professor?.nome,
        sala,
        hora_inicio: aula.hora_inicio,
        hora_fim: aula.hora_fim,
        turno,
        id: aula.id
      };

      organizado[turno][sala][aula.turma].push(aulaInfo);
    });

    // Ordenar aulas por tempo
    Object.values(organizado).forEach(turno => {
      Object.values(turno).forEach(salas => {
        Object.values(salas).forEach(turmas => {
          turmas.sort((a, b) => a.tempo - b.tempo);
        });
      });
    });

    console.log('🏢 [PORTARIA] Horários organizados por turno:');
    Object.keys(organizado).forEach(turno => {
      const salas = Object.keys(organizado[turno]);
      console.log(`🏢 [PORTARIA] ${turno.toUpperCase()}: ${salas.length} salas`);
      salas.forEach(sala => {
        const turmas = Object.keys(organizado[turno][sala]);
        console.log(`🏢 [PORTARIA]   ${sala}: ${turmas.join(', ')}`);
      });
    });
    setHorariosOrganizados(organizado);
  };

  const getTurnoIcon = (turno: string) => {
    switch (turno) {
      case 'manhã': return <Sun className="w-6 h-6" />;
      case 'tarde': return <Cloud className="w-6 h-6" />;
      case 'noite': return <Moon className="w-6 h-6" />;
      default: return null;
    }
  };

  const isAulaAtualAgora = (aula: AulaInfo) => {
    return isAulaAtual(aula.hora_inicio, aula.hora_fim);
  };

  // Função para determinar cores baseadas no tipo de aula
  const getAulaColors = (aula: AulaInfo, isAtual: boolean) => {
    if (isAtual) {
      return 'bg-yellow-400 text-yellow-900 ring-4 ring-yellow-300 animate-pulse shadow-lg';
    }
    
    // Cores baseadas na matéria
    const materiaColors: Record<string, string> = {
      'Matemática': 'bg-blue-500 text-white',
      'Física': 'bg-purple-500 text-white',
      'Química': 'bg-green-500 text-white',
      'Biologia': 'bg-emerald-500 text-white',
      'História': 'bg-amber-500 text-white',
      'Geografia': 'bg-teal-500 text-white',
      'Português': 'bg-rose-500 text-white',
      'Literatura': 'bg-pink-500 text-white',
      'Inglês': 'bg-indigo-500 text-white',
      'Filosofia': 'bg-slate-500 text-white',
      'Sociologia': 'bg-cyan-500 text-white',
      'Redação': 'bg-orange-500 text-white'
    };
    
    return materiaColors[aula.materia] || 'bg-gray-500 text-white';
  };

  // Verificar se há aulas no turno atual
  const turnoTemAulas = Object.keys(horariosOrganizados[turnoAtual] || {}).length > 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
        
        {/* Container do relógio e botões */}
        <div className="flex items-start justify-center gap-8 mb-12">
          
          {/* Botões de turno - Empilhados à esquerda */}
          <div className="flex flex-col gap-3 mt-8">
            {[
              { nome: 'manhã', icon: '☀️' },
              { nome: 'tarde', icon: '☁️' },
              { nome: 'noite', icon: '🌙' }
            ].map(({ nome, icon }) => (
              <button
                key={nome}
                onClick={() => setTurnoAtual(nome as 'manhã' | 'tarde' | 'noite')}
                className={`
                  px-6 py-4 rounded-xl text-sm font-medium
                  transition-all duration-300 
                  flex items-center gap-2
                  ${turnoAtual === nome 
                    ? 'bg-gray-900 text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:text-gray-900 shadow-sm border border-gray-200'
                  }
                `}
              >
                <span className="text-xl">{icon}</span>
                <span className="uppercase tracking-wider">{nome}</span>
              </button>
            ))}
          </div>
          
          {/* Relógio gigante */}
          <div className="text-center">
            <h1 className="text-9xl font-extralight text-gray-900 tracking-tight tabular-nums">
              {horaAtual.toLocaleTimeString('pt-BR')}
            </h1>
            <p className="text-2xl mt-4 text-gray-500 font-light">
              {horaAtual.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        </div>

        {/* Container principal */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-7xl mx-auto">
          
          {/* Título do turno */}
          <div className="text-center mb-10">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              {turnoAtual} · {getDiaDaSemanaAtual()}
            </h2>
          </div>
        
          {!turnoTemAulas ? (
            <div className="text-center py-16">
              <Calendar className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-light">
                Nenhuma aula programada para o turno da {turnoAtual}
              </p>
            </div>
          ) : (
            /* Grid de salas */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Object.entries(horariosOrganizados[turnoAtual] || {}).map(([sala, turmas]) => (
                <div key={sala} className="space-y-6">
                  
                  {/* Cabeçalho da Sala */}
                  <div className="text-center">
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
                      Sala
                    </h3>
                    <div className="text-3xl font-light text-gray-900">
                      {sala.replace('Sala ', '')}
                    </div>
                  </div>
                  
                  {Object.entries(turmas).map(([turma, aulas]) => (
                    <div key={turma} className="space-y-3">
                      
                      {/* Nome da Turma */}
                      <div className="text-center pb-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-700">
                          {turma}
                        </div>
                      </div>
                      
                      {/* Aulas */}
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map(tempo => {
                          const aula = aulas.find(a => a.tempo === tempo);
                          
                          if (!aula && tempo === 4 && turnoAtual === 'noite') {
                            return null;
                          }
                          
                          const aulaId = aula ? aula.id : null;
                          const professorChegou = aulaId && chegadas[aulaId];
                          const estaAtrasado = aulaId && atrasos[aulaId];
                          const descritorPreenchido = aulaId && descritoresDia[aulaId];
                          const aulaAcontecendo = aula && isAulaAtualAgora(aula);
                          
                          // Sistema de cores baseado em status
                          const getClassNames = () => {
                            if (!aula) {
                              return 'bg-gray-50 border-gray-200 text-gray-400';
                            }
                            // PRIORIDADE: Descritor preenchido = VERDE
                            if (descritorPreenchido) {
                              return 'bg-green-50 border-green-300 text-green-900';
                            }
                            if (estaAtrasado) {
                              return 'bg-orange-50 border-orange-300 text-orange-900';
                            }
                            if (professorChegou) {
                              return 'bg-blue-50 border-blue-200 text-blue-900';
                            }
                            if (aulaAcontecendo) {
                              return 'bg-yellow-50 border-yellow-300 text-yellow-900';
                            }
                            return 'bg-gray-50 border-gray-200 text-gray-600';
                          };
                          
                          return (
                            <div
                              key={tempo}
                              className={`
                                relative rounded-xl border-2 p-4
                                transition-all duration-300
                                ${getClassNames()}
                              `}
                            >
                              {aula ? (
                                <>
                                  {/* Badge do tempo */}
                                  <div className="absolute -top-3 left-3 bg-white px-2 py-0.5 rounded-full">
                                    <span className="text-xs font-bold text-gray-600">
                                      {tempo}º
                                    </span>
                                  </div>
                                  
                                  {/* Conteúdo da aula */}
                                  <div className="space-y-1">
                                    <div className="font-semibold text-sm flex items-center gap-2">
                                      {aula.materia}
                                      {estaAtrasado && <span className="text-orange-600">⚠️</span>}
                                      {descritorPreenchido && <span className="text-green-600" title="Descritor preenchido">📝✓</span>}
                                    </div>
                                    <div className="text-xs opacity-80">
                                      {aula.professor}
                                    </div>
                                    <div className="text-xs opacity-60">
                                      {aula.hora_inicio} - {aula.hora_fim}
                                    </div>
                                    
                                    {professorChegou && (
                                      <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs font-medium">
                                          {estaAtrasado ? '⚠️ Atrasado' : '✓'} {chegadas[aulaId]}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Botões de ação */}
                                  <div className="absolute -top-2 -right-2 flex gap-1">
                                    {!professorChegou && (
                                      <button
                                        onClick={() => marcarChegada(`${sala}-${turma}-${tempo}`, aula.hora_inicio)}
                                        className="
                                          w-8 h-8 bg-white rounded-full 
                                          shadow-sm border border-gray-200
                                          flex items-center justify-center
                                          hover:bg-green-50 hover:border-green-300
                                          transition-all group
                                        "
                                        title="Marcar chegada"
                                      >
                                        <span className="text-sm">✓</span>
                                      </button>
                                    )}
                                    
                                    {professorChegou && estaAtrasado && (
                                      <button
                                        onClick={() => desconsiderarAtraso(`${sala}-${turma}-${tempo}`)}
                                        className="
                                          w-8 h-8 bg-white rounded-full 
                                          shadow-sm border border-gray-200
                                          flex items-center justify-center
                                          hover:bg-blue-50 hover:border-blue-300
                                          transition-all
                                        "
                                        title="Desconsiderar atraso"
                                      >
                                        <span className="text-xs">👍</span>
                                      </button>
                                    )}
                                    
                                    {professorChegou && (
                                      <button
                                        onClick={() => removerPresenca(`${sala}-${turma}-${tempo}`)}
                                        className="
                                          w-8 h-8 bg-white rounded-full 
                                          shadow-sm border border-gray-200
                                          flex items-center justify-center
                                          hover:bg-red-50 hover:border-red-300
                                          transition-all
                                        "
                                        title="Remover presença"
                                      >
                                        <span className="text-xs">✕</span>
                                      </button>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className="text-center py-2">
                                  <span className="text-xs font-medium opacity-50">
                                    {tempo}º tempo livre
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
      </div>

        {/* Legenda atualizada */}
        <div className="flex justify-center gap-6 mt-8 text-xs">
          {[
            { cor: 'bg-green-50 border-green-200', texto: 'Descritor preenchido' },
            { cor: 'bg-yellow-50 border-yellow-300', texto: 'Em andamento' },
            { cor: 'bg-blue-50 border-blue-200', texto: 'Professor presente' },
            { cor: 'bg-orange-50 border-orange-300', texto: 'Atrasado' },
            { cor: 'bg-gray-50 border-gray-200', texto: 'Livre' }
          ].map(({ cor, texto }) => (
            <div key={texto} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded border-2 ${cor}`}></div>
              <span className="text-gray-600">{texto}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default function PortariaPage() {
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    // Verificar se já está autorizado
    const auth = sessionStorage.getItem('portaria_autorizada');
    if (auth === 'true') {
      setAutorizado(true);
    }

    // Adicionar listener para tecla ESC
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sessionStorage.removeItem('portaria_autorizada');
        setAutorizado(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!autorizado) {
    return <PortariaLogin onSuccess={() => setAutorizado(true)} />;
  }

  return <PortariaView />;
}