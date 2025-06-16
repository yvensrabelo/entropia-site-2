'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import AuthGuard from '@/components/admin/AuthGuard';

export default function ImportarHorarios() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const mapeamentoProfessores: Record<string, string> = {
    'RAUL': 'RAUL',
    'FÁBIO': 'FÁBIO',
    'LUCAS': 'LUCAS',
    'ESTEVÃO': 'ESTEVÃO',
    'YVENS': 'YVENS',
    'CELSO': 'CELSO',
    'JOICI': 'JOICI',
    'HUDSON': 'HUDSON',
    'RAMON': 'RAMON',
    'JONAS': 'JONAS',
    'BALIEIRO': 'BALIEIRO',
    'BUTEL': 'BUTEL',
    'WALTER': 'WALTER',
    'DANILO': 'DANILO',
    'VALESCA': 'VALESCA',
    'FRAN': 'FRAN'
  };

  const mapeamentoMaterias: Record<string, string> = {
    'LIN': 'Linguagens',
    'LIT': 'Literatura',
    'FIS': 'Física',
    'FÍS': 'Física',
    'HIS': 'História',
    'MAT': 'Matemática',
    'QUI': 'Química',
    'QUÍ': 'Química',
    'BIO': 'Biologia',
    'GRA': 'Gramática',
    'POR': 'Português',
    'GEO': 'Geografia',
    'RED': 'Redação'
  };

  const processarArquivo = async (file: File) => {
    setProcessando(true);
    setResultado(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Assumindo que os dados estão na primeira planilha
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Processar os dados
      const horariosImportados = processarDados(jsonData);
      
      setPreview(horariosImportados);
      setResultado({
        sucesso: true,
        quantidade: horariosImportados.length,
        mensagem: `${horariosImportados.length} horários prontos para importar`
      });
      
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setResultado({
        sucesso: false,
        mensagem: 'Erro ao processar arquivo. Verifique o formato.'
      });
    } finally {
      setProcessando(false);
    }
  };

  const processarDados = (dados: any[]): any[] => {
    const horarios: any[] = [];
    const diasSemana = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    const professores = JSON.parse(localStorage.getItem('professores') || '[]');
    
    // Encontrar onde começam os dados (procurar por "HORÁRIO")
    let linhaInicio = -1;
    for (let i = 0; i < dados.length; i++) {
      if (dados[i].some((cell: any) => cell?.toString().includes('HORÁRIO'))) {
        linhaInicio = i + 1;
        break;
      }
    }

    if (linhaInicio === -1) return [];

    // Processar cada linha de horário
    for (let i = linhaInicio; i < dados.length; i++) {
      const linha = dados[i];
      if (!linha || !linha[0]) continue;
      
      const horarioStr = linha[0].toString().trim();
      if (!horarioStr.includes(':')) continue;
      
      // Para cada dia da semana
      for (let dia = 0; dia < 6; dia++) {
        const celula = linha[dia + 1];
        if (!celula) continue;
        
        const conteudo = celula.toString().trim();
        if (!conteudo || conteudo === '-') continue;
        
        // Extrair professor e matéria
        const match = conteudo.match(/(.+?)\s*\[(.+?)\]/);
        if (match) {
          const nomeProfessor = match[1].trim();
          const siglaMateria = match[2].trim();
          
          const professor = professores.find((p: any) => 
            p.nome === mapeamentoProfessores[nomeProfessor] || 
            p.nome === nomeProfessor
          );
          
          if (professor) {
            const [horaInicio] = horarioStr.split('-').map(h => h.trim());
            const hora = parseInt(horaInicio.split(':')[0]);
            
            // Determinar turno e tempo
            let turno: string;
            let tempo: number;
            
            if (hora >= 7 && hora < 12) {
              turno = 'manhã';
              tempo = hora - 6; // 7h = 1º tempo, 8h = 2º tempo, etc
            } else if (hora >= 13 && hora < 18) {
              turno = 'tarde';
              tempo = hora - 12; // 13h = 1º tempo, 14h = 2º tempo, etc
            } else {
              turno = 'noite';
              tempo = hora - 18; // 19h = 1º tempo, 20h = 2º tempo, etc
            }

            const horario = {
              id: Date.now().toString() + Math.random(),
              dia_semana: diasSemana[dia],
              hora_inicio: horaInicio,
              hora_fim: calcularHoraFim(horaInicio),
              professor_id: professor.id,
              professor_nome: professor.nome,
              materia: mapeamentoMaterias[siglaMateria] || siglaMateria,
              turma: 'INTENSIVA', // Você pode ajustar isso
              sala: 'Sala 1', // Você pode ajustar isso
              turno: turno,
              tempo: tempo
            };
            
            horarios.push(horario);
          }
        }
      }
    }
    
    return horarios;
  };

  const calcularHoraFim = (horaInicio: string): string => {
    const [hora, minuto] = horaInicio.split(':').map(Number);
    const horaFim = hora + 1; // Assumindo aulas de 1 hora
    return `${horaFim.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
  };

  const importarHorarios = () => {
    if (!preview.length) return;

    // Limpar horários existentes (opcional)
    const confirmar = window.confirm('Deseja substituir TODOS os horários existentes?');
    
    let horariosAtuais = [];
    if (!confirmar) {
      horariosAtuais = JSON.parse(localStorage.getItem('horarios_aulas') || '[]');
    }

    const novosHorarios = [...horariosAtuais, ...preview];
    localStorage.setItem('horarios_aulas', JSON.stringify(novosHorarios));
    
    alert(`${preview.length} horários importados com sucesso!`);
    setArquivo(null);
    setPreview([]);
    setResultado(null);
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Importar Horários</h1>
        <p className="text-gray-600">Importe horários a partir de planilhas Excel</p>
      </div>

      {/* Upload de arquivo */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setArquivo(file);
                processarArquivo(file);
              }
            }}
            className="hidden"
            id="file-upload"
          />
          
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
          >
            Selecionar Planilha
          </label>
          
          <p className="text-sm text-gray-500 mt-2">
            Formatos aceitos: .xlsx, .xls
          </p>
        </div>

        {arquivo && (
          <div className="mt-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span className="text-sm">{arquivo.name}</span>
          </div>
        )}
      </div>

      {/* Resultado do processamento */}
      {resultado && (
        <div className={`p-4 rounded-lg ${resultado.sucesso ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2">
            {resultado.sucesso ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={resultado.sucesso ? 'text-green-800' : 'text-red-800'}>
              {resultado.mensagem}
            </span>
          </div>
        </div>
      )}

      {/* Preview dos horários */}
      {preview.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold mb-4">Preview dos Horários a Importar</h3>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Dia</th>
                  <th className="p-2 text-left">Horário</th>
                  <th className="p-2 text-left">Professor</th>
                  <th className="p-2 text-left">Matéria</th>
                  <th className="p-2 text-left">Turno</th>
                  <th className="p-2 text-left">Tempo</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 20).map((h, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{h.dia_semana}</td>
                    <td className="p-2">{h.hora_inicio} - {h.hora_fim}</td>
                    <td className="p-2">{h.professor_nome}</td>
                    <td className="p-2">{h.materia}</td>
                    <td className="p-2">{h.turno}</td>
                    <td className="p-2">{h.tempo}º</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 20 && (
              <p className="text-center text-gray-500 mt-2">
                ... e mais {preview.length - 20} horários
              </p>
            )}
          </div>
          
          <div className="mt-6 flex gap-3">
            <button
              onClick={importarHorarios}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Confirmar Importação
            </button>
            <button
              onClick={() => {
                setPreview([]);
                setResultado(null);
                setArquivo(null);
              }}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}