'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Trash } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ImportarTab() {
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
    const diasSemana = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
    
    // Encontrar onde começam os dados (procurar por "HORÁRIO")
    let linhaInicio = -1;
    for (let i = 0; i < dados.length; i++) {
      if (dados[i].some((cell: any) => cell?.toString().includes('HORÁRIO'))) {
        linhaInicio = i + 1;
        break;
      }
    }

    if (linhaInicio === -1) return [];

    // Processar cada linha de dados
    for (let i = linhaInicio; i < dados.length; i++) {
      const linha = dados[i];
      if (!linha || linha.length === 0) continue;

      const horarioStr = linha[0]?.toString().trim();
      if (!horarioStr || horarioStr === '') continue;

      // Processar cada dia da semana (colunas 1-7)
      for (let diaIdx = 0; diaIdx < Math.min(diasSemana.length, linha.length - 1); diaIdx++) {
        const celula = linha[diaIdx + 1]?.toString().trim();
        if (!celula || celula === '') continue;

        // Extrair informações da célula
        const info = extrairInfoCelula(celula);
        if (!info) continue;

        const horario = {
          dia: diasSemana[diaIdx],
          horario: horarioStr,
          turma: info.turma,
          materia: info.materia,
          professor: info.professor,
          sala: info.sala || 'Sala 1',
          original: celula
        };

        horarios.push(horario);
      }
    }

    return horarios;
  };

  const extrairInfoCelula = (celula: string) => {
    // Exemplo de formato esperado: "PSC-M-01 MAT WALTER"
    const partes = celula.split(' ').filter(p => p.trim() !== '');
    if (partes.length < 2) return null;

    const turma = partes[0];
    const materiaAbrev = partes[1];
    const professorNome = partes.slice(2).join(' ');

    return {
      turma,
      materia: mapeamentoMaterias[materiaAbrev] || materiaAbrev,
      professor: mapeamentoProfessores[professorNome] || professorNome,
      sala: null
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArquivo(file);
      setResultado(null);
      setPreview([]);
    }
  };

  const handleImportar = async () => {
    if (!arquivo) return;
    await processarArquivo(arquivo);
  };

  const handleConfirmarImportacao = async () => {
    if (preview.length === 0) return;

    try {
      setProcessando(true);
      
      // Simular importação para o banco
      console.log('Importando horários:', preview);
      
      // Aqui você integraria com o horariosService para salvar no banco
      
      setResultado({
        sucesso: true,
        mensagem: `${preview.length} horários importados com sucesso!`
      });
      
      // Limpar após sucesso
      setArquivo(null);
      setPreview([]);
      
    } catch (error) {
      console.error('Erro ao importar:', error);
      setResultado({
        sucesso: false,
        mensagem: 'Erro ao importar horários. Tente novamente.'
      });
    } finally {
      setProcessando(false);
    }
  };

  const handleLimpar = () => {
    setArquivo(null);
    setPreview([]);
    setResultado(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Importar Planilha de Horários</h2>
        <p className="text-gray-600 mt-1">Importe horários em massa através de planilhas Excel</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              Selecione uma planilha Excel
            </h3>
            <p className="text-gray-500">
              Formatos suportados: .xlsx, .xls
            </p>
          </div>

          <div className="mt-6">
            <label className="cursor-pointer">
              <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <Upload className="w-4 h-4 mr-2" />
                Escolher Arquivo
              </span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {arquivo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg inline-block">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="font-medium">{arquivo.name}</span>
                <span className="text-gray-500">
                  ({(arquivo.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        {arquivo && !preview.length && (
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={handleImportar}
              disabled={processando}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {processando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Processar Planilha
                </>
              )}
            </button>

            <button
              onClick={handleLimpar}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <Trash className="w-4 h-4 mr-2" />
              Limpar
            </button>
          </div>
        )}
      </div>

      {/* Resultado */}
      {resultado && (
        <div className={`rounded-lg p-4 mb-6 ${
          resultado.sucesso 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {resultado.sucesso ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <span className={`font-medium ${
              resultado.sucesso ? 'text-green-800' : 'text-red-800'
            }`}>
              {resultado.mensagem}
            </span>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Preview dos Dados ({preview.length} horários)
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={handleConfirmarImportacao}
                disabled={processando}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {processando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Importação
                  </>
                )}
              </button>

              <button
                onClick={handleLimpar}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Trash className="w-4 h-4 mr-2" />
                Cancelar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matéria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Professor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sala
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.slice(0, 50).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {item.dia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.horario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.turma}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.materia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.professor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.sala}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {preview.length > 50 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Mostrando primeiros 50 registros de {preview.length} total
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Formato da Planilha
        </h4>
        <div className="text-sm text-blue-700 space-y-2">
          <p>• A planilha deve ter uma linha com "HORÁRIO" para identificar o início dos dados</p>
          <p>• Primeira coluna: horários (ex: 07:00-07:50)</p>
          <p>• Colunas seguintes: Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo</p>
          <p>• Formato das células: "TURMA MATERIA PROFESSOR" (ex: "PSC-M-01 MAT WALTER")</p>
          <p>• Matérias abreviadas: MAT, FIS, QUI, BIO, HIS, GEO, POR, LIT, RED, etc.</p>
        </div>
      </div>
    </div>
  );
}