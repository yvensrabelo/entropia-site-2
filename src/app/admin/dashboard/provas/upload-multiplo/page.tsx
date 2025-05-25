'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { 
  ArrowLeft, 
  Upload, 
  Loader2, 
  FileText, 
  X, 
  CheckCircle,
  AlertCircle,
  CloudUpload
} from 'lucide-react';
import Link from 'next/link';

interface FileInfo {
  file: File;
  id: string;
  instituicao: string;
  tipo_prova: string;
  ano: number;
  etapa: string;
  titulo: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function UploadMultiploPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Função para extrair informações do nome do arquivo
  const extractInfoFromFilename = (filename: string): Partial<FileInfo> => {
    const nameWithoutExt = filename.replace(/\.pdf$/i, '');
    
    // Padrões de regex para extrair informações
    const patterns = {
      instituicao: /\b(UEA|UFAM|UFRR|UERR|ENEM)\b/i,
      tipo_prova: /\b(PSC|PSI|PSMV|VESTIBULAR|MACRO|SIS|ENEM)\b/i,
      ano: /\b(20\d{2})\b/,
      etapa: /\b(\d+)[ªº]?\s*etapa\b|\betapa\s*(\d+)\b/i
    };

    const extracted: any = {
      instituicao: '',
      tipo_prova: '',
      ano: new Date().getFullYear(),
      etapa: ''
    };

    // Extrai tipo de prova primeiro
    const tipoMatch = nameWithoutExt.match(patterns.tipo_prova);
    if (tipoMatch) {
      extracted.tipo_prova = tipoMatch[1].toUpperCase();
    }

    // Extrai ou determina instituição baseada no tipo de prova
    const instMatch = nameWithoutExt.match(patterns.instituicao);
    if (instMatch) {
      extracted.instituicao = instMatch[1].toUpperCase();
    } else {
      // Auto-associa instituição baseada no tipo de prova
      const tipoProva = extracted.tipo_prova;
      if (tipoProva === 'PSC' || tipoProva === 'PSI') {
        extracted.instituicao = 'UFAM';
      } else if (tipoProva === 'MACRO' || tipoProva === 'SIS' || tipoProva === 'PSMV') {
        extracted.instituicao = 'UEA';
      }
      // Para outros tipos (ENEM, VESTIBULAR, etc.), deixa vazio para escolha manual
    }

    // Extrai ano
    const anoMatch = nameWithoutExt.match(patterns.ano);
    if (anoMatch) {
      extracted.ano = parseInt(anoMatch[1]);
    }

    // Extrai etapa
    const etapaMatch = nameWithoutExt.match(patterns.etapa);
    if (etapaMatch) {
      const etapaNum = etapaMatch[1] || etapaMatch[2];
      extracted.etapa = `${etapaNum}ª Etapa`;
    }

    // Gera título baseado nas informações extraídas
    if (extracted.tipo_prova && extracted.ano) {
      extracted.titulo = `${extracted.tipo_prova} ${extracted.ano}`;
      if (extracted.etapa) {
        extracted.titulo += ` - ${extracted.etapa}`;
      }
    } else {
      extracted.titulo = nameWithoutExt;
    }

    return extracted;
  };

  // Função para adicionar arquivos
  const addFiles = (newFiles: FileList) => {
    const fileInfos: FileInfo[] = Array.from(newFiles)
      .filter(file => file.type === 'application/pdf')
      .map(file => {
        const extracted = extractInfoFromFilename(file.name);
        return {
          file,
          id: Math.random().toString(36).substr(2, 9),
          instituicao: extracted.instituicao || '',
          tipo_prova: extracted.tipo_prova || '',
          ano: extracted.ano || new Date().getFullYear(),
          etapa: extracted.etapa || '',
          titulo: extracted.titulo || file.name,
          status: 'pending' as const,
          progress: 0
        };
      });

    setFiles(prev => [...prev, ...fileInfos]);
  };

