'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NovaProvaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    instituicao: '',
    tipo_prova: '',
    ano: new Date().getFullYear(),
    etapa: '',
    titulo: '',
    descricao: '',
    tags: ''
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [gabaritoPdf, setGabaritoPdf] = useState<File | null>(null);

  // Teste de conexão com Supabase
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Testa leitura
        const { data: readTest, error: readError } = await supabase
          .from('provas')
          .select('count');
        console.log('Teste de leitura:', { readTest, readError });
        
        // Testa se pode acessar auth
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Sessão atual:', session);
        
        // Verifica RLS status
        const { data: rlsStatus } = await supabase
          .rpc('current_setting', { setting: 'row_security' })
          .catch(() => ({ data: 'RPC não disponível' }));
        console.log('RLS Status:', rlsStatus);
      } catch (err) {
        console.error('Erro no teste:', err);
      }
    };
    
    testConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      alert('Erro: Supabase não está configurado. Verifique as variáveis de ambiente.');
      return;
    }
    
    setLoading(true);

    try {
      // Teste de conexão com o banco
      const { data: testData, error: testError } = await supabase.from('provas').select('count');
      console.log('Teste de conexão:', testData);
      if (testError) {
        console.error('Erro no teste de conexão:', testError);
      }
      let url_pdf = '';
      let url_gabarito = '';

      // Upload do PDF principal
      if (pdfFile) {
        setUploading(true);
        const fileName = `${formData.instituicao}-${formData.tipo_prova}-${formData.ano}-${Date.now()}.pdf`;
        
        console.log('Tentando upload do arquivo:', fileName);
        console.log('Tamanho do arquivo:', pdfFile.size, 'bytes');
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('provas')
          .upload(fileName, pdfFile);

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          throw uploadError;
        }

        console.log('Upload bem sucedido:', uploadData);

        const { data: { publicUrl } } = supabase.storage
          .from('provas')
          .getPublicUrl(fileName);

        url_pdf = publicUrl;
        console.log('URL pública gerada:', url_pdf);
      }

      // Upload do gabarito se houver
      if (gabaritoPdf) {
        const gabaritoFileName = `gabarito-${formData.instituicao}-${formData.tipo_prova}-${formData.ano}-${Date.now()}.pdf`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('provas')
          .upload(gabaritoFileName, gabaritoPdf);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('provas')
          .getPublicUrl(gabaritoFileName);

        url_gabarito = publicUrl;
      }

      // Inserir dados no banco
      const dadosParaInserir = {
        ...formData,
        url_pdf,
        url_gabarito: url_gabarito || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        visualizacoes: 0
      };
      
      // Log completo antes de inserir
      console.log('Cliente Supabase:', supabase);
      console.log('Tentando inserir com dados:', {
        instituicao: formData.instituicao,
        tipo_prova: formData.tipo_prova,
        ano: formData.ano,
        etapa: formData.etapa,
        titulo: formData.titulo,
        url_pdf,
        url_gabarito: url_gabarito || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      });

      // Tenta um insert mais simples primeiro
      const { data: testInsert, error: testInsertError } = await supabase
        .from('provas')
        .insert({
          instituicao: 'TESTE',
          tipo_prova: 'TESTE',
          ano: 2024,
          titulo: 'Teste Simples',
          url_pdf: 'https://teste.com'
        })
        .select();

      console.log('Resultado do teste simples:', { testInsert, testInsertError });
      
      const { data: insertData, error } = await supabase
        .from('provas')
        .insert(dadosParaInserir)
        .select();

      if (error) {
        console.error('Erro ao inserir no banco:', error);
        console.error('Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Dados inseridos com sucesso:', insertData);

      alert('Prova adicionada com sucesso!');
      router.push('/admin/dashboard/provas');
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      alert(`Erro ao adicionar prova: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        href="/admin/dashboard/provas"
        className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Nova Prova</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instituição
            </label>
            <select
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.instituicao}
              onChange={(e) => setFormData({ ...formData, instituicao: e.target.value })}
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
              Tipo de Prova
            </label>
            <select
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.tipo_prova}
              onChange={(e) => setFormData({ ...formData, tipo_prova: e.target.value })}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ano
            </label>
            <input
              type="number"
              required
              min="2000"
              max="2099"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.ano}
              onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
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
              onChange={(e) => setFormData({ ...formData, etapa: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título
          </label>
          <input
            type="text"
            required
            placeholder="Ex: PSC 2024 - 1ª Etapa"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF da Prova
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
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
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
            disabled={loading || uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {(loading || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
            {uploading ? 'Enviando arquivo...' : loading ? 'Salvando...' : 'Adicionar Prova'}
          </button>
        </div>
      </form>
    </div>
  );
}