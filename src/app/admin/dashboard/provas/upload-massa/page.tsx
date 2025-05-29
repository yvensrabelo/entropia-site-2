'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import { Upload, FileText, AlertCircle, ArrowLeft, Shield, CheckCircle, Edit2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import AuthGuard from '@/components/admin/AuthGuard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useToast } from '@/components/ui/PremiumToast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { extractMetadataFromFilename, isGabarito, EXAM_TYPES, SUBCATEGORY_MAP, MACRO_AREAS, ExamType } from '@/lib/utils/prova-utils';

interface ArquivoProcessado {
  nome: string;
  tipo: 'prova' | 'gabarito';
  instituicao: string;
  tipo_prova: string;
  ano: number;
  subtitulo?: string;
  subcategoria?: string;
  area?: string;
  arquivo: File;
  status: 'pendente' | 'processando' | 'sucesso' | 'erro';
  erro?: string;
  progresso?: number;
  tituloFinal?: string;
}

export default function UploadMassa() {
  const [arquivos, setArquivos] = useState<ArquivoProcessado[]>([]);
  const [processando, setProcessando] = useState(false);
  const [dragAtivo, setDragAtivo] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ArquivoProcessado> | null>(null);
  const router = useRouter();
  const toast = useToast();
  const { isAdmin, loading: adminLoading, error: adminError } = useAdminAuth();

  // Função para detectar informações do arquivo
  const parseFileName = (fileName: string): Partial<ArquivoProcessado> => {
    const patterns = [
      // PSC - com etapas
      /^PSC[-_](\d{4})[-_](Etapa[-_]?(?:I{1,3}|\d)|PSC[-_]?\d)[-_](Prova|Gabarito)\.pdf$/i,
      // PSI - com dias
      /^PSI[-_](\d{4})[-_](Dia\d+)[-_](Prova|Gabarito)\.pdf$/i,
      // MACRO
      /^MACRO[-_](\d{4})[-_](Geral|Biologicas|Humanas|Exatas)[-_](Prova|Gabarito)\.pdf$/i,
      // SIS
      /^SIS[-_](\d{4})[-_](Etapa\d+)[-_](Prova|Gabarito)\.pdf$/i,
      // ENEM
      /^ENEM[-_](\d{4})[-_](Dia\d+)[-_](Prova|Gabarito)\.pdf$/i,
      // UERR/UFRR
      /^(UERR|UFRR)[-_](\d{4})[-_](Prova|Gabarito)\.pdf$/i,
      // Genérico
      /^(\w+)[-_](\d{4})[-_](.+?)[-_](Prova|Gabarito)\.pdf$/i,
    ];

    for (const pattern of patterns) {
      const match = fileName.match(pattern);
      if (match) {
        if (pattern.source.includes('UERR|UFRR')) {
          return {
            tipo_prova: match[1].toUpperCase(),
            ano: parseInt(match[2]),
            tipo: match[3].toLowerCase() as 'prova' | 'gabarito',
          };
        } else if (pattern.source.includes('PSC[-_]')) {
          let subtitulo = match[2];
          if (subtitulo.includes('I')) {
            const numRomano = subtitulo.match(/I{1,3}/)?.[0];
            const num = numRomano === 'I' ? '1' : numRomano === 'II' ? '2' : '3';
            subtitulo = `PSC ${num}`;
          } else if (subtitulo.match(/\d/)) {
            const num = subtitulo.match(/\d/)?.[0];
            subtitulo = `PSC ${num}`;
          }
          return {
            tipo_prova: 'PSC',
            ano: parseInt(match[1]),
            subtitulo,
            tipo: match[3].toLowerCase() as 'prova' | 'gabarito',
          };
        } else if (pattern.source.includes('PSI|MACRO|SIS|ENEM')) {
          return {
            tipo_prova: match[1]?.toUpperCase() || fileName.split('-')[0].toUpperCase(),
            ano: parseInt(match[2] || match[1]),
            subtitulo: match[3] || match[2],
            tipo: (match[4] || match[3]).toLowerCase() as 'prova' | 'gabarito',
          };
        } else {
          return {
            tipo_prova: match[1].toUpperCase(),
            ano: parseInt(match[2]),
            subtitulo: match[3],
            tipo: match[4].toLowerCase() as 'prova' | 'gabarito',
          };
        }
      }
    }

    return {};
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragAtivo(true);
    } else if (e.type === 'dragleave') {
      setDragAtivo(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragAtivo(false);

    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    
    if (files.length === 0) {
      toast.warning('Apenas arquivos PDF são aceitos');
      return;
    }

    processarArquivos(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => file.type === 'application/pdf');
    
    if (files.length === 0) {
      toast.warning('Apenas arquivos PDF são aceitos');
      return;
    }

    processarArquivos(files);
  };

  const processarArquivos = (files: File[]) => {
    console.log('🚀 INICIANDO PROCESSAMENTO DE ARQUIVOS');
    console.log(`📁 Total de arquivos: ${files.length}`);
    
    const novosArquivos = files.map((file, index) => {
      console.log(`\n📄 Processando arquivo ${index + 1}/${files.length}: ${file.name}`);
      
      // Usar a função extractMetadataFromFilename do prova-utils
      const metadata = extractMetadataFromFilename(file.name);
      console.log('📊 Metadata extraída:', metadata);
      
      // Determinar se é gabarito
      const tipo = isGabarito(file.name) ? 'gabarito' : 'prova';
      console.log('📝 Tipo de arquivo:', tipo);
      
      // CORREÇÃO ADICIONAL PARA GARANTIR DETECÇÃO DE ÁREAS
      const nomeLower = file.name.toLowerCase();
      if ((nomeLower.includes('biologica') || nomeLower.includes('biológica') ||
           nomeLower.includes('humana') || 
           nomeLower.includes('exata') || 
           nomeLower.includes('geral')) && 
          metadata.tipo_prova !== 'MACRO') {
        
        console.log('🔴 CORREÇÃO: Arquivo com área detectada como', metadata.tipo_prova, '- corrigindo para MACRO');
        
        metadata.instituicao = 'UEA';
        metadata.tipo_prova = 'MACRO';
        
        // Reprocessar título
        if (nomeLower.includes('biologica') || nomeLower.includes('biológica')) {
          metadata.area = 'BIOLÓGICAS';
          metadata.titulo = 'Biológicas';
        } else if (nomeLower.includes('humana')) {
          metadata.area = 'HUMANAS';
          metadata.titulo = 'Humanas';
        } else if (nomeLower.includes('exata')) {
          metadata.area = 'EXATAS';
          metadata.titulo = 'Exatas';
        } else if (nomeLower.includes('geral')) {
          metadata.subcategoria = 'CG';
          metadata.titulo = 'DIA 1';
          metadata.area = null;
        }
        
        if (isGabarito(file.name)) {
          metadata.titulo += ' - Gabarito';
        }
        
        console.log('🔧 Metadata corrigida:', {
          instituicao: metadata.instituicao,
          tipo_prova: metadata.tipo_prova,
          area: metadata.area,
          subcategoria: metadata.subcategoria,
          titulo: metadata.titulo
        });
      }
      
      // Validação e fallbacks
      if (!metadata.tipo_prova) {
        console.error('⚠️ AVISO: Arquivo sem tipo detectado:', file.name);
        metadata.tipo_prova = 'OUTROS'; // fallback
      }
      
      if (!metadata.instituicao) {
        console.error('⚠️ AVISO: Arquivo sem instituição:', file.name);
        // Tentar inferir instituição do nome
        const nome = file.name.toLowerCase();
        if (nome.includes('uea')) metadata.instituicao = 'UEA';
        else if (nome.includes('ufam')) metadata.instituicao = 'UFAM';
        else if (nome.includes('uerr')) metadata.instituicao = 'UERR';
        else if (nome.includes('ufrr')) metadata.instituicao = 'UFRR';
        else if (nome.includes('enem')) metadata.instituicao = 'ENEM';
        else metadata.instituicao = 'OUTRAS'; // fallback corrigido
      }
      
      console.log('✅ Metadata final:', {
        instituicao: metadata.instituicao,
        tipo_prova: metadata.tipo_prova,
        area: metadata.area,
        subcategoria: metadata.subcategoria,
        ano: metadata.ano,
        titulo: metadata.titulo
      });
      
      return {
        nome: file.name,
        tipo: tipo as 'prova' | 'gabarito',
        instituicao: metadata.instituicao,
        tipo_prova: metadata.tipo_prova,
        ano: metadata.ano,
        subtitulo: metadata.subcategoria || metadata.area || '',
        subcategoria: metadata.subcategoria || '',
        area: metadata.area || '',
        arquivo: file,
        status: 'pendente' as const,
        progresso: 0,
        tituloFinal: metadata.titulo,
      };
    });

    setArquivos([...arquivos, ...novosArquivos]);
    toast.success(`${novosArquivos.length} arquivo(s) adicionado(s) para upload`);
    
    // Mostra o modal de confirmação quando houver arquivos
    if (novosArquivos.length > 0) {
      setShowConfirmModal(true);
    }
  };

  const handleEdit = (index: number) => {
    const arquivo = arquivos[index];
    setEditingIndex(index);
    setEditForm({
      instituicao: arquivo.instituicao,
      tipo_prova: arquivo.tipo_prova,
      ano: arquivo.ano,
      subcategoria: arquivo.subcategoria,
      area: arquivo.area,
      tituloFinal: arquivo.tituloFinal
    });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editForm) {
      const updatedArquivos = [...arquivos];
      const arquivo = updatedArquivos[editingIndex];
      
      // Atualiza os campos editados
      arquivo.instituicao = editForm.instituicao || arquivo.instituicao;
      arquivo.tipo_prova = editForm.tipo_prova || arquivo.tipo_prova;
      arquivo.ano = editForm.ano || arquivo.ano;
      arquivo.subcategoria = editForm.subcategoria || '';
      arquivo.area = editForm.area || '';
      arquivo.tituloFinal = editForm.tituloFinal || arquivo.tituloFinal;
      
      // Atualiza subtitulo baseado em subcategoria ou area
      arquivo.subtitulo = arquivo.subcategoria || arquivo.area || '';
      
      setArquivos(updatedArquivos);
      setEditingIndex(null);
      setEditForm(null);
      toast.success('Informações atualizadas com sucesso');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const processarUpload = async () => {
    console.log('=== INICIANDO UPLOAD ===');
    console.log('isAdmin:', isAdmin);
    
    if (!isAdmin) {
      toast.error('Você não tem permissão para fazer upload de provas', 'Acesso Negado');
      return;
    }

    setProcessando(true);

    try {
      // Verificar se há usuário autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session:', session);
      console.log('Session error:', sessionError);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Usuário autenticado:', user?.id);
      if (authError) console.error('Erro de autenticação:', authError);
      
      const grupos = new Map<string, ArquivoProcessado[]>();
      
      arquivos.forEach(arquivo => {
        const chave = `${arquivo.tipo_prova}-${arquivo.ano}`;
        if (!grupos.has(chave)) {
          grupos.set(chave, []);
        }
        grupos.get(chave)!.push(arquivo);
      });

      let totalProcessados = 0;
      let totalSucesso = 0;
      let totalErros = 0;

      for (const [chave, arquivosGrupo] of grupos) {
        const grupo_id = chave.toLowerCase().replace(/\s+/g, '-');
        
        const subgrupos = new Map<string, ArquivoProcessado[]>();
        arquivosGrupo.forEach(arquivo => {
          const subChave = arquivo.subtitulo || 'geral';
          if (!subgrupos.has(subChave)) {
            subgrupos.set(subChave, []);
          }
          subgrupos.get(subChave)!.push(arquivo);
        });

        let ordem = 1;
        for (const [subtitulo, arquivosSubgrupo] of subgrupos) {
          let provaFile: ArquivoProcessado | undefined;
          let gabaritoFile: ArquivoProcessado | undefined;

          arquivosSubgrupo.forEach(arquivo => {
            if (arquivo.tipo === 'prova') provaFile = arquivo;
            if (arquivo.tipo === 'gabarito') gabaritoFile = arquivo;
          });

          const primeiroArquivo = provaFile || gabaritoFile;
          if (!primeiroArquivo) continue;

          try {
            let urlProva: string | undefined;
            let urlGabarito: string | undefined;

            // Upload da prova
            if (provaFile) {
              setArquivos(prev => prev.map(a => 
                a === provaFile ? { ...a, status: 'processando', progresso: 10 } : a
              ));

              const fileName = `${provaFile.tipo_prova}/${provaFile.ano}/${Date.now()}-${provaFile.nome.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
              
              console.log('Tentando upload do arquivo:', fileName);
              console.log('Tamanho do arquivo:', provaFile.arquivo.size, 'bytes');
              console.log('Tipo do arquivo:', provaFile.arquivo.type);
              console.log('Session token disponível:', !!session?.access_token);
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('provas')
                .upload(fileName, provaFile.arquivo, {
                  cacheControl: '3600',
                  upsert: false,
                  ...(session && { authorization: `Bearer ${session.access_token}` })
                });
              
              console.log('Resultado do upload:', { data: uploadData, error: uploadError });

              if (uploadError) {
                if (uploadError.message.includes('403')) {
                  throw new Error('Você não tem permissão para fazer upload de arquivos');
                }
                throw uploadError;
              }

              const { data: { publicUrl } } = supabase.storage
                .from('provas')
                .getPublicUrl(fileName);

              urlProva = publicUrl;

              setArquivos(prev => prev.map(a => 
                a === provaFile ? { ...a, status: 'sucesso', progresso: 100 } : a
              ));
              totalSucesso++;
            }

            // Upload do gabarito
            if (gabaritoFile) {
              setArquivos(prev => prev.map(a => 
                a === gabaritoFile ? { ...a, status: 'processando', progresso: 10 } : a
              ));

              const gabaritoFileName = `${gabaritoFile.tipo_prova}/${gabaritoFile.ano}/${Date.now()}-${gabaritoFile.nome.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
              
              console.log('Tentando upload do gabarito:', gabaritoFileName);
              console.log('Tamanho do gabarito:', gabaritoFile.arquivo.size, 'bytes');
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('provas')
                .upload(gabaritoFileName, gabaritoFile.arquivo, {
                  cacheControl: '3600',
                  upsert: false,
                  ...(session && { authorization: `Bearer ${session.access_token}` })
                });
              
              console.log('Resultado do upload gabarito:', { data: uploadData, error: uploadError });

              if (uploadError) {
                if (uploadError.message.includes('403')) {
                  throw new Error('Você não tem permissão para fazer upload de arquivos');
                }
                throw uploadError;
              }

              const { data: { publicUrl } } = supabase.storage
                .from('provas')
                .getPublicUrl(gabaritoFileName);

              urlGabarito = publicUrl;

              setArquivos(prev => prev.map(a => 
                a === gabaritoFile ? { ...a, status: 'sucesso', progresso: 100 } : a
              ));
              totalSucesso++;
            }

            // Inserir no banco
            console.log('📤 Tentando salvar no banco:', {
              filename: primeiroArquivo.nome,
              metadata: {
                instituicao: primeiroArquivo.instituicao,
                tipo_prova: primeiroArquivo.tipo_prova,
                ano: primeiroArquivo.ano,
                titulo: primeiroArquivo.tituloFinal || `${primeiroArquivo.tipo_prova} ${primeiroArquivo.ano}`,
                subtitulo: subtitulo !== 'geral' ? subtitulo : undefined,
              }
            });
            
            const { error: dbError } = await supabase
              .from('provas')
              .insert({
                grupo_id,
                instituicao: primeiroArquivo.instituicao,
                tipo_prova: primeiroArquivo.tipo_prova,
                ano: primeiroArquivo.ano,
                titulo: primeiroArquivo.tituloFinal || `${primeiroArquivo.tipo_prova} ${primeiroArquivo.ano}`,
                subtitulo: subtitulo !== 'geral' ? subtitulo : undefined,
                ordem,
                url_prova: urlProva,
                url_gabarito: urlGabarito,
                ativo: true,
                visualizacoes: 0
              });

            if (dbError) {
              if (dbError.message.includes('403')) {
                throw new Error('Você não tem permissão para adicionar provas ao banco de dados');
              }
              throw dbError;
            }

            ordem++;
            totalProcessados++;

          } catch (error: any) {
            console.error('Erro no upload:', error);
            totalErros++;
            
            if (provaFile) {
              setArquivos(prev => prev.map(a => 
                a === provaFile ? { ...a, status: 'erro', erro: error.message, progresso: 0 } : a
              ));
            }
            if (gabaritoFile) {
              setArquivos(prev => prev.map(a => 
                a === gabaritoFile ? { ...a, status: 'erro', erro: error.message, progresso: 0 } : a
              ));
            }
          }
        }
      }

      // Resultado final
      console.log('=== RESULTADO FINAL ===');
      console.log('Total processados:', totalProcessados);
      console.log('Total sucesso:', totalSucesso);
      console.log('Total erros:', totalErros);
      
      if (totalSucesso > 0) {
        toast.success(`Upload concluído! ${totalSucesso} arquivo(s) enviado(s) com sucesso`, 'Upload Concluído');
        
        setTimeout(() => {
          router.push('/admin/dashboard/provas');
        }, 2000);
      }

      if (totalErros > 0) {
        toast.error(`${totalErros} arquivo(s) falharam no upload`, 'Alguns Uploads Falharam');
      }

    } catch (error: any) {
      console.error('Erro geral no upload:', error);
      console.error('Stack trace:', error.stack);
      toast.handleError(error, 'Erro durante o upload');
    } finally {
      setProcessando(false);
    }
  };

  const removerArquivo = (index: number) => {
    setArquivos(prev => prev.filter((_, i) => i !== index));
    toast.info('Arquivo removido da lista');
  };

  // Loading state para verificação de admin
  if (adminLoading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verificando permissões...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Bloqueio de acesso para não-admins
  if (!isAdmin) {
    return (
      <AuthGuard>
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-700 mb-2">Acesso Negado</h2>
              <p className="text-red-600">Você não tem permissão para acessar esta página.</p>
              <p className="text-sm text-red-500 mt-2">Apenas administradores podem fazer upload de provas.</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto p-6">
        <Link
          href="/admin/dashboard/provas"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Provas
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload em Massa de Provas</h1>
          <p className="text-gray-600 mt-2">Sistema inteligente de detecção e upload de provas</p>
        </div>

        {/* Instruções */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
        >
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Padrões de Nomenclatura
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-2">Exemplos aceitos:</p>
              <ul className="space-y-1">
                <li>• PSC-2024-Etapa1-Prova.pdf</li>
                <li>• PSI-2024-Dia1-Gabarito.pdf</li>
                <li>• MACRO-2024-Biologicas-Prova.pdf</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Mais exemplos:</p>
              <ul className="space-y-1">
                <li>• SIS-2024-Etapa1-Prova.pdf</li>
                <li>• ENEM-2024-Dia1-Prova.pdf</li>
                <li>• UERR-2024-Prova.pdf</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Dropzone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
            dragAtivo 
              ? 'border-green-500 bg-green-50 scale-105' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input
            type="file"
            id="file-input"
            multiple
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
            disabled={processando}
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
              dragAtivo ? 'text-green-500' : 'text-gray-400'
            }`} />
            <p className="text-lg text-gray-600 mb-2">
              {dragAtivo
                ? 'Solte os arquivos aqui...'
                : 'Arraste arquivos PDF ou clique para selecionar'}
            </p>
            <p className="text-sm text-gray-500">
              Apenas arquivos PDF são aceitos
            </p>
          </label>
        </motion.div>

        {/* Lista de arquivos */}
        <AnimatePresence>
          {arquivos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Arquivos Selecionados ({arquivos.length})
                </h3>
                <LoadingButton
                  onClick={processarUpload}
                  loading={processando}
                  loadingText="Enviando..."
                  disabled={arquivos.length === 0}
                  variant="primary"
                  size="lg"
                  className="shadow-lg font-semibold transform hover:scale-105 border-2 border-green-700"
                >
                  <Upload className="w-5 h-5" />
                  Iniciar Upload
                </LoadingButton>
              </div>

              <div className="space-y-3">
                {arquivos.map((arquivo, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      arquivo.status === 'sucesso' ? 'bg-green-50 border-green-200' :
                      arquivo.status === 'erro' ? 'bg-red-50 border-red-200' :
                      arquivo.status === 'processando' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Ícone do arquivo */}
                      <div className="flex-shrink-0">
                        {arquivo.tipo === 'gabarito' || (arquivo.nome.toLowerCase().includes('gabarito')) ? (
                          <div className="bg-green-100 p-3 rounded-lg">
                            <div className="relative">
                              <FileText className="w-8 h-8 text-green-600" />
                              <CheckCircle className="w-5 h-5 text-green-700 absolute -bottom-1 -right-1 bg-white rounded-full border-2 border-green-100" />
                            </div>
                            <p className="text-xs text-green-700 mt-1 font-medium text-center">Gabarito</p>
                          </div>
                        ) : (
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <FileText className="w-8 h-8 text-gray-600" />
                            <p className="text-xs text-gray-600 mt-1 text-center">Prova</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-gray-900 truncate">{arquivo.nome}</p>
                        <p className="text-xs text-gray-500">
                          {arquivo.tipo_prova} • {arquivo.ano} • {arquivo.tipo}
                          {arquivo.subtitulo && ` • ${arquivo.subtitulo}`}
                        </p>
                        
                        {/* Prévia do título final */}
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <p className="text-blue-800 font-medium">
                            Título na página: {arquivo.tituloFinal || 'Aguardando detecção...'}
                          </p>
                          <div className="flex gap-2 mt-1 text-xs">
                            {arquivo.subcategoria && (
                              <span className="text-blue-600">
                                Subcategoria: {arquivo.subcategoria}
                              </span>
                            )}
                            {arquivo.area && (
                              <span className="text-green-600">
                                Área: {arquivo.area}
                              </span>
                            )}
                          </div>
                          {arquivos.some(a => 
                            a !== arquivo && 
                            a.tipo_prova === arquivo.tipo_prova && 
                            a.ano === arquivo.ano && 
                            a.subtitulo === arquivo.subtitulo &&
                            a.tipo !== arquivo.tipo
                          ) && (
                            <p className="text-blue-600 text-xs mt-1">
                              ✓ Prova e gabarito serão agrupados juntos
                            </p>
                          )}
                        </div>
                        {arquivo.status === 'processando' && arquivo.progresso !== undefined && (
                          <div className="mt-2">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${arquivo.progresso}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {arquivo.erro && (
                          <p className="text-xs text-red-600 mt-1">{arquivo.erro}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {arquivo.status === 'pendente' && !processando && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(index)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                            title="Editar informações"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removerArquivo(index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                            title="Remover arquivo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      {arquivo.status === 'processando' && (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-xs text-blue-600">Enviando...</span>
                        </div>
                      )}
                      
                      {arquivo.status === 'sucesso' && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                          </div>
                          <span className="text-xs text-green-600">Sucesso</span>
                        </div>
                      )}
                      
                      {arquivo.status === 'erro' && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                          <span className="text-xs text-red-600">Erro</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Confirmação */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Confirmar Arquivos para Upload</h2>
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-gray-600 mt-2">Revise e edite as informações detectadas antes de enviar</p>
                </div>

                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                  <div className="space-y-4">
                    {arquivos.map((arquivo, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        {editingIndex === index ? (
                          /* Modo de Edição */
                          <div className="space-y-4">
                            <div className="font-medium text-gray-700">{arquivo.nome}</div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Instituição
                                </label>
                                <select
                                  value={editForm?.instituicao || ''}
                                  onChange={(e) => setEditForm({ ...editForm, instituicao: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="UFAM">UFAM</option>
                                  <option value="UEA">UEA</option>
                                  <option value="UFRR">UFRR</option>
                                  <option value="UERR">UERR</option>
                                  <option value="ENEM">ENEM</option>
                                  <option value="OUTRAS">OUTRAS</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Tipo de Prova
                                </label>
                                <select
                                  value={editForm?.tipo_prova || ''}
                                  onChange={(e) => setEditForm({ ...editForm, tipo_prova: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {Object.values(EXAM_TYPES).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Ano
                                </label>
                                <input
                                  type="number"
                                  value={editForm?.ano || ''}
                                  onChange={(e) => setEditForm({ ...editForm, ano: parseInt(e.target.value) })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="2000"
                                  max="2030"
                                />
                              </div>
                              {/* Subcategoria condicional */}
                              {editForm?.tipo_prova && SUBCATEGORY_MAP[editForm.tipo_prova as ExamType] && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editForm.tipo_prova === EXAM_TYPES.PSC || editForm.tipo_prova === EXAM_TYPES.SIS || editForm.tipo_prova === EXAM_TYPES.PSS ? 'Etapa' :
                                     editForm.tipo_prova === EXAM_TYPES.PSI || editForm.tipo_prova === EXAM_TYPES.ENEM ? 'Dia' :
                                     editForm.tipo_prova === EXAM_TYPES.MACRO ? 'Tipo' : 'Subcategoria'}
                                  </label>
                                  <select
                                    value={editForm?.subcategoria || ''}
                                    onChange={(e) => setEditForm({ ...editForm, subcategoria: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">Selecione...</option>
                                    {SUBCATEGORY_MAP[editForm.tipo_prova as ExamType].map(sub => (
                                      <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              {/* Área condicional para MACRO */}
                              {editForm?.tipo_prova === EXAM_TYPES.MACRO && editForm?.subcategoria !== 'DIA 1' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Área
                                  </label>
                                  <select
                                    value={editForm?.area || ''}
                                    onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">Selecione...</option>
                                    {MACRO_AREAS.map(area => (
                                      <option key={area} value={area}>{area}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Título Final
                                </label>
                                <input
                                  type="text"
                                  value={editForm?.tituloFinal || ''}
                                  onChange={(e) => setEditForm({ ...editForm, tituloFinal: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Modo de Visualização */
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-700">{arquivo.nome}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                                  {arquivo.instituicao}
                                </span>
                                <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                                  {arquivo.tipo_prova}
                                </span>
                                <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                                  {arquivo.ano}
                                </span>
                                {arquivo.subcategoria && (
                                  <span className="inline-block bg-blue-100 px-2 py-1 rounded mr-2">
                                    Subcategoria: {arquivo.subcategoria}
                                  </span>
                                )}
                                {arquivo.area && (
                                  <span className="inline-block bg-green-100 px-2 py-1 rounded mr-2">
                                    Área: {arquivo.area}
                                  </span>
                                )}
                                <span className="inline-block bg-yellow-100 px-2 py-1 rounded">
                                  {arquivo.tipo === 'gabarito' ? 'Gabarito' : 'Prova'}
                                </span>
                              </div>
                              <div className="text-sm font-medium text-blue-600 mt-2">
                                Título: {arquivo.tituloFinal}
                              </div>
                            </div>
                            <button
                              onClick={() => handleEdit(index)}
                              className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {arquivos.length} arquivo(s) prontos para upload
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowConfirmModal(false)}
                        className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirmModal(false);
                          processarUpload();
                        }}
                        className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors font-semibold"
                      >
                        Confirmar e Enviar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthGuard>
  );
}