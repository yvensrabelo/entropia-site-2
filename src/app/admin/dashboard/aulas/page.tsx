'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Upload, 
  FileText, 
  Clock,
  RefreshCw
} from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Importar componentes existentes
import ProfessoresTab from './components/ProfessoresTab';
import HorariosTab from './components/HorariosTab';
import ImportarTab from './components/ImportarTab';
import DescritoresTab from './components/DescritoresTab';

type TabType = 'professores' | 'horarios' | 'importar' | 'descritores';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

const tabs: TabItem[] = [
  {
    id: 'professores',
    label: 'Professores',
    icon: Users,
    description: 'Gerenciar cadastro de professores'
  },
  {
    id: 'horarios',
    label: 'Horários',
    icon: Calendar,
    description: 'Grade de horários semanal'
  },
  {
    id: 'importar',
    label: 'Importar Planilha',
    icon: Upload,
    description: 'Importar dados de Excel'
  },
  {
    id: 'descritores',
    label: 'Descritores',
    icon: FileText,
    description: 'Descritores de aulas'
  }
];

export default function AulasPage() {
  const [activeTab, setActiveTab] = useState<TabType>('professores');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const supabase = createClientComponentClient();

  // Estados para refetch das abas
  const [refetchTriggers, setRefetchTriggers] = useState({
    professores: 0,
    horarios: 0,
    descritores: 0
  });

  // Real-time Supabase channels
  useEffect(() => {
    console.log('🔄 [AULAS] Configurando canais real-time...');
    
    const channel = supabase.channel('aulas_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'professores' },
        (payload) => {
          console.log('📡 [REALTIME] Mudança em professores:', payload);
          setRefetchTriggers(prev => ({ ...prev, professores: prev.professores + 1 }));
          setLastUpdate(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'horarios_aulas' },
        (payload) => {
          console.log('📡 [REALTIME] Mudança em horários:', payload);
          setRefetchTriggers(prev => ({ ...prev, horarios: prev.horarios + 1 }));
          setLastUpdate(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'descritores' },
        (payload) => {
          console.log('📡 [REALTIME] Mudança em descritores:', payload);
          setRefetchTriggers(prev => ({ ...prev, descritores: prev.descritores + 1 }));
          setLastUpdate(new Date());
        }
      )
      .subscribe((status) => {
        console.log('📡 [REALTIME] Status da subscrição:', status);
      });

    return () => {
      console.log('🔄 [AULAS] Desconectando canais real-time...');
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleRefreshAll = () => {
    setIsLoading(true);
    setRefetchTriggers(prev => ({
      professores: prev.professores + 1,
      horarios: prev.horarios + 1,
      descritores: prev.descritores + 1
    }));
    setLastUpdate(new Date());
    
    setTimeout(() => setIsLoading(false), 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'professores':
        return <ProfessoresTab refetchTrigger={refetchTriggers.professores} />;
      case 'horarios':
        return <HorariosTab refetchTrigger={refetchTriggers.horarios} />;
      case 'importar':
        return <ImportarTab />;
      case 'descritores':
        return <DescritoresTab refetchTrigger={refetchTriggers.descritores} />;
      default:
        return null;
    }
  };

  return (
    <AuthGuard>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestão de Aulas</h1>
              <p className="text-gray-600 mt-1">
                Sistema unificado para gerenciar professores, horários e descritores
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </div>
              
              <button
                onClick={handleRefreshAll}
                disabled={isLoading}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar Tudo
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Tab Description */}
          <div className="px-6 py-3 bg-gray-50">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>
    </AuthGuard>
  );
}