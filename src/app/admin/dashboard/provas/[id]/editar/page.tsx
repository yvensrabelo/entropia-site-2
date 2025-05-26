'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Prova, SUBCATEGORIAS, AREAS_MACRO, ProvaFormData } from '@/lib/types/prova';
import AuthGuard from '@/components/admin/AuthGuard';

export default function EditarProvaPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingProva, setLoadingProva] = useState(true);
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

  useEffect(() => {
    fetchProva();
  }, [params.id]);

  const fetchProva = async () => {
    try {
      const { data, error } = await supabase
        .from('provas')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          instituicao: data.instituicao,
          tipo_prova: data.tipo_prova,
          subcategoria: data.subcategoria || '',
          area: data.area || '',
          ano: data.ano,
          etapa: data.etapa || '',
          titulo: data.titulo,
          descricao: data.descricao || '',
          tags: data.tags ? data.tags.join(', ') : ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar prova:', error);
      alert('Erro ao carregar prova');
      router.push('/admin/dashboard/provas');
    } finally {
      setLoadingProva(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('provas')
        .update({
          ...formData,
          subcategoria: formData.subcategoria || null,
          area: formData.area || null,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
        })
        .eq('id', params.id);

      if (error) throw error;

      alert('Prova atualizada com sucesso!');
      router.push('/admin/dashboard/provas');
    } catch (error) {
      console.error('Erro ao atualizar prova:', error);
      alert('Erro ao atualizar prova. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProva) {
    return (
      <AuthGuard>
        <div className="p-6 flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AuthGuard>
    );
  }

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

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Prova</h1>

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
              onChange={(e) => {
                const tipo = e.target.value;
                setFormData({ 
                  ...formData, 
                  tipo_prova: tipo,
                  subcategoria: '',
                  area: ''
                });
              }}
            >
              <option value="">Selecione</option>
              <option value="PSC">PSC</option>
              <option value="PSI">PSI</option>
              <option value="PSMV">PSMV</option>
              <option value="VESTIBULAR">Vestibular</option>
              <option value="MACRO">MACRO</option>
              <option value="SIS">SIS</option>
              <option value="ENEM">ENEM</option>
              <option value="UERR">UERR</option>
              <option value="UFRR">UFRR</option>
            </select>
          </div>

          {/* Campo de subcategoria condicional */}
          {formData.tipo_prova && SUBCATEGORIAS[formData.tipo_prova] && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategoria
              </label>
              <select
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.subcategoria}
                onChange={(e) => {
                  const subcategoria = e.target.value;
                  setFormData({ 
                    ...formData, 
                    subcategoria,
                    area: subcategoria === 'DIA 2' ? '' : formData.area
                  });
                }}
              >
                <option value="">Selecione</option>
                {SUBCATEGORIAS[formData.tipo_prova].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}

          {/* Campo de área condicional para MACRO DIA 2 */}
          {formData.tipo_prova === 'MACRO' && formData.subcategoria === 'DIA 2' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área
              </label>
              <select
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
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

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Os arquivos PDF não podem ser alterados. Para trocar o arquivo, exclua esta prova e crie uma nova.
          </p>
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
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
      </div>
    </AuthGuard>
  );
}