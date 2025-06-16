'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
}

export default function DashboardProfessor() {
  const [professor, setProfessor] = useState<any>(null);
  const [aulasHoje, setAulasHoje] = useState<Aula[]>([]);
  const [descritores, setDescritores] = useState<Record<string, Descritor>>({});
  const [descricaoTemp, setDescricaoTemp] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    // Verificar se professor está logado
    const professorLogado = sessionStorage.getItem('professor_logado');
    if (!professorLogado) {
      router.push('/descritor');
      return;
    }

    const prof = JSON.parse(professorLogado);
    setProfessor(prof);

    // Carregar aulas do professor hoje
    carregarAulasHoje(prof.id);

    // Carregar descritores já preenchidos
    carregarDescritores();
  }, []);

  const carregarAulasHoje = (professorId: string) => {
    const horarios = JSON.parse(localStorage.getItem('horarios_aulas') || '[]');
    const hoje = new Date();
    const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    const diaAtual = diasSemana[hoje.getDay()];

    const aulasProf = horarios.filter((h: any) => 
      h.professor_id === professorId && 
      h.dia_semana === diaAtual
    );

    setAulasHoje(aulasProf.sort((a: any, b: any) => a.tempo - b.tempo));
  };

  const carregarDescritores = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const descritoresSalvos = localStorage.getItem(`descritores_${hoje}`) || '{}';
    setDescritores(JSON.parse(descritoresSalvos));
  };

  const podePreencherDescritor = (aula: Aula) => {
    const agora = new Date();
    const [hora, minuto] = aula.hora_inicio.split(':').map(Number);
    const inicioAula = new Date();
    inicioAula.setHours(hora, minuto, 0);
    
    // Pode preencher se o horário da aula já passou
    return agora >= inicioAula;
  };

  const salvarDescritor = (aulaId: string) => {
    const descricao = descricaoTemp[aulaId];
    if (!descricao || descricao.trim() === '') {
      alert('Por favor, preencha a descrição da aula');
      return;
    }

    const hoje = new Date().toISOString().split('T')[0];
    const descritoresAtuais = JSON.parse(localStorage.getItem(`descritores_${hoje}`) || '{}');
    
    const novoDescritor: Descritor = {
      aula_id: aulaId,
      descricao: descricao.trim(),
      preenchido_em: new Date().toISOString()
    };

    descritoresAtuais[aulaId] = novoDescritor;
    localStorage.setItem(`descritores_${hoje}`, JSON.stringify(descritoresAtuais));
    
    setDescritores(descritoresAtuais);
    setDescricaoTemp({ ...descricaoTemp, [aulaId]: '' });
    
    alert('Descritor salvo com sucesso!');
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