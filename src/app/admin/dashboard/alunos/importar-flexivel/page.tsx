'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/admin/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, X, Users, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';
import { toast } from 'react-hot-toast';

interface ImportResult {
  success: number;
  errors: Array<{
    row: number;
    name: string;
    errors: string[];
  }>;
  imported: Array<{
    row: number;
    name: string;
    cpf: string;
    tempCpf: boolean;
    turma: string;
  }>;
  total: number;
  tempCpfCount: number;
}

interface StudentFlexData {
  nomeAluno: string;
  telefoneAluno?: string;
  cpfAluno?: string;
  nomeResponsavel?: string;
  telefoneResponsavel?: string;
  cpfResponsavel?: string;
  turma?: string;
  contratoEntregue?: string;
}

export default function ImportarFlexivelPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [debugMode, setDebugMode] = useState(true); // Ativo por padrão

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || 
          selectedFile.type === 'application/vnd.ms-excel' || 
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setFile(selectedFile);
        setResult(null);
        setShowResults(false);
        toast.success('Arquivo carregado! Pronto para importação flexível.');
      } else {
        toast.error('Por favor, selecione um arquivo CSV ou Excel');
      }
    }
  };

  const processFlexibleCSV = async (text: string): Promise<StudentFlexData[]> => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    if (debugMode) {
      console.log('Cabeçalhos encontrados:', headers);
    }
    
    const students: StudentFlexData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      // Processar CSV com campos entre aspas
      const values = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());
      
      const student: StudentFlexData = {
        nomeAluno: ''
      };
      
      headers.forEach((header, index) => {
        const value = cleanValues[index] || '';
        const lowerHeader = header.toLowerCase();
        
        if (debugMode && i === 1) {
          console.log(`Mapeando: "${header}" = "${value}"`);
        }
        
        // Mapeamento flexível de colunas
        if (lowerHeader.includes('nome') && lowerHeader.includes('aluno')) {
          student.nomeAluno = value;
        } else if (lowerHeader.includes('telefone') && lowerHeader.includes('aluno')) {
          student.telefoneAluno = value;
        } else if (lowerHeader.includes('cpf') && lowerHeader.includes('aluno')) {
          student.cpfAluno = value;
        } else if (lowerHeader.includes('nome') && lowerHeader.includes('responsável')) {
          student.nomeResponsavel = value;
        } else if (lowerHeader.includes('telefone') && lowerHeader.includes('responsável')) {
          student.telefoneResponsavel = value;
        } else if (lowerHeader.includes('cpf') && lowerHeader.includes('responsável')) {
          student.cpfResponsavel = value;
        } else if (lowerHeader === 'turma') {
          student.turma = value;
        } else if (lowerHeader === 'c') {
          student.contratoEntregue = value;
        }
      });
      
      students.push(student);
    }
    
    return students;
  };

  const generateTempCPF = (index: number): string => {
    return `TEMP${String(index).padStart(3, '0')}${Date.now().toString().slice(-4)}`;
  };

  const cleanPhone = (phone: string): string | null => {
    if (!phone || phone.trim() === '') return null;
    
    // Remove caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se tem pelo menos 8 dígitos, considera válido
    if (cleaned.length >= 8) {
      return phone.trim(); // Mantém formatação original
    }
    
    return null;
  };

  const cleanCPF = (cpf: string): string | null => {
    if (!cpf || cpf.trim() === '') return null;
    
    // Remove caracteres não numéricos
    const cleaned = cpf.replace(/\D/g, '');
    
    // Se tem 11 dígitos, considera válido (sem validação rigorosa)
    if (cleaned.length === 11) {
      return cleaned;
    }
    
    return null;
  };

  const findTurmaId = async (turmaNome: string): Promise<string | null> => {
    if (!turmaNome || turmaNome.trim() === '') return null;
    
    try {
      const { data, error } = await supabase
        .from('turmas_config')
        .select('id, nome, codigo')
        .ilike('nome', `%${turmaNome.trim()}%`)
        .limit(1);
      
      if (error) {
        console.warn('Erro ao buscar turma:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        if (debugMode) {
          console.log(`Turma encontrada: ${turmaNome} → ${data[0].nome} (${data[0].id})`);
        }
        return data[0].id;
      }
      
      if (debugMode) {
        console.warn(`Turma não encontrada: ${turmaNome}`);
      }
      return null;
    } catch (error) {
      console.warn('Erro na busca de turma:', error);
      return null;
    }
  };

  const createMatricula = async (alunoId: string, turmaId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('matriculas')
        .insert({
          aluno_id: alunoId,
          turma_id: turmaId,
          status: 'ATIVA',
          data_matricula: new Date().toISOString()
        });
      
      if (error) {
        console.warn('Erro ao criar matrícula:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('Erro na criação de matrícula:', error);
      return false;
    }
  };

  const handleFlexibleImport = async () => {
    if (!file) {
      toast.error('Selecione um arquivo para importar');
      return;
    }
    
    setIsProcessing(true);
    setShowResults(false);
    
    try {
      if (debugMode) {
        console.log('🚀 Iniciando importação SUPER FLEXÍVEL...');
      }
      
      const text = await file.text();
      const students = await processFlexibleCSV(text);
      
      if (debugMode) {
        console.log(`📊 Total de registros processados: ${students.length}`);
        console.log('Primeiros 3 registros:', students.slice(0, 3));
      }
      
      const importResult: ImportResult = {
        success: 0,
        errors: [],
        imported: [],
        total: students.length,
        tempCpfCount: 0
      };
      
      let tempCpfCounter = 1;
      
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const rowNumber = i + 2; // +2 porque linha 1 é cabeçalho
        
        if (debugMode) {
          console.log(`\n🔄 Processando linha ${rowNumber}:`, student);
        }
        
        // VALIDAÇÃO MÍNIMA: apenas nome obrigatório
        if (!student.nomeAluno || student.nomeAluno.trim().length < 2) {
          importResult.errors.push({
            row: rowNumber,
            name: student.nomeAluno || 'Nome vazio',
            errors: ['Nome do aluno obrigatório (mínimo 2 caracteres)']
          });
          continue;
        }
        
        // Processar CPF: usar original ou gerar temporário
        let cpfFinal = cleanCPF(student.cpfAluno || '');
        let isTempCpf = false;
        
        if (!cpfFinal) {
          cpfFinal = generateTempCPF(tempCpfCounter++);
          isTempCpf = true;
          importResult.tempCpfCount++;
          
          if (debugMode) {
            console.log(`📝 CPF temporário gerado: ${cpfFinal}`);
          }
        }
        
        // Processar telefones
        const telefoneAluno = cleanPhone(student.telefoneAluno || '');
        const telefoneResponsavel = cleanPhone(student.telefoneResponsavel || '');
        
        // Processar contrato
        const contratoEntregue = (student.contratoEntregue || '').toUpperCase() === 'OK';
        
        // Preparar dados para inserção
        const studentData = {
          nome: student.nomeAluno.trim(),
          cpf: cpfFinal,
          telefone: telefoneAluno,
          email: null, // Será preenchido depois se necessário
          data_nascimento: '2000-01-01', // Data padrão, será corrigida depois
          endereco: null,
          bairro: null,
          cidade: 'Manaus',
          estado: 'AM',
          cep: null,
          nome_responsavel: student.nomeResponsavel?.trim() || null,
          telefone_responsavel: telefoneResponsavel,
          observacoes: isTempCpf ? 'CPF temporário - necessário atualizar' : null,
          contrato_entregue: contratoEntregue
        };
        
        if (debugMode) {
          console.log(`💾 Dados preparados:`, studentData);
        }
        
        // Inserir aluno
        try {
          const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .insert(studentData)
            .select()
            .single();
          
          if (alunoError) {
            importResult.errors.push({
              row: rowNumber,
              name: student.nomeAluno,
              errors: [`Erro ao inserir: ${alunoError.message}`]
            });
            
            if (debugMode) {
              console.error(`❌ Erro na linha ${rowNumber}:`, alunoError);
            }
            continue;
          }
          
          // Sucesso na inserção do aluno
          importResult.success++;
          importResult.imported.push({
            row: rowNumber,
            name: student.nomeAluno,
            cpf: cpfFinal,
            tempCpf: isTempCpf,
            turma: student.turma || 'Não informada'
          });
          
          if (debugMode) {
            console.log(`✅ Aluno inserido com sucesso: ${student.nomeAluno}`);
          }
          
          // Criar matrícula se turma informada
          if (student.turma && student.turma.trim() !== '') {
            const turmaId = await findTurmaId(student.turma);
            
            if (turmaId) {
              const matriculaSuccess = await createMatricula(alunoData.id, turmaId);
              
              if (matriculaSuccess && debugMode) {
                console.log(`📚 Matrícula criada: ${student.nomeAluno} → ${student.turma}`);
              }
            }
          }
          
        } catch (insertError: any) {
          importResult.errors.push({
            row: rowNumber,
            name: student.nomeAluno,
            errors: [`Exceção: ${insertError.message}`]
          });
          
          if (debugMode) {
            console.error(`💥 Exceção na linha ${rowNumber}:`, insertError);
          }
        }
      }
      
      setResult(importResult);
      setShowResults(true);
      
      // Mensagens de sucesso
      if (importResult.success > 0) {
        toast.success(`🎉 ${importResult.success} aluno(s) importado(s) com sucesso!`);
      }
      
      if (importResult.tempCpfCount > 0) {
        toast(`⚠️ ${importResult.tempCpfCount} CPF(s) temporário(s) gerado(s)`, {
          icon: '⚠️',
          duration: 4000
        });
      }
      
      if (importResult.errors.length > 0) {
        toast.error(`❌ ${importResult.errors.length} erro(s) encontrado(s)`);
      }
      
      if (debugMode) {
        console.log('\n📈 RESULTADO FINAL DA IMPORTAÇÃO:', importResult);
      }
      
    } catch (error) {
      console.error('💥 Erro crítico na importação:', error);
      toast.error(`Erro crítico: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-600 mb-2">
              🚀 Importador Super Flexível
            </h1>
            <p className="text-lg text-gray-600">
              Para planilha "SUPER REGISTRO CLIENTES.csv"
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Aceita dados incompletos • Gera CPFs temporários • Cria matrículas automaticamente
            </p>
          </div>

          {/* Instruções */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Como Funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-green-700">
              <p>✅ <strong>Nome obrigatório</strong> - único campo necessário</p>
              <p>✅ <strong>CPF vazio</strong> - gera automaticamente (TEMP-001, TEMP-002...)</p>
              <p>✅ <strong>Telefone vazio</strong> - aceita e deixa null</p>
              <p>✅ <strong>Responsável vazio</strong> - aceita e deixa null</p>
              <p>✅ <strong>Turma</strong> - busca automaticamente e cria matrícula</p>
              <p>✅ <strong>Contrato "OK"</strong> - marca como entregue</p>
            </CardContent>
          </Card>

          {/* Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload da Planilha</CardTitle>
              <CardDescription>
                Suporte total para "SUPER REGISTRO CLIENTES.csv"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Debug Mode */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="debug-mode"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="debug-mode" className="text-sm text-gray-600">
                  Modo Debug (recomendado para acompanhar o processo)
                </label>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center bg-green-50">
                <FileSpreadsheet className="mx-auto h-16 w-16 text-green-400 mb-4" />
                
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                    <Upload className="mr-2 h-6 w-6" />
                    Selecionar SUPER REGISTRO CLIENTES.csv
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                  />
                </label>
                
                {file && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">
                      📄 Arquivo: {file.name}
                    </p>
                    <p className="text-xs text-green-600">
                      Pronto para importação flexível!
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-green-600 mt-2">
                  Aceita qualquer formato de dados • Importa mesmo com campos vazios
                </p>
              </div>

              {/* Import Button */}
              <div className="text-center">
                <Button
                  onClick={handleFlexibleImport}
                  disabled={!file || isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Importando {file?.name}...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Importar Todos os Alunos
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {showResults && result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-green-600">
                  🎉 Importação Concluída!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-100 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{result.success}</div>
                    <div className="text-sm text-green-700">Importados</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-100 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">{result.tempCpfCount}</div>
                    <div className="text-sm text-yellow-700">CPFs Temporários</div>
                  </div>
                  <div className="text-center p-4 bg-red-100 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{result.errors.length}</div>
                    <div className="text-sm text-red-700">Erros</div>
                  </div>
                  <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <div className="text-3xl font-bold text-gray-600">{result.total}</div>
                    <div className="text-sm text-gray-700">Total</div>
                  </div>
                </div>

                {/* Imported Students */}
                {result.imported.length > 0 && (
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Alunos Importados ({result.imported.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {result.imported.map((student, index) => (
                        <div key={index} className="text-sm bg-white p-3 rounded border">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium">Linha {student.row}:</span> {student.name}
                              <div className="text-gray-600">
                                CPF: {student.cpf} 
                                {student.tempCpf && <span className="text-yellow-600 ml-1">(Temporário)</span>}
                              </div>
                              {student.turma && (
                                <div className="text-blue-600 text-xs">Turma: {student.turma}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors */}
                {result.errors.length > 0 && (
                  <div className="border rounded-lg p-4 bg-red-50">
                    <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Erros Encontrados ({result.errors.length})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm bg-white p-3 rounded border">
                          <span className="font-medium">Linha {error.row}:</span> {error.name}
                          <ul className="ml-4 text-red-600 mt-1">
                            {error.errors.map((err, i) => (
                              <li key={i}>• {err}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CPF Temporários */}
                {result.tempCpfCount > 0 && (
                  <div className="border rounded-lg p-4 bg-yellow-50">
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      ⚠️ {result.tempCpfCount} CPF(s) Temporário(s) Gerado(s)
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Estes alunos precisarão ter seus CPFs atualizados posteriormente. 
                      Você pode editá-los individualmente na lista de alunos.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                      setShowResults(false);
                    }}
                  >
                    Nova Importação
                  </Button>
                  <Button
                    onClick={() => router.push('/admin/dashboard/alunos')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Ver Todos os Alunos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}