import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TurmaRobusta } from '@/lib/types/turma';
import { turmasService } from '@/services/turmasService';

const SerieSelector = () => {
  const router = useRouter();
  const [turmasAtivas, setTurmasAtivas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    // Buscar turma correspondente nas turmas ativas do Supabase
    const turmaEncontrada = turmasAtivas.find((t: any) => 
      t.serie === serie && t.ativa !== false
    );
    
    if (turmaEncontrada && turmaEncontrada.id) {
      // Salvar série selecionada
      sessionStorage.setItem('serie_selecionada', serie);
      
      // Criar query params
      const queryParams = serie === 'formado' ? 
        `?turmaId=${turmaEncontrada.id}&formado=true&serie=${serie}` : 
        `?turmaId=${turmaEncontrada.id}&serie=${serie}`;
      
      router.push(`/matricula${queryParams}`);
    } else {
      alert('Turma não encontrada para esta série. Entre em contato conosco.');
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