// Configuração da instância WhatsApp já existente no Evolution API
export const EXISTING_INSTANCE = {
  name: '5592991144473', // Nome da instância que já existe
  displayName: 'Entropia Cursinho',
  server_url: 'https://evolutionapi.cursoentropia.com',
  connected: true
};

// Função para verificar se está usando a instância existente
export function isExistingInstance(instanceName: string): boolean {
  return instanceName === EXISTING_INSTANCE.name || 
         instanceName.includes('5592991144473') ||
         instanceName.toLowerCase() === 'entropia';
}

// Função para obter o nome correto da instância
export function getCorrectInstanceName(inputName: string): string {
  if (isExistingInstance(inputName)) {
    return EXISTING_INSTANCE.name;
  }
  return inputName;
}