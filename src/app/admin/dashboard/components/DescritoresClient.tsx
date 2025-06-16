'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Download, Send, RefreshCw, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { TURMAS_REAIS, getTurmasNomes } from '@/config/turmas';
import './descritores.css';

interface Descritor {
  texto: string;
  professorId: string;
  professorNome: string;
  dataHora: string;
  turma: string;
  materia: string;
  dia: string;
  horario: string;
  tempo?: number;
  preenchido_em?: string;
}

interface Horario {
  id: string;
  dia: string;
  horaInicio: string;
  horaFim: string;
  turma: string;
  materia: string;
  professorId?: string;
  sala?: string;
}

interface Professor {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  materias: string[];
  ativo: boolean;
}

export default function DescritoresClient() {
  const [mounted, setMounted] = useState(false);
  const [descritores, setDescritores] = useState<Record<string, Descritor>>({});
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [activeTab, setActiveTab] = useState<'todos' | 'pendentes' | 'concluidos'>('todos');
  const [viewMode, setViewMode] = useState<'turma' | 'lista'>('turma');
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para evitar erro de hidratação
  const [currentDate, setCurrentDate] = useState("");
  const [downloadDate, setDownloadDate] = useState("");

  // useEffect para definir datas no cliente (evitar hidratação)
  useEffect(() => {
    const now = new Date()
    setCurrentDate(now.toLocaleDateString("pt-BR"))
    setDownloadDate(now.toISOString().split("T")[0])
  }, [])

  // Número de WhatsApp para teste
  const WHATSAPP_TEST_NUMBER = '5592981662806';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadData = () => {
      setIsUpdating(true);
      
      try {
        // Carregar descritores do novo sistema do professor (por data)
        const hoje = new Date().toISOString().split('T')[0];
        const descritoresHoje = localStorage.getItem(`descritores_${hoje}`);
        let descritoresCarregados = {};
        
        if (descritoresHoje) {
          descritoresCarregados = JSON.parse(descritoresHoje);
        } else {
          // Fallback para o sistema antigo
          const storedDescritores = localStorage.getItem('descritores');
          if (storedDescritores) {
            descritoresCarregados = JSON.parse(storedDescritores);
          }
        }
        
        setDescritores(descritoresCarregados);

        // Carregar horários (novo formato)
        const storedHorarios = localStorage.getItem('horarios_aulas');
        if (storedHorarios) {
          // Converter formato novo para antigo para compatibilidade
          const horariosNovos = JSON.parse(storedHorarios);
          const horariosConvertidos = horariosNovos.map((h: any) => ({
            id: h.id,
            dia: h.dia_semana,
            horaInicio: h.hora_inicio,
            horaFim: h.hora_fim,
            turma: h.turma,
            materia: h.materia,
            professorId: h.professor_id,
            sala: h.sala
          }));
          setHorarios(horariosConvertidos);
        } else {
          // Fallback para formato antigo
          const storedHorariosAntigos = localStorage.getItem('horarios');
          if (storedHorariosAntigos) {
            setHorarios(JSON.parse(storedHorariosAntigos));
          }
        }

        // Carregar professores (novo formato)
        const storedProfessors = localStorage.getItem('professores');
        if (storedProfessors) {
          // Converter formato novo para antigo para compatibilidade
          const professoresNovos = JSON.parse(storedProfessors);
          const professoresConvertidos = professoresNovos.map((p: any) => ({
            id: p.id,
            nome: p.nome,
            cpf: p.cpf,
            email: p.email,
            materias: p.materias || [],
            ativo: p.status === 'ativo'
          }));
          setProfessors(professoresConvertidos);
        } else {
          // Fallback para formato antigo
          const storedProfessorsAntigos = localStorage.getItem('professors');
          if (storedProfessorsAntigos) {
            setProfessors(JSON.parse(storedProfessorsAntigos));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setTimeout(() => setIsUpdating(false), 500);
      }
    };

    // Carregar imediatamente
    loadData();

    // Atualizar a cada 5 segundos
    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, [mounted]);

  // Não renderizar no servidor
  if (!mounted) {
    return (
      <div className="descritores-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando descritores...</p>
        </div>
      </div>
    );
  }

  // Agrupar por turma com detalhes completos
  const getTurmasComProgresso = () => {
    const turmasMap: Record<string, {
      aulas: Horario[];
      descritoresPreenchidos: number;
      total: number;
      professoresAguardando: Array<{
        nome: string;
        materia: string;
        horario: string;
        dia: string;
      }>;
    }> = {};

    // Agrupar aulas por turma
    horarios.forEach(aula => {
      if (!turmasMap[aula.turma]) {
        turmasMap[aula.turma] = {
          aulas: [],
          descritoresPreenchidos: 0,
          total: 0,
          professoresAguardando: []
        };
      }

      turmasMap[aula.turma].aulas.push(aula);
      turmasMap[aula.turma].total++;

      if (descritores[aula.id]) {
        turmasMap[aula.turma].descritoresPreenchidos++;
      } else if (aula.professorId) {
        const professor = professors.find(p => p.id === aula.professorId);
        if (professor) {
          turmasMap[aula.turma].professoresAguardando.push({
            nome: professor.nome,
            materia: aula.materia,
            horario: `${aula.horaInicio} - ${aula.horaFim}`,
            dia: aula.dia
          });
        }
      }
    });

    return turmasMap;
  };

  // Calcular estatísticas
  const totalAulas = horarios.length;
  const aulasComDescritor = horarios.filter(h => descritores[h.id]).length;
  const aulasSemDescritor = totalAulas - aulasComDescritor;
  const progresso = totalAulas > 0 ? ((aulasComDescritor / totalAulas) * 100).toFixed(1) : '0.0';

  // Filtrar aulas baseado na aba ativa
  const getFilteredAulas = () => {
    switch (activeTab) {
      case 'pendentes':
        return horarios.filter(h => !descritores[h.id] && h.professorId);
      case 'concluidos':
        return horarios.filter(h => descritores[h.id]);
      default:
        return horarios;
    }
  };

  // Enviar descritor unificado da turma
  const handleEnviarParaAlunos = (turma: string, turmaData: any) => {
    const descritoresDaTurma = turmaData.aulas
      .filter((aula: Horario) => descritores[aula.id])
      .sort((a: Horario, b: Horario) => a.horaInicio.localeCompare(b.horaInicio))
      .map((aula: Horario, index: number) => {
        const descritor = descritores[aula.id];
        const professor = professors.find(p => p.id === aula.professorId);
        
        return `*${index + 1}º Tempo - ${aula.materia}*
⏰ ${aula.horaInicio} - ${aula.horaFim}
👨‍🏫 Prof. ${professor?.nome || 'Não identificado'}

${typeof descritor === 'object' ? descritor.texto : descritor}`;
      });

    if (descritoresDaTurma.length === 0) {
      alert('Nenhum descritor disponível para esta turma ainda.');
      return;
    }

    const mensagem = `📚 *DESCRITORES DE AULAS*
🏫 *Turma:* ${turma}
📅 *Data:* ${currentDate}

${descritoresDaTurma.join('\n\n---\n\n')}

_Entropia Cursinho_`;

    // Abrir WhatsApp com número de teste
    const encoded = encodeURIComponent(mensagem);
    window.open(`https://wa.me/${WHATSAPP_TEST_NUMBER}?text=${encoded}`, '_blank');
  };

  // Enviar via WhatsApp individual
  const handleSendWhatsApp = (aula: Horario) => {
    const descritor = descritores[aula.id];
    if (!descritor) return;

    const professor = professors.find(p => p.id === aula.professorId);
    const textoDescritor = typeof descritor === 'object' ? descritor.texto : descritor;
    
    const mensagem = `
*Descritor da Aula*
📚 *Matéria:* ${aula.materia}
👥 *Turma:* ${aula.turma}
📅 *Dia:* ${aula.dia}
⏰ *Horário:* ${aula.horaInicio} - ${aula.horaFim}
👨‍🏫 *Professor:* ${professor?.nome || 'Não informado'}
${aula.sala ? `🏫 *Sala:* ${aula.sala}` : ''}

📝 *Conteúdo da aula:*
${textoDescritor}

_Entropia Cursinho_
    `.trim();

    const encoded = encodeURIComponent(mensagem);
    window.open(`https://wa.me/${WHATSAPP_TEST_NUMBER}?text=${encoded}`, '_blank');
  };

  // Enviar lembretes
  const handleSendReminders = () => {
    const pendingByProfessor: Record<string, Horario[]> = {};
    
    horarios.forEach(aula => {
      if (!descritores[aula.id] && aula.professorId) {
        if (!pendingByProfessor[aula.professorId]) {
          pendingByProfessor[aula.professorId] = [];
        }
        pendingByProfessor[aula.professorId].push(aula);
      }
    });

    let remindersSent = 0;
    Object.entries(pendingByProfessor).forEach(([profId, aulas]) => {
      const professor = professors.find(p => p.id === profId);
      if (professor) {
        const mensagem = `
Olá, ${professor.nome}!

Você tem ${aulas.length} aula(s) pendente(s) de descritor:

${aulas.map(a => `- ${a.materia} (${a.turma}) - ${a.dia}`).join('\n')}

Por favor, acesse o portal e preencha os descritores.

Link: ${window.location.origin}/descritor

Atenciosamente,
Coordenação Entropia
        `.trim();
        
        console.log(`Lembrete para ${professor.nome}:`, mensagem);
        remindersSent++;
      }
    });

    alert(`${remindersSent} lembrete(s) enviado(s) com sucesso!`);
  };

  // Lembrar professor específico
  const handleLembrarProfessor = (aula: Horario) => {
    const professor = professors.find(p => p.id === aula.professorId);
    if (!professor) return;

    const mensagem = `
Olá, ${professor.nome}!

Lembrete: Você tem uma aula pendente de descritor:

- ${aula.materia} (${aula.turma})
- ${aula.dia}, ${aula.horaInicio} - ${aula.horaFim}

Por favor, acesse o portal e preencha o descritor.

Link: ${window.location.origin}/descritor

Atenciosamente,
Coordenação Entropia
    `.trim();

    // Abrir WhatsApp com número de teste
    const encoded = encodeURIComponent(mensagem);
    window.open(`https://wa.me/${WHATSAPP_TEST_NUMBER}?text=${encoded}`, '_blank');
    
    console.log(`Lembrete individual para ${professor.nome}:`, mensagem);
  };

  // Exportar relatório
  const handleExportReport = () => {
    const report = horarios.map(h => {
      const professor = professors.find(p => p.id === h.professorId);
      const descritor = descritores[h.id];
      return {
        Dia: h.dia,
        Horário: `${h.horaInicio} - ${h.horaFim}`,
        Turma: h.turma,
        Matéria: h.materia,
        Professor: professor?.nome || 'Não atribuído',
        'Tem Descritor': descritor ? 'Sim' : 'Não',
        Descritor: typeof descritor === 'object' ? descritor.texto : (descritor || '')
      };
    });

    const csv = [
      Object.keys(report[0]).join(','),
      ...report.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `descritores_${downloadDate}.csv`;
    a.click();
  };

  const filteredAulas = getFilteredAulas();
  const turmasComProgresso = getTurmasComProgresso();

  return (
    <div className="descritores-container">
      <div className="descritores-header">
        <div className="header-title">
          <h2>Descritores</h2>
          <p>Gerencie os descritores das aulas</p>
        </div>
        
        <div className="header-actions">
          <div className="live-indicator">
            <span className="pulse"></span>
            <span>Atualização automática</span>
          </div>
          <button className="btn-action primary" onClick={handleSendReminders}>
            <Bell className="w-4 h-4" />
            Enviar Lembretes
          </button>
          <button className="btn-action success" onClick={handleExportReport}>
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total de Aulas</span>
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          <div className="stat-value">{totalAulas}</div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-header">
            <span className="stat-label">Com Descritor</span>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div className="stat-value">{aulasComDescritor}</div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-header">
            <span className="stat-label">Sem Descritor</span>
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <div className="stat-value">{aulasSemDescritor}</div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-header">
            <span className="stat-label">Progresso</span>
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          <div className="stat-value">{progresso}%</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-bar">
        <select className="filter-select">
          <option value="">Todos os dias</option>
          <option value="Segunda">Segunda</option>
          <option value="Terça">Terça</option>
          <option value="Quarta">Quarta</option>
          <option value="Quinta">Quinta</option>
          <option value="Sexta">Sexta</option>
        </select>
        
        <select className="filter-select">
          <option value="">Todas as turmas</option>
          {TURMAS_REAIS.filter(t => t.ativa).map(turma => (
            <option key={turma.codigo} value={turma.nome}>
              {turma.nome} ({turma.turno})
            </option>
          ))}
        </select>
        
        <select className="filter-select">
          <option value="">Todos os status</option>
          <option value="com-descritor">Com Descritor</option>
          <option value="sem-descritor">Sem Descritor</option>
        </select>
      </div>

      {/* View Mode Toggle */}
      <div className="view-mode-toggle">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode('turma')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'turma' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Por Turma
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'lista' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Lista Completa
            </button>
          </div>
          <div className={`update-indicator ${isUpdating ? 'updating' : ''}`}>
            <span className="pulse"></span>
            <span>Atualização automática ativa</span>
          </div>
        </div>
      </div>

      {/* Status Tabs - only for list view */}
      {viewMode === 'lista' && (
        <div className="tabs-container">
          <button 
            className={`tab-button ${activeTab === 'todos' ? 'active' : ''}`}
            onClick={() => setActiveTab('todos')}
          >
            Todos ({horarios.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'pendentes' ? 'active' : ''}`}
            onClick={() => setActiveTab('pendentes')}
          >
            Pendentes ({aulasSemDescritor})
          </button>
          <button 
            className={`tab-button ${activeTab === 'concluidos' ? 'active' : ''}`}
            onClick={() => setActiveTab('concluidos')}
          >
            Concluídos ({aulasComDescritor})
          </button>
        </div>
      )}

      {/* Conteúdo Principal */}
      {viewMode === 'turma' ? (
        /* Vista por Turma com Progresso */
        <div className="turmas-grid">
          {Object.keys(turmasComProgresso).length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma turma encontrada</p>
            </div>
          ) : (
            Object.entries(turmasComProgresso).map(([turmaNome, data]) => {
              const turmaInfo = TURMAS_REAIS.find(t => t.nome === turmaNome);
              const progressoTurma = data.total > 0 ? (data.descritoresPreenchidos / data.total * 100) : 0;
              const todosProntos = data.descritoresPreenchidos === data.total;

              return (
                <div key={turmaNome} className="turma-card" data-turno={turmaInfo?.turno}>
                  <div className="turma-header">
                    <div className="turma-title-info">
                      <h3>{turmaNome}</h3>
                      {turmaInfo && (
                        <span className="turma-turno">{turmaInfo.turno}</span>
                      )}
                    </div>
                    <div className="turma-progress">
                      <span className="progress-text">Progresso</span>
                      <span className={`progress-number ${todosProntos ? 'complete' : ''}`}>
                        {data.descritoresPreenchidos}/{data.total}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progressoTurma}%` }}
                    />
                  </div>

                  {/* Aulas da Turma */}
                  <div className="turma-aulas">
                    {data.aulas
                      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                      .map((aula, index) => {
                        const professor = professors.find(p => p.id === aula.professorId);
                        const temDescritor = !!descritores[aula.id];
                        
                        return (
                          <div key={aula.id} className={`aula-item-turma ${!temDescritor ? 'pending' : ''}`}>
                            <div className="aula-content">
                              <div className="aula-tempo">{index + 1}º Tempo - {aula.materia}</div>
                              <div className="aula-details">
                                <span>{aula.horaInicio} - {aula.horaFim}</span>
                                <span>• Prof. {professor?.nome || 'Não atribuído'}</span>
                              </div>
                            </div>
                            <span className={`status-icon ${temDescritor ? 'done' : 'pending'}`}>
                              {temDescritor ? '✅' : '⏳'}
                            </span>
                          </div>
                        );
                      })}
                  </div>

                  {/* Professores Aguardando com botão individual */}
                  {data.professoresAguardando.length > 0 && (
                    <div className="aguardando-section">
                      <h4>⚠️ Aguardando Descritor:</h4>
                      {data.professoresAguardando.map((prof, index) => {
                        const aulaCompleta = data.aulas.find(a => 
                          a.materia === prof.materia && 
                          a.horaInicio + ' - ' + a.horaFim === prof.horario
                        );
                        
                        return (
                          <div key={index} className="aguardando-item">
                            <div className="prof-details">
                              <span className="prof-name">{prof.nome}</span>
                              <span className="prof-info">{prof.materia} • {prof.horario}</span>
                            </div>
                            {aulaCompleta && (
                              <button 
                                className="btn-lembrar"
                                onClick={() => handleLembrarProfessor(aulaCompleta)}
                                title={`Enviar lembrete para ${prof.nome}`}
                              >
                                Lembrar
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Botão Enviar */}
                  <button 
                    className="btn-enviar-alunos"
                    onClick={() => handleEnviarParaAlunos(turmaNome, data)}
                    disabled={data.descritoresPreenchidos === 0}
                  >
                    <span>📱</span>
                    Enviar para Alunos ({data.descritoresPreenchidos})
                  </button>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Lista de Aulas */
        <div className="aulas-list">
          {filteredAulas.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma aula encontrada com os filtros selecionados</p>
            </div>
          ) : (
            filteredAulas.map(aula => {
              const descritor = descritores[aula.id];
              const professor = professors.find(p => p.id === aula.professorId);
              const hasDescritor = !!descritor;
              
              return (
                <div key={aula.id} className={`aula-item ${hasDescritor ? 'completed' : 'pending'}`}>
                  <div className="aula-header">
                    <h3>{aula.materia} - {aula.turma}</h3>
                    <span className={`status-badge ${hasDescritor ? 'success' : 'warning'}`}>
                      {hasDescritor ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Preenchido
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          Pendente
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="aula-info">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {aula.dia} • {aula.horaInicio} - {aula.horaFim}
                    </span>
                    {aula.sala && (
                      <span>Sala {aula.sala}</span>
                    )}
                    <span>
                      <span className="font-medium">Professor:</span>{' '}
                      <span className="text-blue-600">
                        {professor ? professor.nome : 'Não atribuído'}
                      </span>
                    </span>
                  </div>
                  
                  {hasDescritor && descritor && (
                    <div className="descritor-preview">
                      <h5 className="font-medium text-gray-700 mb-2">Descritor:</h5>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {typeof descritor === 'object' ? descritor.texto : descritor}
                      </p>
                      {typeof descritor === 'object' && descritor.preenchido_em && (
                        <p className="text-xs text-gray-500 mt-2">
                          Preenchido em: {new Date(descritor.preenchido_em).toLocaleString('pt-BR')}
                        </p>
                      )}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleSendWhatsApp(aula)}
                          className="btn-whatsapp"
                        >
                          <Send className="w-4 h-4" />
                          Enviar WhatsApp
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}