/**
 * Utilitário para limpeza de dados obsoletos do localStorage
 */

export function cleanupObsoleteStorage() {
  if (typeof window === 'undefined') return;

  const keysToRemove = [
    'turmas_cards',    // Sistema antigo de cards de turmas
    'turma_cards',     // Possível variação
    'cards_turmas',    // Possível variação
    'turmas_robustas'  // Sistema complexo antigo - migrado para turmas_simples
  ];

  let removedCount = 0;
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`🧹 Removida chave obsoleta: ${key}`);
    }
  });

  if (removedCount > 0) {
    console.log(`✅ Limpeza concluída: ${removedCount} chave(s) obsoleta(s) removida(s)`);
  }
}

// Executar limpeza automaticamente quando importado
if (typeof window !== 'undefined') {
  // Aguardar um frame para garantir que a aplicação carregou
  requestAnimationFrame(() => {
    cleanupObsoleteStorage();
  });
}