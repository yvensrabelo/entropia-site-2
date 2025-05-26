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
  CloudUpload,
  FileCheck,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/admin/AuthGuard';
import { SUBCATEGORIAS, AREAS_MACRO } from '@/lib/types/prova';
import { 
  isGabarito, 
  groupProvasAndGabaritos,
  ProvaGroup 
} from '@/lib/utils/prova-utils';

interface FileGroupInfo extends ProvaGroup {
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function UploadMultiploPage() {
  const router = useRouter();
  const [fileGroups, setFileGroups] = useState<FileGroupInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Função para adicionar arquivos
  const addFiles = (newFiles: FileList) => {
    const pdfFiles = Array.from(newFiles).filter(file => file.type === 'application/pdf');
    
    // Agrupa provas e gabaritos
    const groups = groupProvasAndGabaritos(pdfFiles);
    
    // Converte para FileGroupInfo
    const fileGroupInfos: FileGroupInfo[] = groups.map(group => ({
      ...group,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending' as const,
      progress: 0
    }));

    setFileGroups(prev => [...prev, ...fileGroupInfos]);
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

  // Atualizar informações de um grupo
  const updateGroupInfo = (id: string, updates: Partial<FileGroupInfo>) => {
    setFileGroups(prev => prev.map(group => 
      group.id === id ? { ...group, ...updates } : group
    ));
  };

  // Remover grupo
  const removeGroup = (id: string) => {
    setFileGroups(prev => prev.filter(group => group.id !== id));
  };

  // Upload de um grupo
  const uploadGroup = async (group: FileGroupInfo) => {
    try {
      updateGroupInfo(group.id, { status: 'uploading', progress: 20 });

      // Upload da prova
      const provaFileName = `${group.metadata.instituicao}-${group.metadata.tipo_prova}-${group.metadata.ano}-${Date.now()}-prova.pdf`;
      
      const { data: provaUpload, error: provaError } = await supabase.storage
        .from('provas')
        .upload(provaFileName, group.prova);

      if (provaError) throw provaError;

      updateGroupInfo(group.id, { progress: 40 });

      const { data: { publicUrl: provaUrl } } = supabase.storage
        .from('provas')
        .getPublicUrl(provaFileName);

      let gabaritoUrl = null;

      // Upload do gabarito se houver
      if (group.gabarito) {
        const gabaritoFileName = `${group.metadata.instituicao}-${group.metadata.tipo_prova}-${group.metadata.ano}-${Date.now()}-gabarito.pdf`;
        
        const { data: gabUpload, error: gabError } = await supabase.storage
          .from('provas')
          .upload(gabaritoFileName, group.gabarito);

        if (gabError) throw gabError;

        const { data: { publicUrl } } = supabase.storage
          .from('provas')
          .getPublicUrl(gabaritoFileName);

        gabaritoUrl = publicUrl;
      }

      updateGroupInfo(group.id, { progress: 70 });

      // Inserir no banco
      const { error: dbError } = await supabase
        .from('provas')
        .insert({
          instituicao: group.metadata.instituicao,
          tipo_prova: group.metadata.tipo_prova,
          subcategoria: group.metadata.subcategoria || null,
          area: group.metadata.area || null,
          ano: group.metadata.ano,
          etapa: group.metadata.etapa,
          titulo: group.metadata.titulo,
          url_pdf: provaUrl,
          url_gabarito: gabaritoUrl,
          visualizacoes: 0,
          tags: [
            group.metadata.instituicao.toLowerCase(), 
            group.metadata.tipo_prova.toLowerCase(), 
            group.metadata.ano.toString()
          ]
        });

      if (dbError) throw dbError;

      updateGroupInfo(group.id, { status: 'success', progress: 100 });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      updateGroupInfo(group.id, { 
        status: 'error', 
        error: error.message || 'Erro desconhecido',
        progress: 0 
      });
    }
  };

  // Upload de todos os arquivos
  const uploadAll = async () => {
    setIsUploading(true);
    
    const pendingGroups = fileGroups.filter(g => g.status === 'pending');
    
    // Upload sequencial para não sobrecarregar
    for (const group of pendingGroups) {
      await uploadGroup(group);
    }
    
    setIsUploading(false);
  };

  const pendingCount = fileGroups.filter(g => g.status === 'pending').length;
  const successCount = fileGroups.filter(g => g.status === 'success').length;
  const errorCount = fileGroups.filter(g => g.status === 'error').length;

  return (
    <AuthGuard>
      <div className="p-6 max-w-7xl mx-auto">
        <Link
          href="/admin/dashboard/provas"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Upload Múltiplo de Provas</h1>
        <p className="text-gray-600 mb-6">
          Sistema inteligente que detecta automaticamente gabaritos e agrupa com suas respectivas provas
        </p>

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
            O sistema detectará automaticamente provas e gabaritos
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
        {fileGroups.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-6 text-sm">
              <span>Total: {fileGroups.length}</span>
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

        {/* Lista de grupos */}
        <div className="space-y-4">
          {fileGroups.map(group => (
            <div
              key={group.id}
              className={`bg-white rounded-lg shadow-sm p-4 border ${
                group.status === 'error' ? 'border-red-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {group.gabarito ? (
                    <div className="relative">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <FileCheck className="w-5 h-5 text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
                    </div>
                  ) : (
                    <FileText className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {group.prova.name}
                        {group.gabarito && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            <LinkIcon className="w-3 h-3 inline mr-1" />
                            Com gabarito
                          </span>
                        )}
                      </p>
                      {group.gabarito && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <FileCheck className="w-4 h-4" />
                          {group.gabarito.name}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {(group.prova.size / 1024 / 1024).toFixed(2)} MB
                        {group.gabarito && ` + ${(group.gabarito.size / 1024 / 1024).toFixed(2)} MB`}
                      </p>
                    </div>
                    
                    {group.status === 'pending' && (
                      <button
                        onClick={() => removeGroup(group.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    
                    {group.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    
                    {group.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>

                  {group.status === 'pending' && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Instituição
                        </label>
                        <select
                          value={group.metadata.instituicao}
                          onChange={(e) => updateGroupInfo(group.id, { 
                            metadata: { ...group.metadata, instituicao: e.target.value }
                          })}
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
                          value={group.metadata.tipo_prova}
                          onChange={(e) => {
                            const tipo = e.target.value;
                            updateGroupInfo(group.id, { 
                              metadata: { 
                                ...group.metadata, 
                                tipo_prova: tipo,
                                subcategoria: '',
                                area: ''
                              }
                            });
                          }}
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

                      {/* Subcategoria condicional */}
                      {group.metadata.tipo_prova && SUBCATEGORIAS[group.metadata.tipo_prova] && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Subcategoria
                          </label>
                          <select
                            value={group.metadata.subcategoria || ''}
                            onChange={(e) => updateGroupInfo(group.id, { 
                              metadata: { 
                                ...group.metadata, 
                                subcategoria: e.target.value,
                                area: e.target.value === 'DIA 2' ? '' : group.metadata.area
                              }
                            })}
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Selecione</option>
                            {SUBCATEGORIAS[group.metadata.tipo_prova].map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Área condicional para MACRO DIA 2 */}
                      {group.metadata.tipo_prova === 'MACRO' && group.metadata.subcategoria === 'DIA 2' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Área
                          </label>
                          <select
                            value={group.metadata.area || ''}
                            onChange={(e) => updateGroupInfo(group.id, { 
                              metadata: { ...group.metadata, area: e.target.value }
                            })}
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Selecione</option>
                            {AREAS_MACRO.map(area => (
                              <option key={area} value={area}>{area}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Ano
                        </label>
                        <input
                          type="number"
                          value={group.metadata.ano}
                          onChange={(e) => updateGroupInfo(group.id, { 
                            metadata: { ...group.metadata, ano: parseInt(e.target.value) }
                          })}
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
                          value={group.metadata.etapa}
                          onChange={(e) => updateGroupInfo(group.id, { 
                            metadata: { ...group.metadata, etapa: e.target.value }
                          })}
                          placeholder="Ex: 1ª Etapa"
                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {group.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${group.progress}%` }}
                      />
                    </div>
                  )}

                  {group.status === 'error' && (
                    <p className="text-sm text-red-600">{group.error}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {fileGroups.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum arquivo selecionado</p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}