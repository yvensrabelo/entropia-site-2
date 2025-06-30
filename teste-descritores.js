// ====================================================================
// TESTE DO NOVO DESCRITORES SERVICE
// Execute este código no console do navegador ou como script Node.js
// ====================================================================

// Código para testar no console do navegador:
/*
// 1. Abra o navegador na página do dashboard
// 2. Abra o Developer Tools (F12)
// 3. Cole e execute este código no console:

async function testarDescritoresService() {
  console.log('🧪 [TESTE] Iniciando teste do descritoresService...')
  
  // Dados de teste para o CPF '98660608291'
  const dataHoje = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const cpfTeste = '98660608291'
  
  // Criar descritor de teste
  const descritoresTeste = {
    'aula-123': {
      assunto: 'Matemática - Funções Exponenciais',
      observacoes: 'Aula sobre propriedades das funções exponenciais',
      professor_id: 'UUID_DO_PROFESSOR', // Será resolvido automaticamente
      horario_id: 'aula-123',
      minutos_aula: 50
    }
  }
  
  try {
    // Importar o serviço (se disponível)
    if (typeof descritoresService !== 'undefined') {
      console.log('✅ [TESTE] Serviço encontrado, testando salvamento...')
      
      // Testar salvamento
      const sucesso = await descritoresService.salvarDescritoresPorData(dataHoje, descritoresTeste)
      console.log('💾 [TESTE] Resultado do salvamento:', sucesso)
      
      // Testar busca
      const descritoresRecuperados = await descritoresService.obterDescritoresPorData(dataHoje)
      console.log('🔍 [TESTE] Descritores recuperados:', descritoresRecuperados)
      
      return { sucesso, descritoresRecuperados }
    } else {
      console.error('❌ [TESTE] descritoresService não encontrado no escopo global')
      return null
    }
  } catch (error) {
    console.error('💥 [TESTE] Erro durante o teste:', error)
    return null
  }
}

// Executar teste
testarDescritoresService().then(resultado => {
  console.log('🏁 [TESTE] Teste finalizado:', resultado)
})
*/

// ====================================================================
// ALTERNATIVA: Teste direto via API (para usar no console)
// ====================================================================

async function testarViaAPI() {
  console.log('🧪 [TESTE API] Testando via API diretamente...')
  
  const cpfTeste = '98660608291'
  
  try {
    // Testar endpoint de minutos
    const response = await fetch(`/api/professores/minutos?cpf=${cpfTeste}`)
    const resultado = await response.json()
    
    console.log('📊 [TESTE API] Status:', response.status)
    console.log('📊 [TESTE API] Resultado:', resultado)
    
    if (response.ok) {
      console.log('✅ [TESTE API] API funcionando! Minutos encontrados:', resultado.minutos)
    } else {
      console.log('❌ [TESTE API] Erro na API:', resultado.error)
    }
    
    return resultado
  } catch (error) {
    console.error('💥 [TESTE API] Erro na requisição:', error)
    return null
  }
}

// Para executar no console:
// testarViaAPI()

// ====================================================================
// VERIFICAÇÃO MANUAL NO SUPABASE
// Execute esta query no Supabase SQL Editor para verificar dados:
// ====================================================================

/*
-- Verificar se existem descritores para o professor
SELECT 
    d.*,
    p.nome as professor_nome,
    p.cpf as professor_cpf
FROM descritores d
JOIN professores p ON d.professor_id = p.id
WHERE p.cpf = '98660608291'
ORDER BY d.created_at DESC
LIMIT 10;

-- Verificar total de minutos do mês para o professor
SELECT 
    p.nome,
    p.cpf,
    COUNT(d.id) as total_aulas,
    SUM(d.minutos_aula) as total_minutos,
    AVG(d.minutos_aula) as media_minutos
FROM descritores d
JOIN professores p ON d.professor_id = p.id
WHERE p.cpf = '98660608291'
AND d.data >= DATE_TRUNC('month', CURRENT_DATE)::DATE
GROUP BY p.nome, p.cpf;

-- Testar a função diretamente
SELECT minutos_do_mes('98660608291') as minutos_calculados;
*/

console.log('📄 [INFO] Arquivo de teste criado. Use as funções acima no console do navegador.')