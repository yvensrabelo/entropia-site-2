'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import ProvaCard from './ProvaCard';
import { Prova } from '@/lib/types/prova';
import { Loader2, FileText } from 'lucide-react';

export default function ProvasList() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProvas();
  }, []);

  const fetchProvas = async () => {
    try {
      if (!supabase) {
        console.log('Supabase não está configurado');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('provas')
        .select('*')
        .order('ano', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProvas(data || []);
    } catch (error) {
      console.error('Erro ao buscar provas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (provas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhuma prova disponível ainda.</p>
          <p className="text-gray-400 text-sm mt-2">
            As provas serão adicionadas em breve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {provas.map((prova) => (
        <ProvaCard key={prova.id} prova={prova} />
      ))}
    </div>
  );
}