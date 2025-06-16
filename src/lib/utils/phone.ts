// DDDs válidos no Brasil
const DDDS_VALIDOS = [
  '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
  '21', '22', '24', // RJ
  '27', '28', // ES
  '31', '32', '33', '34', '35', '37', '38', // MG
  '41', '42', '43', '44', '45', '46', // PR
  '47', '48', '49', // SC
  '51', '53', '54', '55', // RS
  '61', // DF
  '62', '64', // GO
  '63', // TO
  '65', '66', // MT
  '67', // MS
  '68', // AC
  '69', // RO
  '71', '73', '74', '75', '77', // BA
  '79', // SE
  '81', '87', // PE
  '82', // AL
  '83', // PB
  '84', // RN
  '85', '88', // CE
  '86', '89', // PI
  '91', '93', '94', // PA
  '92', '97', // AM
  '95', // RR
  '96', // AP
  '98', '99', // MA
];

/**
 * Remove todos os caracteres não numéricos do telefone
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Aplica máscara de WhatsApp brasileiro (XX) 9XXXX-XXXX
 */
export function formatWhatsAppMask(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara progressivamente
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 3) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)}${numbers.slice(3)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)}${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  } else {
    // Limita a 11 dígitos
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)}${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
}

/**
 * Valida WhatsApp brasileiro com validação rigorosa
 */
export function validateWhatsApp(phone: string): { isValid: boolean; error?: string } {
  const numbers = cleanPhoneNumber(phone);
  
  // Deve ter exatamente 11 dígitos (DDD + 9 + 8 dígitos)
  if (numbers.length !== 11) {
    return {
      isValid: false,
      error: 'WhatsApp deve ter 11 dígitos: (DDD) 9XXXX-XXXX'
    };
  }
  
  // Extrair DDD
  const ddd = numbers.slice(0, 2);
  
  // Validar DDD
  if (!DDDS_VALIDOS.includes(ddd)) {
    return {
      isValid: false,
      error: 'DDD inválido'
    };
  }
  
  // Terceiro dígito deve ser 9 (celular)
  const ninthDigit = numbers[2];
  if (ninthDigit !== '9') {
    return {
      isValid: false,
      error: 'WhatsApp deve ser celular: (DDD) 9XXXX-XXXX'
    };
  }
  
  // Verificar se não é sequência repetida (ex: 11999999999)
  const restOfNumber = numbers.slice(3);
  const isRepeated = restOfNumber.split('').every(digit => digit === restOfNumber[0]);
  if (isRepeated) {
    return {
      isValid: false,
      error: 'Número inválido'
    };
  }
  
  return { isValid: true };
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