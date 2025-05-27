/**
 * Remove todos os caracteres não numéricos do telefone
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Valida se o telefone tem formato válido brasileiro
 * DDD (2 dígitos) + Número (8 ou 9 dígitos)
 * Aceita também números com código do país (55)
 */
export function isValidBrazilianPhone(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone);
  // Deve ter 10 dígitos (DDD + 8), 11 dígitos (DDD + 9), 
  // 12 dígitos (55 + DDD + 8) ou 13 dígitos (55 + DDD + 9)
  return cleaned.length === 10 || cleaned.length === 11 || 
         cleaned.length === 12 || cleaned.length === 13;
}

/**
 * Formata número para salvar no banco (apenas números)
 */
export function formatPhoneForDatabase(phone: string): string {
  return cleanPhoneNumber(phone);
}

/**
 * Formata número para envio WhatsApp (com código do país)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);
  
  // Se já tem código do país (55), retornar
  if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
    return cleaned;
  }
  
  // Adicionar código do Brasil se não tiver
  return '55' + cleaned;
}

/**
 * Formata número para exibição visual
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);
  
  // Se tem código do país (55), remover para exibição
  let phoneToFormat = cleaned;
  if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
    phoneToFormat = cleaned.substring(2);
  }
  
  if (phoneToFormat.length === 10) {
    // Formato: (XX) XXXX-XXXX
    return phoneToFormat.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (phoneToFormat.length === 11) {
    // Formato: (XX) XXXXX-XXXX
    return phoneToFormat.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return phone; // Retornar original se não for válido
}

/**
 * Extrai DDD do número
 */
export function extractDDD(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);
  
  // Se tem código do país (55), pular os 2 primeiros dígitos
  if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
    return cleaned.substring(2, 4);
  }
  
  return cleaned.substring(0, 2);
}

/**
 * Valida e formata telefone, retornando erro se inválido
 */
export function validateAndFormatPhone(phone: string): { 
  isValid: boolean; 
  formatted?: string; 
  error?: string;
  ddd?: string;
} {
  const cleaned = cleanPhoneNumber(phone);
  
  if (!cleaned) {
    return { 
      isValid: false, 
      error: 'Número de telefone é obrigatório' 
    };
  }
  
  if (cleaned.length < 10) {
    return { 
      isValid: false, 
      error: 'Número inválido. Verifique o DDD e o número.' 
    };
  }
  
  if (cleaned.length > 13) {
    return { 
      isValid: false, 
      error: 'Número muito longo. Use formato: 92981662806' 
    };
  }
  
  if (!isValidBrazilianPhone(cleaned)) {
    return { 
      isValid: false, 
      error: 'Número inválido. Verifique o DDD e o número.' 
    };
  }
  
  return { 
    isValid: true, 
    formatted: cleaned,
    ddd: extractDDD(cleaned)
  };
}