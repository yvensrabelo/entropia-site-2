'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/admin/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';
import { validateCPF } from '@/lib/utils/cpf';
import { validateTableColumns, validateTableColumnsSimple, generateCreateColumnSQL, validateCEP, formatCEP } from '@/lib/utils/database-validator';
import { toast } from 'react-hot-toast';

interface ImportResult {
  success: number;
  errors: Array<{
    row: number;
    errors: string[];
    studentName?: string;
  }>;
  imported: Array<{
    row: number;
    name: string;
    cpf: string;
  }>;
  total: number;
}

interface StudentData {
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  nome_responsavel?: string;
  telefone_responsavel?: string;
  observacoes?: string;
}

export default function ImportarAlunosPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [partialImport, setPartialImport] = useState(true);
  const [columnValidation, setColumnValidation] = useState<any>(null);
  const [showColumnIssues, setShowColumnIssues] = useState(false);
  const [skipValidation, setSkipValidation] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || 
          selectedFile.type === 'application/vnd.ms-excel' || 
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setFile(selectedFile);
        setResult(null);
        setShowResults(false);
      } else {
        toast.error('Por favor, selecione um arquivo CSV ou Excel');
      }
    }
  };

  const processCSV = async (text: string): Promise<StudentData[]> => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const students: StudentData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const student: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        // Map CSV headers to database fields
        switch (header.toLowerCase()) {
          case 'nome':
            student.nome = value;
            break;
          case 'cpf':
            student.cpf = value.replace(/\D/g, '');
            break;
          case 'data de nascimento':
          case 'nascimento':
            student.data_nascimento = value;
            break;
          case 'telefone':
          case 'celular':
            student.telefone = value;
            break;
          case 'email':
          case 'e-mail':
            student.email = value;
            break;
          case 'endereço':
          case 'endereco':
            student.endereco = value;
            break;
          case 'bairro':
            student.bairro = value;
            break;
          case 'cidade':
            student.cidade = value || 'Manaus';
            break;
          case 'cep':
            student.cep = value.replace(/\D/g, '');
            break;
          case 'responsável':
          case 'responsavel':
          case 'nome responsavel':
            student.nome_responsavel = value;
            break;
          case 'telefone responsável':
          case 'telefone responsavel':
            student.telefone_responsavel = value;
            break;
          case 'observações':
          case 'observacoes':
            student.observacoes = value;
            break;
        }
      });
      
      students.push(student);
    }
    
    return students;
  };

  const validateStudent = (student: StudentData, rowIndex: number): string[] => {
    const errors: string[] = [];
    
    if (debugMode) {
      console.log(`Validando linha ${rowIndex + 2}:`, student);
    }
    
    if (!student.nome || student.nome.length < 3) {
      errors.push('Nome inválido (mínimo 3 caracteres)');
    } else if (student.nome.length > 255) {
      errors.push('Nome muito longo (máximo 255 caracteres)');
    }
    
    // Validação de CPF melhorada - aceita vazio ou válido
    if (student.cpf) {
      const cpfClean = student.cpf.replace(/\D/g, '');
      if (cpfClean.length !== 11 || !validateCPF(cpfClean)) {
        errors.push(`CPF inválido: "${student.cpf}" (após limpeza: "${cpfClean}")`);
      }
    } else {
      errors.push('CPF obrigatório');
    }
    
    if (!student.data_nascimento) {
      errors.push('Data de nascimento obrigatória');
    } else {
      // Tentar diferentes formatos de data
      let date = new Date(student.data_nascimento);
      
      // Se não funcionou, tentar formato brasileiro (DD/MM/YYYY)
      if (isNaN(date.getTime()) && student.data_nascimento.includes('/')) {
        const parts = student.data_nascimento.split('/');
        if (parts.length === 3) {
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }
      
      if (isNaN(date.getTime())) {
        errors.push('Data de nascimento inválida (use YYYY-MM-DD ou DD/MM/YYYY)');
      } else {
        // Verificar se a data é razoável
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        if (age < 12 || age > 25) {
          errors.push(`Idade inválida (${age} anos - esperado entre 12 e 25)`);
        }
      }
    }
    
    if (!student.telefone) {
      errors.push('Telefone obrigatório');
    } else if (student.telefone.length > 20) {
      errors.push('Telefone muito longo (máximo 20 caracteres)');
    }
    
    if (!student.email || !student.email.includes('@')) {
      errors.push('Email inválido');
    } else if (student.email.length > 255) {
      errors.push('Email muito longo (máximo 255 caracteres)');
    }
    
    // Validar tamanhos de campos opcionais
    if (student.endereco && student.endereco.length > 500) {
      errors.push('Endereço muito longo (máximo 500 caracteres)');
    }
    
    if (student.bairro && student.bairro.length > 100) {
      errors.push('Bairro muito longo (máximo 100 caracteres)');
    }
    
    if (student.cidade && student.cidade.length > 100) {
      errors.push('Cidade muito longa (máximo 100 caracteres)');
    }
    
    // Validar CEP
    if (student.cep && !validateCEP(student.cep)) {
      errors.push(`CEP inválido: "${student.cep}" (deve ter 8 dígitos)`);
    }
    
    if (student.nome_responsavel && student.nome_responsavel.length > 255) {
      errors.push('Nome do responsável muito longo (máximo 255 caracteres)');
    }
    
    if (student.telefone_responsavel && student.telefone_responsavel.length > 20) {
      errors.push('Telefone do responsável muito longo (máximo 20 caracteres)');
    }
    
    // Check if minor needs guardian
    if (student.data_nascimento && errors.length === 0) {
      let birthDate = new Date(student.data_nascimento);
      
      // Tentar formato brasileiro se necessário
      if (isNaN(birthDate.getTime()) && student.data_nascimento.includes('/')) {
        const parts = student.data_nascimento.split('/');
        if (parts.length === 3) {
          birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }
      
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 18 && !student.nome_responsavel) {
          errors.push(`Responsável obrigatório para menores de 18 anos (idade: ${age})`);
        }
      }
    }
    
    return errors;
  };

  const getDetailedError = (error: any): string => {
    if (debugMode) {
      console.error('Erro detalhado do Supabase:', error);
    }
    
    // Códigos de erro PostgreSQL comuns
    switch (error?.code) {
      case '23505': // Unique violation
        if (error.constraint?.includes('cpf')) {
          return 'CPF já cadastrado no sistema';
        }
        if (error.constraint?.includes('email')) {
          return 'Email já cadastrado no sistema';
        }
        return 'Valor duplicado encontrado';
        
      case '22001': // String too long
        return `Campo muito longo: ${error.column || 'não identificado'}`;
        
      case '23502': // Not null violation
        return `Campo obrigatório faltando: ${error.column || 'não identificado'}`;
        
      case '22007': // Invalid datetime format
        return 'Formato de data inválido';
        
      case '22P02': // Invalid text representation
        return 'Formato de dados inválido';
        
      case '23514': // Check constraint violation
        return `Valor inválido: ${error.detail || error.message}`;
        
      default:
        if (debugMode) {
          return `Erro: ${error.message} (Código: ${error.code})`;
        }
        return error.message || 'Erro desconhecido no banco de dados';
    }
  };

  const checkDuplicateCPFs = async (students: StudentData[]): Promise<string[]> => {
    const cpfs = students.map(s => s.cpf).filter(Boolean);
    
    if (cpfs.length === 0) return [];
    
    try {
      const { data: existingStudents, error } = await supabase
        .from('alunos')
        .select('cpf')
        .in('cpf', cpfs);
      
      if (error) {
        console.error('Erro ao verificar CPFs duplicados:', error);
        return [];
      }
      
      return existingStudents?.map(s => s.cpf) || [];
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
      return [];
    }
  };

  const normalizeDate = (dateString: string): string => {
    if (!dateString) return '';
    
    // Se já está no formato ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Formato brasileiro (DD/MM/YYYY)
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Tentar converter diretamente
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return dateString; // Retornar original se não conseguir converter
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Selecione um arquivo para importar');
      return;
    }
    
    setIsProcessing(true);
    setShowResults(false);
    
    try {
      if (debugMode) {
        console.log('Iniciando importação em modo debug...');
      }
      
      // Verificar colunas da tabela antes da importação
      // Campos que vêm do CSV e devem existir na tabela
      const requiredColumns = [
        'nome', 'cpf', 'data_nascimento', 'telefone', 'email',
        'endereco', 'bairro', 'cidade', 'estado', 'cep',
        'nome_responsavel', 'telefone_responsavel', 'observacoes'
        // Removido 'status' - deve ser controlado pela matrícula, não pelo aluno
      ];
      
      if (debugMode) {
        console.log('Verificando colunas da tabela alunos...');
      }
      
      // Validação de colunas (pode ser pulada se houver problemas)
      if (!skipValidation) {
        if (debugMode) {
          console.log('Validação de colunas habilitada...');
        }
        
        let validation;
        try {
          // Tentar validação simples primeiro
          validation = await validateTableColumnsSimple('alunos', requiredColumns);
          
          if (debugMode) {
            console.log('Usando validação simplificada (assume colunas existem)');
          }
        } catch (error) {
          console.warn('Erro na validação, prosseguindo sem verificação:', error);
          validation = {
            tableName: 'alunos',
            columns: {},
            missingColumns: [],
            existingColumns: requiredColumns
          };
        }
        
        setColumnValidation(validation);
        
        if (validation.missingColumns.length > 0) {
          console.error('Colunas faltantes na tabela:', validation.missingColumns);
          const sqlScript = generateCreateColumnSQL('alunos', validation.missingColumns);
          
          toast.error(`Colunas faltantes: ${validation.missingColumns.join(', ')}`);
          setShowColumnIssues(true);
          
          if (debugMode) {
            console.log('SQL para criar colunas faltantes:');
            console.log(sqlScript);
          }
          
          return;
        }
        
        if (debugMode) {
          console.log('✅ Validação de colunas concluída');
        }
      } else {
        if (debugMode) {
          console.log('⚠️ Validação de colunas desabilitada - prosseguindo direto');
        }
      }
      
      const text = await file.text();
      const students = await processCSV(text);
      
      if (debugMode) {
        console.log('Dados processados do CSV:', students);
      }
      
      const importResult: ImportResult = {
        success: 0,
        errors: [],
        imported: [],
        total: students.length
      };
      
      // Verificar CPFs duplicados no banco de dados
      const existingCPFs = await checkDuplicateCPFs(students);
      if (debugMode && existingCPFs.length > 0) {
        console.log('CPFs já existentes:', existingCPFs);
      }
      
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const rowNumber = i + 2; // +2 because row 1 is header
        
        if (debugMode) {
          console.log(`Processando linha ${rowNumber}:`, student);
        }
        
        // Validações básicas
        const validationErrors = validateStudent(student, i);
        
        // Verificar se CPF já existe
        if (student.cpf && existingCPFs.includes(student.cpf.replace(/\D/g, ''))) {
          validationErrors.push('CPF já cadastrado no sistema');
        }
        
        if (validationErrors.length > 0) {
          importResult.errors.push({
            row: rowNumber,
            errors: validationErrors,
            studentName: student.nome || 'Nome não informado'
          });
          if (debugMode) {
            console.log(`Linha ${rowNumber} com erros:`, validationErrors);
          }
          
          // Se não for importação parcial, parar aqui
          if (!partialImport) {
            console.error(`Importação interrompida na linha ${rowNumber} devido a erros`);
            break;
          }
          continue;
        }
        
        // Preparar dados para inserção - apenas campos que existem na tabela
        const studentData = {
          nome: student.nome?.trim(),
          cpf: student.cpf?.replace(/\D/g, ''),
          data_nascimento: normalizeDate(student.data_nascimento),
          telefone: student.telefone?.trim(),
          email: student.email?.trim().toLowerCase(),
          endereco: student.endereco?.trim() || null,
          bairro: student.bairro?.trim() || null,
          cidade: (student.cidade?.trim() || 'Manaus'),
          estado: 'AM', // Padrão para Amazonas
          cep: student.cep ? formatCEP(student.cep) : null,
          nome_responsavel: student.nome_responsavel?.trim() || null,
          telefone_responsavel: student.telefone_responsavel?.trim() || null,
          observacoes: student.observacoes?.trim() || null
          // Removido 'status' - deve ser controlado pela matrícula
        };
        
        if (debugMode) {
          console.log(`Dados preparados para inserção (linha ${rowNumber}):`, studentData);
        }
        
        // Tentar inserir o aluno
        try {
          const { data, error } = await supabase
            .from('alunos')
            .insert(studentData)
            .select();

          if (error) {
            const detailedError = getDetailedError(error);
            importResult.errors.push({
              row: rowNumber,
              errors: [detailedError],
              studentName: studentData.nome
            });
            
            if (debugMode) {
              console.error(`Erro na linha ${rowNumber}:`, error);
              console.error('Dados que causaram erro:', studentData);
            }
          } else {
            importResult.success++;
            importResult.imported.push({
              row: rowNumber,
              name: studentData.nome,
              cpf: studentData.cpf
            });
            if (debugMode) {
              console.log(`Linha ${rowNumber} inserida com sucesso:`, data);
            }
          }
        } catch (insertError) {
          const detailedError = getDetailedError(insertError);
          importResult.errors.push({
            row: rowNumber,
            errors: [detailedError],
            studentName: student.nome || 'Nome não informado'
          });
          
          if (debugMode) {
            console.error(`Exceção na linha ${rowNumber}:`, insertError);
            console.error('Dados que causaram exceção:', studentData);
          }
        }
      }
      
      setResult(importResult);
      setShowResults(true);
      
      if (importResult.success > 0) {
        toast.success(`${importResult.success} aluno(s) importado(s) com sucesso!`);
      }
      
      if (importResult.errors.length > 0) {
        toast.error(`${importResult.errors.length} erro(s) encontrado(s)`);
      }
      
      if (debugMode) {
        console.log('Resultado final da importação:', importResult);
      }
      
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error(`Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Nome,CPF,Data de Nascimento,Telefone,Email,Endereço,Bairro,Cidade,CEP,Responsável,Telefone Responsável,Observações
João da Silva,123.456.789-00,2006-05-15,(92) 98765-4321,joao@email.com,Rua das Flores 123,Centro,Manaus,69000-000,Maria da Silva,(92) 98765-4320,
Maria Santos,987.654.321-00,2005-08-20,(92) 91234-5678,maria@email.com,Av. Eduardo Ribeiro 456,Adrianópolis,Manaus,69057-000,,,Bolsista`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_importacao_alunos.csv';
    link.click();
  };

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Importar Alunos</h1>
            <p className="text-gray-600 mt-2">
              Importe múltiplos alunos de uma vez usando um arquivo CSV ou Excel
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload de Arquivo</CardTitle>
              <CardDescription>
                Faça upload de um arquivo CSV ou Excel com os dados dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Opções de Importação */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800">Opções de Importação</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="debug-mode"
                    checked={debugMode}
                    onChange={(e) => setDebugMode(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="debug-mode" className="text-sm text-gray-600">
                    Modo Debug (mostra logs detalhados no console)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="partial-import"
                    checked={partialImport}
                    onChange={(e) => setPartialImport(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="partial-import" className="text-sm text-gray-600">
                    Importação parcial (pular linhas com erro e continuar)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="skip-validation"
                    checked={skipValidation}
                    onChange={(e) => setSkipValidation(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="skip-validation" className="text-sm text-gray-600">
                    Pular validação de colunas (se houver problemas com information_schema)
                  </label>
                </div>
                {!partialImport && (
                  <p className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
                    ⚠️ Com esta opção desmarcada, a importação será interrompida no primeiro erro encontrado
                  </p>
                )}
              </div>

              {/* Avisos de Colunas Faltantes */}
              {showColumnIssues && columnValidation && columnValidation.missingColumns.length > 0 && (
                <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
                  <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Colunas Faltantes na Tabela 'alunos'
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    As seguintes colunas não existem na tabela do banco de dados:
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {columnValidation.missingColumns.map((col: string) => (
                      <span key={col} className="bg-red-200 text-red-800 px-2 py-1 rounded text-sm font-mono">
                        {col}
                      </span>
                    ))}
                  </div>
                  <div className="bg-white border border-red-200 rounded p-3">
                    <p className="text-sm font-medium text-red-800 mb-2">Execute este SQL no Supabase:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {generateCreateColumnSQL('alunos', columnValidation.missingColumns)}
                    </pre>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowColumnIssues(false)}
                    >
                      Fechar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generateCreateColumnSQL('alunos', columnValidation.missingColumns));
                        toast.success('SQL copiado para a área de transferência!');
                      }}
                    >
                      Copiar SQL
                    </Button>
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                
                <div className="space-y-2">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar Arquivo
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                    />
                  </label>
                  
                  {file && (
                    <p className="text-sm text-gray-600">
                      Arquivo selecionado: {file.name}
                    </p>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Formatos aceitos: CSV, XLS, XLSX
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex items-center"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Modelo CSV
                </Button>

                <Button
                  onClick={handleImport}
                  disabled={!file || isProcessing}
                  className="flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Importar Alunos
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {showResults && result && (
            <Card>
              <CardHeader>
                <CardTitle>Resultado da Importação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{result.success}</p>
                    <p className="text-sm text-gray-600">Importados com sucesso</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                    <p className="text-sm text-gray-600">Erros encontrados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-600">{result.total}</p>
                    <p className="text-sm text-gray-600">Total de linhas</p>
                  </div>
                </div>

                {/* Alunos Importados com Sucesso */}
                {result.imported.length > 0 && (
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Alunos Importados com Sucesso
                    </h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {result.imported.map((student, index) => (
                        <div key={index} className="text-sm text-green-700 bg-white p-2 rounded">
                          <span className="font-medium">Linha {student.row}:</span> {student.name} (CPF: {student.cpf})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.errors.length > 0 && (
                  <div className="border rounded-lg p-4 bg-red-50">
                    <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Erros Encontrados (Detalhados)
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm bg-white p-2 rounded">
                          <span className="font-medium">Linha {error.row}:</span> {error.studentName || 'Nome não identificado'}
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

                <div className="flex justify-end space-x-4">
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
                  >
                    Ver Alunos
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