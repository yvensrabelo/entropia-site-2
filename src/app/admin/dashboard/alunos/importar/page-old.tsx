'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/admin/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';
import { validateCPF } from '@/lib/utils/cpf';
import { toast } from 'react-hot-toast';

interface ImportResult {
  success: number;
  errors: Array<{
    row: number;
    errors: string[];
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
    
    if (!student.cpf || !validateCPF(student.cpf)) {
      errors.push('CPF inválido');
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

  const handleImport = async () => {
    if (!file) {
      toast.error('Selecione um arquivo para importar');
      return;
    }
    
    setIsProcessing(true);
    setShowResults(false);
    
    try {
      const text = await file.text();
      const students = await processCSV(text);
      
      const importResult: ImportResult = {
        success: 0,
        errors: [],
        total: students.length
      };
      
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const validationErrors = validateStudent(student, i);
        
        if (validationErrors.length > 0) {
          importResult.errors.push({
            row: i + 2, // +2 because row 1 is header
            errors: validationErrors
          });
          continue;
        }
        
        // Try to insert student
        const { error } = await supabase
          .from('alunos')
          .insert({
            nome: student.nome,
            cpf: student.cpf,
            data_nascimento: student.data_nascimento,
            telefone: student.telefone,
            email: student.email,
            endereco: student.endereco,
            bairro: student.bairro,
            cidade: student.cidade || 'Manaus',
            cep: student.cep,
            nome_responsavel: student.nome_responsavel,
            telefone_responsavel: student.telefone_responsavel,
            observacoes: student.observacoes,
            status: 'ATIVO'
          });
        
        if (error) {
          if (error.code === '23505') { // Duplicate key
            importResult.errors.push({
              row: i + 2,
              errors: ['CPF já cadastrado']
            });
          } else {
            importResult.errors.push({
              row: i + 2,
              errors: ['Erro ao inserir no banco de dados']
            });
          }
        } else {
          importResult.success++;
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
      
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Erro ao processar arquivo');
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

                {result.errors.length > 0 && (
                  <div className="border rounded-lg p-4 bg-red-50">
                    <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Erros Encontrados
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">Linha {error.row}:</span>
                          <ul className="ml-4 text-red-600">
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