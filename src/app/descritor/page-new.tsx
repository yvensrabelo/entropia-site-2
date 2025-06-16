'use client';

import React, { useState, useEffect } from 'react';
import './descritor-new.css';

interface Aula {
  id: string;
  dia: string;
  horaInicio: string;
  horaFim: string;
  turma: string;
  materia: string;
  professorId: string;
  sala?: string;
}

interface Professor {
  id: string;
  nome: string;
  cpf: string;
  email: string;
}

interface Descritor {
  texto: string;
  professorId: string;
  professorNome: string;
  dataHora: string;
  turma: string;
  materia: string;
  dia: string;
  horario: string;
}

export default function DescritorPage() {
  const [cpf, setCpf] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentProfessor, setCurrentProfessor] = useState<Professor | null>(null);
  const [aulasDoDia, setAulasDoDia] = useState<Aula[]>([]);
  const [descritores, setDescritores] = useState<Record<string, Descritor>>({});
  const [descricoes, setDescricoes] = useState<Record<string, string>>({});
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [loading, setLoading] = useState(false);

  // Obter dia atual
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const hoje = new Date();
  const diaAtual = diasSemana[hoje.getDay()];

  // Estatísticas
  const totalAulasDia = aulasDoDia.length;
  const aulasDescritas = aulasDoDia.filter(aula => descritores[aula.id]).length;
  const aulasPendentes = totalAulasDia - aulasDescritas;

  // Carregar descrições existentes
  useEffect(() => {
    const storedDescritores = localStorage.getItem('descritores');
    if (storedDescritores) {
      const parsed = JSON.parse(storedDescritores);
      setDescritores(parsed);
      
      // Extrair textos para o estado de edição
      const textos: Record<string, string> = {};
      Object.entries(parsed).forEach(([id, desc]: [string, any]) => {
        if (typeof desc === 'object' && desc.texto) {
          textos[id] = desc.texto;
        } else if (typeof desc === 'string') {
          textos[id] = desc;
        }
      });
      setDescricoes(textos);
    }
  }, []);

  // Login do professor
  const handleCpfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cpfNumbers = cpf.replace(/\D/g, '');
    
    const storedProfessors = localStorage.getItem('professors');
    const professors = storedProfessors ? JSON.parse(storedProfessors) : [];
    
    const professor = professors.find((p: any) => 
      p.cpf === cpfNumbers && p.ativo
    );
    
    if (professor) {
      setIsAuthenticated(true);
      setCurrentProfessor(professor);
      loadAulasDoDia(professor.id);
    } else {
      alert('CPF não encontrado ou professor inativo');
    }
  };

  // Carregar apenas aulas do dia
  const loadAulasDoDia = (professorId: string) => {
    const storedHorarios = localStorage.getItem('horarios');
    const allHorarios = storedHorarios ? JSON.parse(storedHorarios) : [];
    
    // Filtrar apenas aulas do dia atual
    const aulasHoje = allHorarios.filter((h: any) => 
      h.professorId === professorId && h.dia === diaAtual
    ).sort((a: any, b: any) => a.horaInicio.localeCompare(b.horaInicio));
    
    setAulasDoDia(aulasHoje);
  };

  // Salvar descrição
  const handleSaveDescricao = () => {
    if (!selectedAula || !descricoes[selectedAula.id]) {
      alert('Por favor, preencha a descrição da aula');
      return;
    }

    setLoading(true);
    
    // Criar objeto descritor completo
    const novoDescritor: Descritor = {
      texto: descricoes[selectedAula.id],
      professorId: currentProfessor!.id,
      professorNome: currentProfessor!.nome,
      dataHora: new Date().toISOString(),
      turma: selectedAula.turma,
      materia: selectedAula.materia,
      dia: selectedAula.dia,
      horario: `${selectedAula.horaInicio} - ${selectedAula.horaFim}`
    };
    
    // Atualizar descritores
    const updatedDescritores = {
      ...descritores,
      [selectedAula.id]: novoDescritor
    };
    
    setDescritores(updatedDescritores);
    localStorage.setItem('descritores', JSON.stringify(updatedDescritores));
    
    // Notificar admin (simulado)
    console.log('Descritor salvo:', novoDescritor);
    
    setTimeout(() => {
      setLoading(false);
      alert('Descrição salva com sucesso!');
      setSelectedAula(null);
    }, 500);
  };

  // Formatar CPF
  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  // Tela de Login
  if (!isAuthenticated) {
    return (
      <div className="descritor-login-container">
        <div className="login-card animated">
          <div className="login-header">
            <h1>Portal do Professor</h1>
            <p>Faça login para acessar suas aulas de hoje</p>
          </div>
          
          <form onSubmit={handleCpfSubmit} className="login-form">
            <div className="form-group">
              <label>CPF do Professor</label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                required
                autoFocus
              />
            </div>
            
            <button type="submit" className="btn-login">
              Entrar
            </button>
          </form>
          
          <div className="login-footer">
            <p>CPF de teste: 986.606.082-91</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard do Professor
  return (
    <div className="descritor-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Olá, {currentProfessor?.nome}!</h1>
            <p className="date-info">📅 {diaAtual}, {hoje.toLocaleDateString('pt-BR')}</p>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="btn-logout">
            Sair
          </button>
        </div>
      </header>

      {/* Cards de Estatísticas */}
      <div className="stats-container">
        <div className="stat-card total">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>Aulas Hoje</h3>
            <p className="stat-number">{totalAulasDia}</p>
          </div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Descritas</h3>
            <p className="stat-number">{aulasDescritas}</p>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>Pendentes</h3>
            <p className="stat-number">{aulasPendentes}</p>
          </div>
        </div>
      </div>

      {/* Lista de Aulas do Dia */}
      <div className="aulas-container">
        <h2 className="section-title">Suas aulas de hoje</h2>
        
        {aulasDoDia.length === 0 ? (
          <div className="no-aulas">
            <p>🎉 Você não tem aulas hoje!</p>
          </div>
        ) : (
          <div className="aulas-grid">
            {aulasDoDia.map((aula, index) => {
              const isDescrita = !!descritores[aula.id];
              
              return (
                <div 
                  key={aula.id} 
                  className={`aula-card ${isDescrita ? 'descrita' : 'pendente'} ${selectedAula?.id === aula.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAula(aula)}
                >
                  <div className="aula-header">
                    <div className="aula-time">
                      <span className="time">{aula.horaInicio}</span>
                      <span className="separator">-</span>
                      <span className="time">{aula.horaFim}</span>
                    </div>
                    <span className={`status-badge ${isDescrita ? 'completed' : 'pending'}`}>
                      {isDescrita ? '✓ Descrita' : 'Pendente'}
                    </span>
                  </div>
                  
                  <div className="aula-body">
                    <h3 className="turma-name">{aula.turma}</h3>
                    <p className="materia-name">{aula.materia}</p>
                    <span className="tempo-badge">{index + 1}º tempo</span>
                  </div>
                  
                  <button className="btn-descrever">
                    {isDescrita ? 'Editar Descrição' : 'Descrever Aula'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Descrição */}
      {selectedAula && (
        <div className="modal-overlay" onClick={() => setSelectedAula(null)}>
          <div className="modal-content descritor-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Descritor da Aula</h2>
              <button className="close-btn" onClick={() => setSelectedAula(null)}>×</button>
            </div>
            
            <div className="aula-details">
              <div className="detail-item">
                <span className="label">Turma:</span>
                <span className="value">{selectedAula.turma}</span>
              </div>
              <div className="detail-item">
                <span className="label">Matéria:</span>
                <span className="value">{selectedAula.materia}</span>
              </div>
              <div className="detail-item">
                <span className="label">Horário:</span>
                <span className="value">{selectedAula.horaInicio} - {selectedAula.horaFim}</span>
              </div>
              {selectedAula.sala && (
                <div className="detail-item">
                  <span className="label">Sala:</span>
                  <span className="value">{selectedAula.sala}</span>
                </div>
              )}
            </div>
            
            <div className="descritor-form">
              <label>Descreva o conteúdo ministrado nesta aula:</label>
              <textarea
                value={descricoes[selectedAula.id] || ''}
                onChange={(e) => setDescricoes({
                  ...descricoes,
                  [selectedAula.id]: e.target.value
                })}
                placeholder="Ex: Hoje trabalhamos equações de segundo grau utilizando o método de Bhaskara. Resolvemos exercícios do livro páginas 45-48..."
                rows={8}
                autoFocus
              />
              
              <div className="char-count">
                {(descricoes[selectedAula.id] || '').length} caracteres
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={handleSaveDescricao} 
                className="btn-save"
                disabled={loading || !descricoes[selectedAula.id]}
              >
                {loading ? 'Salvando...' : 'Salvar Descrição'}
              </button>
              <button onClick={() => setSelectedAula(null)} className="btn-cancel">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}