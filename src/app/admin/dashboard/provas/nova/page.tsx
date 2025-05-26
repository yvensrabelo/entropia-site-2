'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/admin/AuthGuard';
import { SUBCATEGORIAS, AREAS_MACRO, ProvaFormData } from '@/lib/types/prova';

export default function NovaProvaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProvaFormData>({
    instituicao: '',
    tipo_prova: '',
    subcategoria: '',
    area: '',
    ano: new Date().getFullYear(),
    etapa: '',
    titulo: '',
    descricao: '',
    tags: ''
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [gabaritoPdf, setGabaritoPdf] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  // Atualizar dados do formulário
  const updateFormData = (updates: Partial<ProvaFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Limpar campos dependentes quando o tipo muda
  const handleTipoChange = (tipo: string) => {
    updateFormData({
      tipo_prova: tipo,
      subcategoria: '',
      area: ''
    });
  };

  // Limpar área quando subcategoria muda
  const handleSubcategoriaChange = (subcategoria: string) => {
    updateFormData({
      subcategoria,
      area: subcategoria === 'DIA 2' ? formData.area : ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!supabase) {
      setError('Erro: Supabase não está configurado.');
      return;
    }

    if (!pdfFile) {
      setError('Selecione um arquivo PDF para a prova.');
      return;
    }
    
    setLoading(true);
    setUploading(true);

    try {
      let url_pdf = '';
      let url_gabarito = '';

      // Upload do PDF principal
      const timestamp = Date.now();
      const fileName = `${formData.instituicao}-${formData.tipo_prova}-${formData.ano}-${timestamp}.pdf`;
      
      console.log('Fazendo upload do arquivo:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('provas')
        .upload(fileName, pdfFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('Upload bem sucedido:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('provas')
        .getPublicUrl(fileName);

      url_pdf = publicUrl;
      console.log('URL pública gerada:', url_pdf);

      // Upload do gabarito se houver
      if (gabaritoPdf) {
        const gabaritoFileName = `gabarito-${formData.instituicao}-${formData.tipo_prova}-${formData.ano}-${timestamp}.pdf`;
        
        const { data: gabUploadData, error: gabUploadError } = await supabase.storage
          .from('provas')
          .upload(gabaritoFileName, gabaritoPdf, {
            cacheControl: '3600',
            upsert: false
          });

        if (gabUploadError) {
          console.error('Erro no upload do gabarito:', gabUploadError);
          throw new Error(`Erro no upload do gabarito: ${gabUploadError.message}`);
        }

        const { data: { publicUrl: gabPublicUrl } } = supabase.storage
          .from('provas')
          .getPublicUrl(gabaritoFileName);

        url_gabarito = gabPublicUrl;
      }

      setUploading(false);

      // Preparar dados para inserção
      const dadosParaInserir = {
        instituicao: formData.instituicao,
        tipo_prova: formData.tipo_prova,
        subcategoria: formData.subcategoria || null,
        area: formData.area || null,
        ano: formData.ano,
        etapa: formData.etapa || null,
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        url_pdf,
        url_gabarito: url_gabarito || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        visualizacoes: 0
      };
      
      console.log('Tentando inserir dados:', dadosParaInserir);

      const { data: insertData, error: insertError } = await supabase
        .from('provas')
        .insert(dadosParaInserir)
        .select();

      if (insertError) {
        console.error('Erro ao inserir no banco:', insertError);
        throw new Error(`Erro ao salvar no banco: ${insertError.message}`);
      }
      
      console.log('Dados inseridos com sucesso:', insertData);
      alert('Prova adicionada com sucesso!');
      router.push('/admin/dashboard/provas');
      
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      setError(error.message || 'Erro desconhecido ao adicionar prova');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Verificar se deve mostrar campo de subcategoria
  const shouldShowSubcategoria = formData.tipo_prova && SUBCATEGORIAS[formData.tipo_prova];
  
  // Verificar se deve mostrar campo de área
  const shouldShowArea = formData.tipo_prova === 'MACRO' && formData.subcategoria === 'DIA 2';

  return (
    <AuthGuard>
      <div className="p-6 max-w-4xl mx-auto">
        <Link
          href="/admin/dashboard/provas"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Nova Prova</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instituição *
              </label>
              <select
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.instituicao}
                onChange={(e) => updateFormData({ instituicao: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Prova *
              </label>
              <select
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.tipo_prova}
                onChange={(e) => handleTipoChange(e.target.value)}
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

            {/* Campo de subcategoria condicional */}
            {shouldShowSubcategoria && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategoria *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.subcategoria}
                  onChange={(e) => handleSubcategoriaChange(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {SUBCATEGORIAS[formData.tipo_prova].map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Campo de área condicional para MACRO DIA 2 */}
            {shouldShowArea && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.area}
                  onChange={(e) => updateFormData({ area: e.target.value })}
                >
                  <option value="">Selecione</option>
                  {AREAS_MACRO.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano *
              </label>
              <input
                type="number"
                required
                min="2000"
                max="2099"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.ano}
                onChange={(e) => updateFormData({ ano: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etapa (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: 1ª Etapa, 2ª Etapa"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.etapa}
                onChange={(e) => updateFormData({ etapa: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: PSC 2024 - 1ª Etapa"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.titulo}
              onChange={(e) => updateFormData({ titulo: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Descrição adicional da prova"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.descricao}
              onChange={(e) => updateFormData({ descricao: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF da Prova *
            </label>
            <input
              type="file"
              required
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF do Gabarito (opcional)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setGabaritoPdf(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              placeholder="Ex: psc, uea, 2024"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.tags}
              onChange={(e) => updateFormData({ tags: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/admin/dashboard/provas"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? 'Enviando arquivo...' : loading ? 'Salvando...' : 'Adicionar Prova'}
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}