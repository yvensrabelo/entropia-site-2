'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, AlertCircle, Send, Filter, RefreshCw, X } from 'lucide-react';
import { turmasService } from '@/services/turmasService';
import { horariosService } from '@/services/horariosService';
import type { HorarioAula } from '@/services/horariosService';
import { professoresService } from '@/services/professoresService';

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

interface DescritoresTabProps {
  refetchTrigger: number;
}

export default function DescritoresTab({ refetchTrigger }: DescritoresTabProps) {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [turnoSelecionado, setTurnoSelecionado] = useState<'manhã' | 'tarde' | 'noite'>('manhã');
  const [turmaSelecionada, setTurmaSelecionada] = useState('');
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<any[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [descritores, setDescritores] = useState<Record<string, Descritor>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [editingDescritor, setEditingDescritor] = useState<string | null>(null);
  const [tempDescricao, setTempDescricao] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carregar turmas do sistema
  const carregarTurmas = async () => {
    try {
      const turmasDB = await turmasService.listarTurmasSistema(true);
      setTurmasDisponiveis(turmasDB);
      if (turmasDB.length > 0 && !turmaSelecionada) {
        setTurmaSelecionada(turmasDB[0].nome || turmasDB[0].codigo);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  useEffect(() => {
    carregarTurmas();
  }, []);

  // Carregar dados quando filtros mudarem
  useEffect(() => {
    if (turmaSelecionada) {
      carregarDados();
    }
  }, [data, turnoSelecionado, turmaSelecionada, refetchTrigger]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Carregar horários do Supabase
      const horariosDB = await horariosService.listarHorarios();
      
      // Converter data para dia da semana
      const date = new Date(data + 'T12:00:00');
      const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
      const diaSemana = diasSemana[date.getDay()];

      // Filtrar aulas
      const aulasFiltradas: Aula[] = horariosDB
        .filter((h: HorarioAula) => 
          h.dia_semana === diaSemana &&
          h.turno === turnoSelecionado &&
          h.turma === turmaSelecionada
        )
        .map((h: HorarioAula): Aula => ({
          id: h.id,
          tempo: h.tempo,
          materia: h.materia,
          turma: h.turma,
          turno: h.turno,
          professor_nome: h.professor_nome || '',
          professor_id: h.professor_id || '',
          hora_inicio: h.hora_inicio,
          hora_fim: h.hora_fim,
          dia_semana: h.dia_semana,
          sala: h.sala
        }));

      setAulas(aulasFiltradas.sort((a, b) => a.tempo - b.tempo));

      // Carregar descritores do Supabase
      try {
        const url = new URL('/api/descritores-v2', window.location.origin);
        url.searchParams.set('admin', 'true');
        if (data) url.searchParams.set('data', data);
        
        console.log('📋 [DESCRITORES TAB] Fazendo requisição:', url.toString());
        
        const response = await fetch(url.toString());
        
        if (response.ok) {
          const responseData = await response.json();
          const { descritores } = responseData;
          
          // Limpar mensagem de erro se houve sucesso
          setErrorMessage(null);
          
          console.log('📋 [DESCRITORES TAB] Resposta da API:', { 
            total: descritores?.length || 0,
            filtros: responseData.filtros_aplicados 
          });
          
          // Converter array para object indexado por horario_id OU id da aula
          const descritoresMap: Record<string, any> = {};
          if (Array.isArray(descritores)) {
            descritores.forEach((desc: any) => {
              // Mapear tanto por horario_id quanto por id
              const chaves = [desc.horario_id, desc.id].filter(Boolean);
              
              const descritorData = {
                aula_id: desc.horario_id || desc.id,
                descricao: desc.descricao_livre || desc.descricao || '',
                preenchido_em: desc.created_at || desc.updated_at,
                id: desc.id
              };
              
              // Adicionar para todas as chaves possíveis
              chaves.forEach(chave => {
                descritoresMap[chave] = descritorData;
              });
              
              console.log('🔗 [DESCRITORES TAB] Mapeando descritor:', {
                id: desc.id,
                horario_id: desc.horario_id,
                chaves_mapeadas: chaves
              });
            });
          }
          
          setDescritores(descritoresMap);
          console.log('📋 [DESCRITORES TAB] Descritores mapeados:', Object.keys(descritoresMap).length);
        } else {
          const errorData = await response.json();
          console.error('❌ [DESCRITORES TAB] Erro da API:', errorData);
          setDescritores({});
          setErrorMessage('Falha ao carregar descritores – verifique filtros');
        }
      } catch (error) {
        console.error('💥 [DESCRITORES TAB] Erro ao carregar descritores:', error);
        setDescritores({});
        setErrorMessage('Falha ao carregar descritores – verifique filtros');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const todosDescritoresPreenchidos = () => {
    return aulas.length > 0 && aulas.every(aula => descritores[aula.id]);
  };

  const salvarDescritor = async (aulaId: string, descricao: string) => {
    try {
      // Buscar professor_id da aula
      const aula = aulas.find(a => a.id === aulaId);
      if (!aula || !aula.professor_id) {
        alert('Erro: Professor não encontrado para esta aula');
        return;
      }

      // Buscar CPF do professor através do professoresService
      const professores = await professoresService.listarProfessores();
      const professor = professores.find(p => p.id === aula.professor_id);
      
      if (!professor) {
        alert('Erro: Dados do professor não encontrados');
        return;
      }
      
      console.log('📝 [DESCRITORES TAB] Salvando descritor:', {
        aulaId,
        professor_cpf: professor.cpf,
        data,
        descricao: descricao.substring(0, 50) + '...'
      });
      
      // Salvar descritor via API
      const saveResponse = await fetch('/api/descritores-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horario_id: aulaId,
          professor_cpf: professor.cpf,
          data: data,
          descricao_livre: descricao.trim(),
          is_admin: true
        })
      });

      if (saveResponse.ok) {
        const result = await saveResponse.json();
        console.log('✅ [DESCRITORES TAB] Descritor salvo:', result);
        
        // Atualizar estado local
        const novosDescritores = {
          ...descritores,
          [aulaId]: {
            aula_id: aulaId,
            descricao: descricao.trim(),
            preenchido_em: new Date().toISOString()
          }
        };
        setDescritores(novosDescritores);
        
        // Recarregar dados para sincronizar
        await carregarDados();
        
        alert('Descritor salvo com sucesso!');
      } else {
        const error = await saveResponse.json();
        console.error('❌ [DESCRITORES TAB] Erro ao salvar:', error);
        alert(`Erro ao salvar: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('💥 [DESCRITORES TAB] Erro ao salvar descritor:', error);
      alert('Erro ao salvar descritor');
    }
  };

  const handleEditDescritor = (aulaId: string) => {
    const descritor = descritores[aulaId];
    setTempDescricao(descritor?.descricao || '');
    setEditingDescritor(aulaId);
  };

  const handleSaveDescritor = async () => {
    if (editingDescritor && tempDescricao.trim()) {
      await salvarDescritor(editingDescritor, tempDescricao);
      setEditingDescritor(null);
      setTempDescricao('');
    }
  };

  const handleCancelEdit = () => {
    setEditingDescritor(null);
    setTempDescricao('');
  };

  const formatarMensagem = () => {
    return aulas.map(aula => {
      const descritor = descritores[aula.id];
      if (!descritor) return null;
      
      return `🔆 *${aula.tempo}° TEMPO* (${aula.materia.toUpperCase()})\\n` +
             `*Professor ${aula.professor_nome}*\\n` +
             `"${descritor.descricao}"`;
    }).filter(Boolean).join('\\n\\n');
  };

  const enviarWebhook = async () => {
    const mensagem = formatarMensagem();
    
    const payload = {
      turno: turnoSelecionado,
      turma: turmaSelecionada,
      data: data,
      mensagem: mensagem,
      descritores: aulas.map(aula => ({
        tempo: aula.tempo,
        materia: aula.materia,
        professor: aula.professor_nome,
        descricao: descritores[aula.id]?.descricao || ''
      }))
    };

    console.log('📤 Enviando webhook:', payload);
    alert('Webhook enviado com sucesso! (simulação)');
  };

  const getDiaFormatado = () => {
    const date = new Date(data + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Descritores de Aulas</h2>
        <p className="text-gray-600 mt-1">Gerencie descritores e envios para os pais</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros de Visualização
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Turma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Turma</label>
            <select
              value={turmaSelecionada}
              onChange={(e) => setTurmaSelecionada(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              <option value="">Selecione uma turma</option>
              {turmasDisponiveis.map(turma => (
                <option key={turma.id} value={turma.nome || turma.codigo}>
                  {turma.nome || turma.codigo}
                </option>
              ))}
            </select>
          </div>

          {/* Turno */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Turno</label>
            <select
              value={turnoSelecionado}
              onChange={(e) => setTurnoSelecionado(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              <option value="manhã">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
            </select>
          </div>

          {/* Atualizar */}
          <div className="flex items-end">
            <button
              onClick={carregarDados}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Info da data selecionada */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <Calendar className="w-4 h-4 inline mr-1" />
            Data selecionada: <span className="font-medium">{getDiaFormatado()}</span>
          </p>
        </div>
      </div>

      {/* Mensagem de Erro */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Aulas</p>
              <p className="text-2xl font-bold text-gray-900">{aulas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Descritores Preenchidos</p>
              <p className="text-2xl font-bold text-gray-900">
                {aulas.filter(aula => descritores[aula.id]).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {aulas.filter(aula => !descritores[aula.id]).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Aulas */}
      {aulas.length > 0 ? (
        <div className="space-y-4">
          {aulas.map((aula) => {
            const descritor = descritores[aula.id];
            const isEditing = editingDescritor === aula.id;
            
            // Debug log para verificar mapeamento
            if (!descritor) {
              console.log('🔍 [DEBUG] Aula sem descritor:', {
                aula_id: aula.id,
                descritores_disponiveis: Object.keys(descritores),
                procurando_por: aula.id
              });
            }

            return (
              <div
                key={aula.id}
                className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
                  descritor ? 'border-green-500' : 'border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  {/* Info da Aula */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`text-2xl font-bold px-3 py-2 rounded-lg ${
                        descritor ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                      }`}>
                        {aula.tempo}º TEMPO
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {aula.materia}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {aula.hora_inicio} - {aula.hora_fim}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {aula.professor_nome}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Descritor */}
                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={tempDescricao}
                          onChange={(e) => setTempDescricao(e.target.value)}
                          placeholder="Descreva o que foi ensinado nesta aula..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveDescritor}
                            disabled={!tempDescricao.trim()}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : descritor ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-gray-800 leading-relaxed">
                              "{descritor.descricao}"
                            </p>
                            <p className="text-xs text-green-600 mt-2">
                              Preenchido em {new Date(descritor.preenchido_em).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleEditDescritor(aula.id)}
                            className="ml-4 text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditDescritor(aula.id)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                      >
                        + Adicionar descritor para esta aula
                      </button>
                    )}
                  </div>

                  {/* Status */}
                  <div className="ml-6 flex flex-col items-center">
                    {descritor ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    )}
                    <span className={`text-xs mt-1 ${
                      descritor ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {descritor ? 'Preenchido' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Preview e Envio */}
          {todosDescritoresPreenchidos() && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Todos os descritores preenchidos!
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {showPreview ? 'Ocultar' : 'Visualizar'} Preview
                  </button>
                  <button
                    onClick={enviarWebhook}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar para Pais
                  </button>
                </div>
              </div>

              {showPreview && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Preview da mensagem:</h4>
                  <div className="whitespace-pre-line text-sm text-gray-700 font-mono bg-white p-3 rounded border">
                    {formatarMensagem()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : turmaSelecionada ? (
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Nenhuma aula encontrada
          </h3>
          <p className="text-gray-500">
            Não há aulas programadas para {turmaSelecionada} no {turnoSelecionado} de {getDiaFormatado()}.
          </p>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Selecione uma turma
          </h3>
          <p className="text-gray-500">
            Use os filtros acima para escolher a turma e visualizar os descritores.
          </p>
        </div>
      )}
    </div>
  );
}