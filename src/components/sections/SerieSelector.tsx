import React from 'react';
import { useRouter } from 'next/navigation';
import { TurmaRobusta } from '@/lib/types/turma';

const SerieSelector = () => {
  const router = useRouter();
  
  const opcoesSerie = [
    {
      id: '1' as const,
      titulo: '1ª Série',
      subtitulo: 'Ensino Médio',
      descricao: 'Comece sua preparação desde já',
      icone: '📚',
      cor: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: '2' as const,
      titulo: '2ª Série',
      subtitulo: 'Ensino Médio',
      descricao: 'Intensifique seus estudos',
      icone: '📖',
      cor: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      id: '3' as const,
      titulo: '3ª Série',
      subtitulo: 'Ensino Médio',
      descricao: 'Reta final para aprovação',
      icone: '🎯',
      cor: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      id: 'formado' as const,
      titulo: 'Já me formei',
      subtitulo: 'Ensino Médio completo',
      descricao: 'Nova chance de aprovação',
      icone: '🎓',
      cor: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    }
  ];

  const handleSerieSelection = (serie: '1' | '2' | '3' | 'formado') => {
    // Buscar turma correspondente no localStorage
    const turmasRobustas = localStorage.getItem('turmas_robustas');
    let turmas: TurmaRobusta[] = [];
    
    if (turmasRobustas) {
      turmas = JSON.parse(turmasRobustas);
    } else {
      // Fallback para sistema antigo
      const turmasAntigas = localStorage.getItem('turmas_cards');
      if (turmasAntigas) {
        // Converter e usar mapeamento padrão
        const turmasOld = JSON.parse(turmasAntigas);
        const mapeamento = {
          '1': 'psc',
          '2': 'enem',
          '3': 'intensivo',
          'formado': 'intensivo'
        };
        
        const tipoTurma = mapeamento[serie];
        const turmaCorrespondente = turmasOld.find((t: any) => 
          t.tipo === tipoTurma && t.ativa
        );
        
        if (turmaCorrespondente) {
          router.push(`/matricula?turmaId=${turmaCorrespondente.id}`);
          return;
        }
      }
    }
    
    // Buscar turma com série correspondente
    const turmaCorrespondente = turmas.find(t => 
      t.serieCorrespondente === serie && t.ativa
    );
    
    if (turmaCorrespondente) {
      // Se for formado, adicionar flag especial
      const queryParams = serie === 'formado' ? 
        `?turmaId=${turmaCorrespondente.id}&formado=true` : 
        `?turmaId=${turmaCorrespondente.id}`;
      
      router.push(`/matricula${queryParams}`);
    } else {
      // Se não encontrar por série, tentar mapeamento padrão
      const mapeamentoPadrao: Record<string, string[]> = {
        '1': ['psc'],
        '2': ['enem'], 
        '3': ['intensivo', 'militar'],
        'formado': ['intensivo', 'militar']
      };
      
      const tiposPossiveis = mapeamentoPadrao[serie];
      const turmaAlternativa = turmas.find(t => 
        tiposPossiveis.includes(t.tipo) && t.ativa
      );
      
      if (turmaAlternativa) {
        const queryParams = serie === 'formado' ? 
          `?turmaId=${turmaAlternativa.id}&formado=true` : 
          `?turmaId=${turmaAlternativa.id}`;
        
        router.push(`/matricula${queryParams}`);
      } else {
        // Mostrar mensagem de erro
        alert('No momento não temos turmas disponíveis para sua série. Por favor, entre em contato conosco!');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Em qual série você está?
        </h2>
        <p className="text-gray-600">
          Escolha sua série para encontrar a turma ideal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opcoesSerie.map((serie) => (
          <button
            key={serie.id}
            onClick={() => handleSerieSelection(serie.id)}
            className={`
              p-6 rounded-xl border-2 transition-all
              hover:shadow-md hover:scale-105 transform
              ${serie.cor}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            `}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{serie.icone}</span>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg text-gray-800">{serie.titulo}</h3>
                <p className="text-sm text-gray-600">{serie.subtitulo}</p>
                <p className="text-sm mt-2 text-gray-700">{serie.descricao}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Não sabe qual escolher? 
          <a href="/contato" className="text-green-600 hover:text-green-700 font-medium ml-1">
            Fale conosco
          </a>
        </p>
      </div>
    </div>
  );
};

export default SerieSelector;