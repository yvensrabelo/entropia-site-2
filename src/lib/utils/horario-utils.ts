/**
 * Utilities for handling class schedules and time calculations
 */

/**
 * Detect shift based on start time
 */
export const detectarTurno = (hora: string): 'manhã' | 'tarde' | 'noite' => {
  const [h] = hora.split(':').map(Number);
  if (h >= 7 && h < 12) return 'manhã';
  if (h >= 13 && h < 18) return 'tarde';
  return 'noite';
};

/**
 * Calculate class period (tempo) based on start time
 */
export const calcularTempo = (hora: string): number => {
  const [h] = hora.split(':').map(Number);
  
  // Manhã (7-11h)
  if (h === 7) return 1;
  if (h === 8) return 2;
  if (h === 9) return 3;
  if (h === 10) return 4;
  if (h === 11) return 5;
  
  // Tarde (13-17h)
  if (h === 13) return 1;
  if (h === 14) return 2;
  if (h === 15) return 3;
  if (h === 16) return 4;
  if (h === 17) return 5;
  
  // Noite (19-21h)
  if (h === 19) return 1;
  if (h === 20) return 2;
  if (h === 21) return 3;
  
  return 1; // fallback
};

/**
 * Get current day name in Portuguese
 */
export const getDiaAtual = (): string => {
  const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  return dias[new Date().getDay()];
};

/**
 * Get day name from date
 */
export const getDiaDaSemana = (date: Date): string => {
  const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  return dias[date.getDay()];
};

/**
 * Convert day name to proper case
 */
export const formatDiaName = (dia: string): string => {
  const mapping: Record<string, string> = {
    'domingo': 'Domingo',
    'segunda': 'Segunda',
    'terça': 'Terça', 
    'quarta': 'Quarta',
    'quinta': 'Quinta',
    'sexta': 'Sexta',
    'sábado': 'Sábado'
  };
  return mapping[dia.toLowerCase()] || dia;
};

/**
 * Check if a class is currently happening
 */
export const isAulaAtual = (horaInicio: string, horaFim: string): boolean => {
  const agora = new Date().toTimeString().slice(0, 5);
  return agora >= horaInicio && agora <= horaFim;
};

/**
 * Get formatted time range
 */
export const getHorarioFormatado = (horaInicio: string, horaFim: string): string => {
  return `${horaInicio} - ${horaFim}`;
};