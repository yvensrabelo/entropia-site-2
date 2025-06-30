'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { horariosService } from '@/services/horariosService';
import { descritoresService } from '@/services/descritoresService';

interface Aula {
  id: string;
  tempo: number;
  materia: string;
  turma: string;
  hora_inicio: string;
  hora_fim: string;
  dia_semana: string;
}

interface Descritor {
  aula_id: string;
  descricao: string;
  preenchido_em: string;
  assunto: string;
  professor_id: string;
  observacoes?: string;
  horario_id?: string;
}

export default function DashboardProfessor() {
  const [professor, setProfessor] = useState<any>(null);
  const [aulasHoje, setAulasHoje] = useState<Aula[]>([]);
  const [descritores, setDescritores] = useState<Record<string, Descritor>>({});
  const [descricaoTemp, setDescricaoTemp] = useState<Record<string, string>>({});
  const [minutosDoMes, setMinutosDoMes] = useState<number>(0);
  const [loadingMinutos, setLoadingMinutos] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const inicializar = async () => {
      // Verificar se professor está logado
      const professorLogado = sessionStorage.getItem('professor_logado');
      if (!professorLogado) {
        router.push('/descritor');
        return;
      }

      const prof = JSON.parse(professorLogado);
      setProfessor(prof);

      // Carregar aulas do professor hoje
      await carregarAulasHoje(prof.id);

      // Carregar descritores já preenchidos
      await carregarDescritores();

      // Carregar minutos do mês
      await carregarMinutosDoMes(prof.cpf);
    };
    
    inicializar();
  }, []);

  const carregarAulasHoje = async (professorId: string) => {
    try {
      const horarios = await horariosService.listarHorarios();
      const hoje = new Date();
      const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
      const diaAtual = diasSemana[hoje.getDay()];

      const aulasProf = horarios.filter((h: any) => 
        h.professor_id === professorId && 
        h.dia_semana === diaAtual
      );

      setAulasHoje(aulasProf.sort((a: any, b: any) => a.tempo - b.tempo));
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
    }
  };

  const carregarDescritores = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const descritoresSalvos = await descritoresService.obterDescritoresPorData(hoje);
      // Converter DescritoresDia para Record<string, Descritor>
      const descritoresFormatados: Record<string, Descritor> = {};
      if (descritoresSalvos) {
        Object.entries(descritoresSalvos).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null && 
              'assunto' in value && 'professor_id' in value) {
            // Convert DescritorAula to Descritor
            const descAula = value as any;
            descritoresFormatados[key] = {
              aula_id: key,
              descricao: descAula.assunto || '',
              preenchido_em: new Date().toISOString(),
              assunto: descAula.assunto || '',
              professor_id: descAula.professor_id || '',
              observacoes: descAula.observacoes
            };
          }
        });
      }
      setDescritores(descritoresFormatados);
    } catch (error) {
      console.error('Erro ao carregar descritores:', error);
    }
  };

  const carregarMinutosDoMes = async (professorCpf: string) => {
    setLoadingMinutos(true);
    try {
      const response = await fetch(`/api/professores/minutos?cpf=${professorCpf}`);
      if (response.ok) {
        const data = await response.json();
        setMinutosDoMes(data.minutos || 0);
        console.log('⏱️ [DASHBOARD PROFESSOR] Minutos carregados:', {
          minutos: data.minutos,
          horas: data.horas_estimada,
          professor: data.professor,
          registros: data.periodo?.total_registros
        });
      } else {
        const errorData = await response.json();
        console.error('Erro ao carregar minutos:', errorData.error);
        setMinutosDoMes(0);
      }
    } catch (error) {
      console.error('Erro ao carregar minutos do mês:', error);
      setMinutosDoMes(0);
    } finally {
      setLoadingMinutos(false);
    }
  };

  const podePreencherDescritor = (aula: Aula) => {
    const agora = new Date();
    const [hora, minuto] = aula.hora_fim.split(':').map(Number);
    const fimAula = new Date();
    fimAula.setHours(hora, minuto, 0);
    
    // Pode preencher apenas após o horário de fim da aula
    return agora >= fimAula;
  };

  const salvarDescritor = async (aulaId: string) => {
    const descricao = descricaoTemp[aulaId];
    if (!descricao || descricao.trim() === '') {
      alert('Por favor, preencha a descrição da aula');
      return;
    }

    try {
      const hoje = new Date().toISOString().split('T')[0];
      const descritoresAtuaisSalvos = await descritoresService.obterDescritoresPorData(hoje) || {};
      
      const novoDescritor: Descritor = {
        aula_id: aulaId,
        descricao: descricao.trim(),
        preenchido_em: new Date().toISOString(),
        assunto: descricao.trim(), // Usar descrição como assunto
        professor_id: professor.id,
        horario_id: aulaId // IMPORTANTE: incluir horario_id para mapeamento correto
      };

      // Atualizar com o novo descritor
      const descritoresAtualizados = { ...descritoresAtuaisSalvos, [aulaId]: novoDescritor };
      
      console.log('💾 [DASHBOARD PROFESSOR] Salvando descritor com horario_id:', {
        aulaId,
        horario_id: novoDescritor.horario_id,
        professor_id: novoDescritor.professor_id,
        assunto: novoDescritor.assunto.substring(0, 50) + '...'
      });
      
      await descritoresService.salvarDescritoresPorData(hoje, descritoresAtualizados);
      
      // Atualizar state local
      setDescritores(prev => ({ ...prev, [aulaId]: novoDescritor }));
      setDescricaoTemp({ ...descricaoTemp, [aulaId]: '' });
      
      // Recarregar minutos do mês
      await carregarMinutosDoMes(professor.cpf);
      
      alert('Descritor salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar descritor:', error);
      alert('Erro ao salvar descritor');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('professor_logado');
    router.push('/descritor');
  };

  if (!professor) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Portal do Professor</h1>
            <p className="text-gray-600">Olá, {professor.nome}</p>
            
            {/* Contador de minutos */}
            <div className="mt-3 flex items-center gap-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium">
                ⏱️ Minutos acumulados no mês: {loadingMinutos ? '...' : minutosDoMes}
              </div>
              {minutosDoMes > 0 && (
                <div className="text-xs text-gray-500">
                  ≈ {Math.round(minutosDoMes / 60 * 10) / 10}h
                </div>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Aulas do dia */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Suas aulas de hoje</h2>
        
        {aulasHoje.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Você não tem aulas hoje</p>
        ) : (
          <div className="space-y-4">
            {aulasHoje.map((aula) => {
              const jaPreenchido = descritores[aula.id];
              const podePreencer = podePreencherDescritor(aula);
              
              return (
                <div
                  key={aula.id}
                  className={`border rounded-lg p-6 ${
                    jaPreenchido 
                      ? 'bg-green-50 border-green-300' 
                      : podePreencer
                      ? 'bg-yellow-50 border-yellow-300'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {aula.tempo}º Tempo - {aula.materia}
                      </h3>
                      <p className="text-gray-600">
                        Turma: {aula.turma} | Horário: {aula.hora_inicio} - {aula.hora_fim}
                      </p>
                    </div>
                    <div className="text-right">
                      {jaPreenchido && (
                        <span className="text-green-600 font-medium">✓ Preenchido</span>
                      )}
                      {!jaPreenchido && !podePreencer && (
                        <span className="text-gray-500">Aguardando horário</span>
                      )}
                    </div>
                  </div>

                  {jaPreenchido ? (
                    <div className="bg-white rounded p-4">
                      <p className="text-sm text-gray-600 mb-1">Descritor preenchido:</p>
                      <p className="text-gray-800">{jaPreenchido.descricao}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Preenchido em: {new Date(jaPreenchido.preenchido_em).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ) : podePreencer ? (
                    <div className="space-y-3">
                      <textarea
                        value={descricaoTemp[aula.id] || ''}
                        onChange={(e) => setDescricaoTemp({
                          ...descricaoTemp,
                          [aula.id]: e.target.value
                        })}
                        placeholder="Descreva o conteúdo ministrado na aula..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows={3}
                      />
                      <button
                        onClick={() => salvarDescritor(aula.id)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Salvar Descritor
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded p-4 text-center text-gray-500">
                      O descritor só pode ser preenchido após o início da aula
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}