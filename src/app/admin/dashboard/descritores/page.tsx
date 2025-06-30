'use client';

// TODO: Esta página foi substituída pela página unificada /admin/dashboard/aulas
// Esta página permanece para compatibilidade mas deve ser considerada obsoleta

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, AlertCircle, Send } from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';

interface Aula {
  id: string;
  tempo: number;
  materia: string;
  turma: string;
  turno: string;
  professor_nome: string;
  professor_id: string;
  hora_inicio: string;
  hora_fim: string;
  dia_semana: string;
  sala: string;
}

interface Descritor {
  aula_id: string;
  descricao: string;
  preenchido_em: string;
}

export default function DescritoresPage() {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [turnoSelecionado, setTurnoSelecionado] = useState<'manhã' | 'tarde' | 'noite'>('manhã');
  const [turmaSelecionada, setTurmaSelecionada] = useState('');
  const [turmasAtivas, setTurmasAtivas] = useState<any[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [descritores, setDescritores] = useState<Record<string, Descritor>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [editingDescritor, setEditingDescritor] = useState<string | null>(null);
  const [tempDescricao, setTempDescricao] = useState('');

  // Carregar turmas ativas
  useEffect(() => {
    const stored = localStorage.getItem('turmas_ativas');
    if (stored) {
      const turmas = JSON.parse(stored);
      setTurmasAtivas(turmas.filter((t: any) => t.ativa));
      if (turmas.length > 0 && !turmaSelecionada) {
        setTurmaSelecionada(turmas[0].nome);
      }
    }
  }, []);

  // Carregar dados a cada 5 segundos
  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 5000);
    return () => clearInterval(interval);
  }, [data, turnoSelecionado, turmaSelecionada]);

  const carregarDados = () => {
    // Carregar horários
    const horarios = JSON.parse(localStorage.getItem('horarios_aulas') || '[]');
    
    // Converter data para dia da semana
    const date = new Date(data + 'T12:00:00');
    const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    const diaSemana = diasSemana[date.getDay()];

    // Filtrar aulas
    const aulasFiltradas = horarios.filter((h: any) => 
      h.dia_semana === diaSemana &&
      h.turno === turnoSelecionado &&
      h.turma === turmaSelecionada
    );

    setAulas(aulasFiltradas.sort((a: any, b: any) => a.tempo - b.tempo));

    // Carregar descritores
    const descritoresSalvos = localStorage.getItem(`descritores_${data}`) || '{}';
    setDescritores(JSON.parse(descritoresSalvos));
  };

  const todosDescritoresPreenchidos = () => {
    return aulas.length > 0 && aulas.every(aula => descritores[aula.id]);
  };

  const formatarMensagem = () => {
    return aulas.map(aula => {
      const descritor = descritores[aula.id];
      if (!descritor) return null;
      
      return `🔆 *${aula.tempo}° TEMPO* (${aula.materia.toUpperCase()})\n` +
             `*Professor ${aula.professor_nome}*\n` +
             `"${descritor.descricao}"`;
    }).filter(Boolean).join('\n\n');
  };

  const enviarWebhook = async () => {
    const mensagem = formatarMensagem();
    
    const payload = {
      turno: turnoSelecionado,
      turma: turmaSelecionada,
      data: data,
      mensagem: mensagem,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/descritores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        alert('Descritores enviados com sucesso!');
      } else {
        alert('Erro ao enviar descritores');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar descritores');
    }
  };

  const salvarDescritorEditado = () => {
    if (!editingDescritor || !tempDescricao.trim()) return;

    const descritoresAtuais = { ...descritores };
    descritoresAtuais[editingDescritor] = {
      aula_id: editingDescritor,
      descricao: tempDescricao.trim(),
      preenchido_em: new Date().toISOString()
    };

    localStorage.setItem(`descritores_${data}`, JSON.stringify(descritoresAtuais));
    setDescritores(descritoresAtuais);
    setEditingDescritor(null);
    setTempDescricao('');
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Sistema de Descritores</h1>
        <p className="text-gray-600">Gerencie e envie descritores de aula</p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Turno</label>
            <select
              value={turnoSelecionado}
              onChange={(e) => setTurnoSelecionado(e.target.value as any)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="manhã">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Turma</label>
            <select
              value={turmaSelecionada}
              onChange={(e) => setTurmaSelecionada(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              {turmasAtivas.map(turma => (
                <option key={turma.id} value={turma.nome}>{turma.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm">
            Status: {todosDescritoresPreenchidos() ? (
              <span className="text-green-600 font-medium">✓ Todos preenchidos</span>
            ) : (
              <span className="text-amber-600 font-medium">⏳ Pendente</span>
            )}
          </div>
          
          {todosDescritoresPreenchidos() && (
            <button
              onClick={() => setShowPreview(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              <Send className="w-4 h-4 inline mr-2" />
              Preparar Envio
            </button>
          )}
        </div>
      </div>

      {/* Lista de aulas */}
      <div className="bg-white rounded-lg shadow-sm">
        {aulas.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma aula encontrada</p>
            <p className="text-sm mt-2">
              Não há aulas programadas para {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}, 
              turno da {turnoSelecionado}, turma {turmaSelecionada}.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {aulas.map((aula) => {
              const descritor = descritores[aula.id];
              
              return (
                <div key={aula.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {aula.tempo}º Tempo - {aula.materia}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1 mt-2">
                        <p><User className="w-4 h-4 inline mr-1" /> {aula.professor_nome}</p>
                        <p><Clock className="w-4 h-4 inline mr-1" /> {aula.hora_inicio} - {aula.hora_fim}</p>
                        <p>Sala {aula.sala}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {descritor ? (
                        <span className="text-green-600 font-medium">
                          <CheckCircle className="w-5 h-5 inline mr-1" />
                          Preenchido
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">
                          <AlertCircle className="w-5 h-5 inline mr-1" />
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>

                  {descritor && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      {editingDescritor === aula.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={tempDescricao}
                            onChange={(e) => setTempDescricao(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={salvarDescritorEditado}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => {
                                setEditingDescritor(null);
                                setTempDescricao('');
                              }}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-700">{descritor.descricao}</p>
                          <button
                            onClick={() => {
                              setEditingDescritor(aula.id);
                              setTempDescricao(descritor.descricao);
                            }}
                            className="text-blue-600 text-sm mt-2 hover:underline"
                          >
                            Editar
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Preview da Mensagem</h2>
              <div className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                {formatarMensagem()}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={enviarWebhook}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Enviar Webhook
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}