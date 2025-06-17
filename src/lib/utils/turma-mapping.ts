/**
 * Utilities for mapping between old turma names and new turmas ativas
 */

import { configuracoesService } from '@/services/configuracoesService';
import { turmasService } from '@/services/turmasService';

interface TurmaAtiva {
  id: string;
  nome: string;
  turno: 'manhã' | 'tarde' | 'noite';
  tipo: 'intensiva' | 'extensiva' | 'sis-psc';
  serie?: '1ª série' | '2ª série' | '3ª série' | 'Extensivo';
  ativa: boolean;
  ordem: number;
}

/**
 * Get the mapped turma ativa ID for an old turma name
 */
export const getMappedTurmaAtivaId = async (oldTurmaName: string): Promise<string | null> => {
  try {
    const lookup = await configuracoesService.obterMapeamentoLookup();
    return lookup[oldTurmaName] || null;
  } catch (error) {
    console.error('Erro ao buscar mapeamento de turma:', error);
    return null;
  }
};

/**
 * Get the mapped turma ativa object for an old turma name
 */
export const getMappedTurmaAtiva = async (oldTurmaName: string): Promise<TurmaAtiva | null> => {
  try {
    const turmaAtivaId = await getMappedTurmaAtivaId(oldTurmaName);
    if (!turmaAtivaId) return null;
    
    const turmasAtivas = await configuracoesService.obterTurmasAtivas();
    return turmasAtivas.find((t: any) => t.id === turmaAtivaId) || null;
  } catch (error) {
    console.error('Erro ao buscar turma ativa:', error);
    return null;
  }
};

/**
 * Get all active turmas ativas
 */
export const getTurmasAtivas = async (): Promise<TurmaAtiva[]> => {
  try {
    const turmas = await configuracoesService.obterTurmasAtivas();
    return turmas.filter((t: any) => t.ativa).sort((a: any, b: any) => a.ordem - b.ordem);
  } catch (error) {
    console.error('Erro ao carregar turmas ativas:', error);
    return [];
  }
};

/**
 * Check if mapping is configured
 */
export const isMappingConfigured = async (): Promise<boolean> => {
  try {
    const lookup = await configuracoesService.obterMapeamentoLookup();
    return Object.keys(lookup).length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Get turma name (try mapped first, fallback to original)
 */
export const getTurmaName = async (originalName: string): Promise<string> => {
  const mappedTurma = await getMappedTurmaAtiva(originalName);
  return mappedTurma?.nome || originalName;
};

/**
 * Listen for mapping changes across tabs
 */
export const onMappingChange = (callback: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'mapeamento_turmas' || e.key === 'mapeamento_turmas_lookup' || e.key === 'turmas_ativas') {
      callback();
    }
  };
  
  const handleFocus = () => {
    callback();
  };
  
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('focus', handleFocus);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('focus', handleFocus);
  };
};