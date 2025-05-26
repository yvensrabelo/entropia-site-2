'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/admin/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, Eye, Edit, Trash, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { validateCPF } from '@/lib/utils/cpf';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface StudentPreview {
  id: string;
  original: any;
  mapped: {
    nome: string;
    cpf: string;
    data_nascimento: string;
    telefone: string;
    email: string;
    endereco?: string;
    bairro?: string;
    cidade?: string;
    cep?: string;
    nome_responsavel?: string;
    telefone_responsavel?: string;
    observacoes?: string;
  };
  errors: string[];
  status: 'valid' | 'warning' | 'error';
  isEditing: boolean;
}

interface ColumnMapping {
  [key: string]: string;
}

export default function ImportarAvancadoPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'import'>('upload');
  
  // Dados do arquivo
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [studentsPreview, setStudentsPreview] = useState<StudentPreview[]>([]);
  const [importResult, setImportResult] = useState<any>(null);

  const requiredFields = {
    nome: 'Nome',
    cpf: 'CPF',
    data_nascimento: 'Data de Nascimento',
    telefone: 'Telefone',
    email: 'Email'
  };

  const optionalFields = {
    endereco: 'Endereço',
    bairro: 'Bairro',
    cidade: 'Cidade',
    cep: 'CEP',
    nome_responsavel: 'Nome do Responsável',
    telefone_responsavel: 'Telefone do Responsável',
    observacoes: 'Observações'
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          toast.error('Arquivo deve ter pelo menos 1 linha de dados');
          return;
        }
        
        const fileHeaders = jsonData[0] as string[];
        const fileData = jsonData.slice(1);
        
        setHeaders(fileHeaders);
        setRawData(fileData);
        
        // Auto-detectar mapeamento
        const autoMapping = autoDetectMapping(fileHeaders);
        setColumnMapping(autoMapping);
        
        setStep('mapping');
        toast.success('Arquivo carregado com sucesso!');
        
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        toast.error('Erro ao processar arquivo');
      }
    }
  };

  const autoDetectMapping = (fileHeaders: string[]): ColumnMapping => {
    const mapping: ColumnMapping = {};
    
    const fieldPatterns = {
      nome: ['nome', 'name'],
      cpf: ['cpf', 'documento'],
      data_nascimento: ['nascimento', 'data', 'birth', 'aniversario'],
      telefone: ['telefone', 'celular', 'phone', 'fone'],
      email: ['email', 'e-mail', 'mail'],
      endereco: ['endereco', 'endereço', 'address', 'rua'],
      bairro: ['bairro', 'neighborhood'],
      cidade: ['cidade', 'city'],
      cep: ['cep', 'postal', 'codigo'],
      nome_responsavel: ['responsavel', 'responsável', 'guardian', 'pai', 'mae'],
      telefone_responsavel: ['telefone responsavel', 'telefone responsável', 'fone responsavel'],
      observacoes: ['observacao', 'observações', 'obs', 'notes', 'comentario']
    };
    
    Object.entries(fieldPatterns).forEach(([field, patterns]) => {
      const header = fileHeaders.find(h => 
        patterns.some(pattern => 
          h.toLowerCase().includes(pattern.toLowerCase())
        )
      );
      if (header) {
        mapping[field] = header;
      }
    });
    
    return mapping;
  };

  const generatePreview = () => {
    setIsProcessing(true);
    
    try {
      const preview: StudentPreview[] = rawData.map((row, index) => {
        const mapped: any = {};
        const errors: string[] = [];
        
        // Mapear dados
        Object.entries(columnMapping).forEach(([field, header]) => {
          const columnIndex = headers.indexOf(header);
          if (columnIndex !== -1) {
            mapped[field] = row[columnIndex] || '';
          }
        });
        
        // Limpar e normalizar dados
        mapped.nome = mapped.nome?.toString().trim() || '';
        mapped.cpf = mapped.cpf?.toString().replace(/\D/g, '') || '';
        mapped.telefone = mapped.telefone?.toString().trim() || '';
        mapped.email = mapped.email?.toString().trim().toLowerCase() || '';
        mapped.cidade = mapped.cidade?.toString().trim() || 'Manaus';
        
        // Normalizar data
        if (mapped.data_nascimento) {
          mapped.data_nascimento = normalizeDate(mapped.data_nascimento.toString());
        }
        
        // Validar dados
        if (!mapped.nome || mapped.nome.length < 3) {
          errors.push('Nome inválido (mínimo 3 caracteres)');
        }
        
        if (!mapped.cpf || !validateCPF(mapped.cpf)) {
          errors.push('CPF inválido');
        }
        
        if (!mapped.data_nascimento) {
          errors.push('Data de nascimento obrigatória');
        }
        
        if (!mapped.telefone) {
          // Auto-gerar telefone se estiver vazio
          mapped.telefone = '00000000000';
          errors.push('Telefone gerado automaticamente (vazio no arquivo)');
        }
        
        if (!mapped.email || !mapped.email.includes('@')) {
          if (mapped.email) {
            errors.push('Email inválido');
          } else {
            // Gerar email automático
            mapped.email = `aluno${index + 1}@temp.com`;
            errors.push('Email gerado automaticamente (vazio no arquivo)');
          }
        }
        
        // Verificar se menor precisa de responsável
        if (mapped.data_nascimento) {
          const age = calculateAge(mapped.data_nascimento);
          if (age < 18 && !mapped.nome_responsavel) {
            errors.push(`Responsável obrigatório (${age} anos)`);
          }
        }
        
        const status = errors.length === 0 ? 'valid' : 
                      errors.some(e => e.includes('inválido') || e.includes('obrigatório')) ? 'error' : 'warning';
        
        return {
          id: `row-${index}`,
          original: Object.fromEntries(headers.map((h, i) => [h, row[i]])),
          mapped,
          errors,
          status,
          isEditing: false
        };
      });
      
      setStudentsPreview(preview);
      setStep('preview');
      
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      toast.error('Erro ao gerar preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const normalizeDate = (dateString: string): string => {
    if (!dateString) return '';
    
    // Se já está no formato ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Formato brasileiro DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Formato americano MM/DD/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    // Tentar converter diretamente
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return dateString;
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const editStudent = (id: string, field: string, value: string) => {
    setStudentsPreview(prev => prev.map(student => {
      if (student.id === id) {
        const updated = {
          ...student,
          mapped: { ...student.mapped, [field]: value }
        };
        
        // Re-validar
        const errors: string[] = [];
        const mapped = updated.mapped;
        
        if (!mapped.nome || mapped.nome.length < 3) {
          errors.push('Nome inválido');
        }
        if (!mapped.cpf || !validateCPF(mapped.cpf)) {
          errors.push('CPF inválido');
        }
        if (!mapped.data_nascimento) {
          errors.push('Data obrigatória');
        }
        if (!mapped.telefone) {
          errors.push('Telefone obrigatório');
        }
        if (!mapped.email || !mapped.email.includes('@')) {
          errors.push('Email inválido');
        }
        
        const status = errors.length === 0 ? 'valid' : 'error';
        
        return { ...updated, errors, status };
      }
      return student;
    }));
  };

  const importValidStudents = async () => {
    setIsProcessing(true);
    
    try {
      const validStudents = studentsPreview.filter(s => s.status === 'valid' || s.status === 'warning');
      let successCount = 0;
      const errors: any[] = [];
      
      for (const student of validStudents) {
        try {
          const { error } = await supabase
            .from('alunos')
            .insert({
              ...student.mapped,
              status: 'ATIVO'
            });
          
          if (error) {
            errors.push({
              student: student.mapped.nome,
              error: error.message
            });
          } else {
            successCount++;
          }
        } catch (err) {
          errors.push({
            student: student.mapped.nome,
            error: 'Erro desconhecido'
          });
        }
      }
      
      setImportResult({
        total: studentsPreview.length,
        valid: validStudents.length,
        success: successCount,
        errors
      });
      
      setStep('import');
      
      if (successCount > 0) {
        toast.success(`${successCount} aluno(s) importado(s) com sucesso!`);
      }
      
    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error('Erro durante a importação');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Importação Avançada de Alunos</h1>
            <p className="text-gray-600 mt-2">
              Sistema inteligente com preview, correção e mapeamento automático
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center space-x-4 mb-8">
            {[
              { key: 'upload', label: 'Upload', icon: Upload },
              { key: 'mapping', label: 'Mapeamento', icon: Edit },
              { key: 'preview', label: 'Preview', icon: Eye },
              { key: 'import', label: 'Importação', icon: Save }
            ].map(({ key, label, icon: Icon }, index) => (
              <div key={key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step === key ? 'bg-green-600 text-white' :
                  ['upload', 'mapping', 'preview', 'import'].indexOf(step) > index ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="ml-2 font-medium">{label}</span>
                {index < 3 && <div className="w-8 h-0.5 bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>

          {/* Etapa 1: Upload */}
          {step === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle>1. Upload do Arquivo</CardTitle>
                <CardDescription>
                  Suporte para Excel (.xlsx, .xls) e CSV com detecção automática de colunas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileSpreadsheet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                      <Upload className="mr-2 h-5 w-5" />
                      Selecionar Arquivo
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                    />
                  </label>
                  {file && (
                    <p className="mt-4 text-sm text-gray-600">
                      Arquivo: {file.name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Etapa 2: Mapeamento */}
          {step === 'mapping' && (
            <Card>
              <CardHeader>
                <CardTitle>2. Mapeamento de Colunas</CardTitle>
                <CardDescription>
                  Mapeamento automático detectado. Ajuste se necessário.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4 text-red-600">Campos Obrigatórios</h3>
                    {Object.entries(requiredFields).map(([field, label]) => (
                      <div key={field} className="mb-3">
                        <label className="block text-sm font-medium mb-1">{label}</label>
                        <select
                          value={columnMapping[field] || ''}
                          onChange={(e) => setColumnMapping(prev => ({ ...prev, [field]: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Selecione uma coluna</option>
                          {headers.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4 text-gray-600">Campos Opcionais</h3>
                    {Object.entries(optionalFields).map(([field, label]) => (
                      <div key={field} className="mb-3">
                        <label className="block text-sm font-medium mb-1">{label}</label>
                        <select
                          value={columnMapping[field] || ''}
                          onChange={(e) => setColumnMapping(prev => ({ ...prev, [field]: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Não mapear</option>
                          {headers.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep('upload')}>
                    Voltar
                  </Button>
                  <Button 
                    onClick={generatePreview}
                    disabled={isProcessing || !Object.values(requiredFields).every(field => 
                      Object.values(columnMapping).includes(field)
                    )}
                  >
                    {isProcessing ? 'Gerando Preview...' : 'Gerar Preview'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Etapa 3: Preview */}
          {step === 'preview' && (
            <Card>
              <CardHeader>
                <CardTitle>3. Preview dos Dados</CardTitle>
                <CardDescription>
                  Revise e corrija os dados antes da importação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        Válidos: {studentsPreview.filter(s => s.status === 'valid').length}
                      </span>
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        Avisos: {studentsPreview.filter(s => s.status === 'warning').length}
                      </span>
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        Erros: {studentsPreview.filter(s => s.status === 'error').length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {studentsPreview.map((student, index) => (
                      <div key={student.id} className={`border rounded-lg p-4 ${
                        student.status === 'valid' ? 'border-green-200 bg-green-50' :
                        student.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                        'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Linha {index + 2}: {student.mapped.nome}</h4>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setStudentsPreview(prev => 
                                prev.map(s => s.id === student.id ? { ...s, isEditing: !s.isEditing } : s)
                              )}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {student.errors.length > 0 && (
                          <div className="mb-2">
                            <ul className="text-sm text-red-600">
                              {student.errors.map((error, i) => (
                                <li key={i}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {student.isEditing ? (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {Object.entries(student.mapped).map(([field, value]) => (
                              <div key={field}>
                                <label className="block text-xs font-medium mb-1 capitalize">
                                  {field.replace('_', ' ')}
                                </label>
                                <input
                                  type="text"
                                  value={value || ''}
                                  onChange={(e) => editStudent(student.id, field, e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>CPF: {student.mapped.cpf}</div>
                            <div>Email: {student.mapped.email}</div>
                            <div>Telefone: {student.mapped.telefone}</div>
                            <div>Data Nasc: {student.mapped.data_nascimento}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep('mapping')}>
                      Voltar
                    </Button>
                    <Button 
                      onClick={importValidStudents}
                      disabled={isProcessing || studentsPreview.filter(s => s.status === 'valid' || s.status === 'warning').length === 0}
                    >
                      {isProcessing ? 'Importando...' : 
                       `Importar ${studentsPreview.filter(s => s.status === 'valid' || s.status === 'warning').length} Alunos`}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Etapa 4: Resultado */}
          {step === 'import' && importResult && (
            <Card>
              <CardHeader>
                <CardTitle>4. Resultado da Importação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-600">{importResult.total}</div>
                      <div className="text-sm text-gray-500">Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{importResult.valid}</div>
                      <div className="text-sm text-gray-500">Processados</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                      <div className="text-sm text-gray-500">Importados</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                      <div className="text-sm text-gray-500">Erros</div>
                    </div>
                  </div>
                  
                  {importResult.errors.length > 0 && (
                    <div className="border rounded-lg p-4 bg-red-50">
                      <h3 className="font-semibold text-red-800 mb-2">Erros na Importação:</h3>
                      <ul className="text-sm text-red-600">
                        {importResult.errors.map((error: any, index: number) => (
                          <li key={index}>• {error.student}: {error.error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setStep('upload');
                        setFile(null);
                        setStudentsPreview([]);
                        setImportResult(null);
                      }}
                    >
                      Nova Importação
                    </Button>
                    <Button onClick={() => router.push('/admin/dashboard/alunos')}>
                      Ver Alunos Importados
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}