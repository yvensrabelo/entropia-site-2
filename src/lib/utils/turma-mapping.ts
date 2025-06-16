/**
 * Utilities for mapping between old turma names and new turmas ativas
 */

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
export const getMappedTurmaAtivaId = (oldTurmaName: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const mapeamentoLookup = localStorage.getItem('mapeamento_turmas_lookup');
    if (!mapeamentoLookup) return null;
    
    const lookup = JSON.parse(mapeamentoLookup);
    return lookup[oldTurmaName] || null;
  } catch (error) {
    console.error('Erro ao buscar mapeamento de turma:', error);
    return null;
  }
};

/**
 * Get the mapped turma ativa object for an old turma name
 */
export const getMappedTurmaAtiva = (oldTurmaName: string): TurmaAtiva | null => {
  const turmaAtivaId = getMappedTurmaAtivaId(oldTurmaName);
  if (!turmaAtivaId) return null;
  
  try {
    const turmasAtivas = localStorage.getItem('turmas_ativas');
    if (!turmasAtivas) return null;
    
    const turmas: TurmaAtiva[] = JSON.parse(turmasAtivas);
    return turmas.find(t => t.id === turmaAtivaId) || null;
  } catch (error) {
    console.error('Erro ao buscar turma ativa:', error);
    return null;
  }
};

/**
 * Get all active turmas ativas
 */
export const getTurmasAtivas = (): TurmaAtiva[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('turmas_ativas');
    if (!stored) return [];
    
    const turmas: TurmaAtiva[] = JSON.parse(stored);
    return turmas.filter(t => t.ativa).sort((a, b) => a.ordem - b.ordem);
  } catch (error) {
    console.error('Erro ao carregar turmas ativas:', error);
    return [];
  }
};

/**
 * Check if mapping is configured
 */
export const isMappingConfigured = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const mapeamentoLookup = localStorage.getItem('mapeamento_turmas_lookup');
    if (!mapeamentoLookup) return false;
    
    const lookup = JSON.parse(mapeamentoLookup);
    return Object.keys(lookup).length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Get turma name (try mapped first, fallback to original)
 */
export const getTurmaName = (originalName: string): string => {
  const mappedTurma = getMappedTurmaAtiva(originalName);
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