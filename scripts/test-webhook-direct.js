// Teste direto do webhook da catraca
require('dotenv').config({ path: '.env.local' });

async function testWebhook() {
  console.log('🧪 Testando webhook da catraca...\n');
  
  const testData = {
    enrollid: 78,
    nome: "IANDRA LIVIA DE SOUZA CUNHA",
    time: "2025-05-26 10:30:00",
    access: 1,
    message: "LIBERADO (TESTE MANUAL)"
  };
  
  console.log('📤 Enviando dados:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch('http://localhost:3002/api/webhook/catraca', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('\n📥 Resposta recebida:');
    console.log('   Status:', response.status);
    console.log('   Body:', JSON.stringify(result, null, 2));
    
    // Teste 2: Com aluno que pode não existir
    console.log('\n🧪 Teste 2: Aluno que pode não existir...');
    const testData2 = {
      enrollid: 99,
      nome: "ALUNO TESTE INEXISTENTE",
      time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      access: 1,
      message: "TESTE ALUNO INEXISTENTE"
    };
    
    const response2 = await fetch('http://localhost:3002/api/webhook/catraca', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData2)
    });
    
    const result2 = await response2.json();
    console.log('\n📥 Resposta teste 2:', JSON.stringify(result2, null, 2));
    
    // Teste 3: Access bloqueado
    console.log('\n🧪 Teste 3: Access bloqueado...');
    const testData3 = {
      enrollid: 100,
      nome: "IANDRA LIVIA DE SOUZA CUNHA",
      time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      access: 0,
      message: "BLOQUEADO (INADIMPLENTE)"
    };
    
    const response3 = await fetch('http://localhost:3002/api/webhook/catraca', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData3)
    });
    
    const result3 = await response3.json();
    console.log('\n📥 Resposta teste 3:', JSON.stringify(result3, null, 2));
    
  } catch (error) {
    console.error('\n❌ Erro ao testar:', error);
  }
  
  console.log('\n✅ Testes concluídos! Verifique os logs do servidor.');
}

// Executa
testWebhook();