  // Handlers de drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(e.dataTransfer.files);
    }
  }, []);

  // Handler de seleção de arquivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addFiles(e.target.files);
    }
  };

  // Atualizar informações de um arquivo
  const updateFileInfo = (id: string, updates: Partial<FileInfo>) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  };

  // Remover arquivo
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  // Upload de um arquivo
  const uploadFile = async (fileInfo: FileInfo) => {
    try {
      updateFileInfo(fileInfo.id, { status: 'uploading', progress: 20 });

      // Upload do PDF
      const fileName = `${fileInfo.instituicao}-${fileInfo.tipo_prova}-${fileInfo.ano}-${Date.now()}.pdf`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('provas')
        .upload(fileName, fileInfo.file);

      if (uploadError) throw uploadError;

      updateFileInfo(fileInfo.id, { progress: 50 });

      const { data: { publicUrl } } = supabase.storage
        .from('provas')
        .getPublicUrl(fileName);

      updateFileInfo(fileInfo.id, { progress: 70 });

      // Inserir no banco
      const { error: dbError } = await supabase
        .from('provas')
        .insert({
          instituicao: fileInfo.instituicao,
          tipo_prova: fileInfo.tipo_prova,
          ano: fileInfo.ano,
          etapa: fileInfo.etapa,
          titulo: fileInfo.titulo,
          url_pdf: publicUrl,
          visualizacoes: 0,
          tags: [fileInfo.instituicao.toLowerCase(), fileInfo.tipo_prova.toLowerCase(), fileInfo.ano.toString()]
        });

      if (dbError) throw dbError;

      updateFileInfo(fileInfo.id, { status: 'success', progress: 100 });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      updateFileInfo(fileInfo.id, { 
        status: 'error', 
        error: error.message || 'Erro desconhecido',
        progress: 0 
      });
    }
  };

  // Upload de todos os arquivos
  const uploadAll = async () => {
    setIsUploading(true);
    
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    // Upload sequencial para não sobrecarregar
    for (const file of pendingFiles) {
      await uploadFile(file);
    }
    
    setIsUploading(false);
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link
        href="/admin/dashboard/provas"
        className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload Múltiplo de Provas</h1>

      {/* Área de drag & drop */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`mb-8 border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <CloudUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-lg text-gray-600 mb-2">
          Arraste e solte arquivos PDF aqui
        </p>
        <p className="text-sm text-gray-500 mb-4">
          ou
        </p>
        <label className="inline-block">
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <span className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
            Selecionar Arquivos
          </span>
        </label>
      </div>

      {/* Resumo */}
      {files.length > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-6 text-sm">
            <span>Total: {files.length}</span>
            <span className="text-yellow-600">Pendentes: {pendingCount}</span>
            <span className="text-green-600">Sucesso: {successCount}</span>
            {errorCount > 0 && (
              <span className="text-red-600">Erros: {errorCount}</span>
            )}
          </div>
          {pendingCount > 0 && (
            <button
              onClick={uploadAll}
              disabled={isUploading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Enviar Todos
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Lista de arquivos */}
      <div className="space-y-4">
        {files.map(file => (
          <div
            key={file.id}
            className={`bg-white rounded-lg shadow-sm p-4 border ${
              file.status === 'error' ? 'border-red-200' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-gray-400 flex-shrink-0 mt-1" />
              
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{file.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  {file.status === 'pending' && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  
                  {file.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>

                {file.status === 'pending' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Instituição
                      </label>
                      <select
                        value={file.instituicao}
                        onChange={(e) => updateFileInfo(file.id, { instituicao: e.target.value })}
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Selecione</option>
                        <option value="UEA">UEA</option>
                        <option value="UFAM">UFAM</option>
                        <option value="UFRR">UFRR</option>
                        <option value="UERR">UERR</option>
                        <option value="ENEM">ENEM</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={file.tipo_prova}
                        onChange={(e) => updateFileInfo(file.id, { tipo_prova: e.target.value })}
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Selecione</option>
                        <option value="PSC">PSC</option>
                        <option value="PSI">PSI</option>
                        <option value="PSMV">PSMV</option>
                        <option value="VESTIBULAR">Vestibular</option>
                        <option value="MACRO">MACRO</option>
                        <option value="SIS">SIS</option>
                        <option value="ENEM">ENEM</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ano
                      </label>
                      <input
                        type="number"
                        value={file.ano}
                        onChange={(e) => updateFileInfo(file.id, { ano: parseInt(e.target.value) })}
                        min="2000"
                        max="2099"
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Etapa
                      </label>
                      <input
                        type="text"
                        value={file.etapa}
                        onChange={(e) => updateFileInfo(file.id, { etapa: e.target.value })}
                        placeholder="Ex: 1ª Etapa"
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {file.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                {file.status === 'error' && (
                  <p className="text-sm text-red-600">{file.error}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum arquivo selecionado</p>
        </div>
      )}
    </div>
  );
}