// ====================================================================
// DEBUG SCRIPT - Execute no console do navegador na página admin/dashboard/aulas
// ====================================================================

async function debugDescritoresAdmin() {
  console.clear();
  console.log('🔍 INICIANDO DEBUG DE DESCRITORES ADMIN...\n');
  
  // 1. Testar API diretamente
  console.log('📡 1. TESTANDO API /api/descritores-v2');
  console.log('=====================================');
  
  const hoje = new Date().toISOString().split('T')[0];
  const url = `/api/descritores-v2?admin=true&data=${hoje}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('📊 Total de descritores:', data.descritores?.length || 0);
    console.log('🔍 Filtros aplicados:', data.filtros_aplicados);
    
    if (data.descritores && data.descritores.length > 0) {
      console.log('\n📋 PRIMEIRO DESCRITOR:');
      console.table(data.descritores[0]);
      
      console.log('\n🔑 CAMPOS IMPORTANTES:');
      data.descritores.forEach((desc, idx) => {
        console.log(`Descritor ${idx + 1}:`, {
          id: desc.id,
          horario_id: desc.horario_id,
          data: desc.data,
          professor_id: desc.professor_id,
          descricao_livre: desc.descricao_livre?.substring(0, 50) + '...'
        });
      });
    }
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
  }
  
  // 2. Buscar horários/aulas
  console.log('\n\n📚 2. VERIFICANDO ESTRUTURA DE AULAS');
  console.log('=====================================');
  
  // Simular busca de horários (ajuste conforme necessário)
  try {
    // Se horariosService estiver disponível globalmente
    if (typeof horariosService !== 'undefined') {
      const horarios = await horariosService.listarHorarios();
      console.log('✅ Total de horários:', horarios.length);
      
      if (horarios.length > 0) {
        console.log('\n🎯 PRIMEIRO HORÁRIO/AULA:');
        console.table(horarios[0]);
        
        console.log('\n🔑 IDs DOS HORÁRIOS:');
        horarios.slice(0, 5).forEach((h, idx) => {
          console.log(`Horário ${idx + 1}:`, {
            id: h.id,
            tempo: h.tempo,
            materia: h.materia,
            turma: h.turma,
            professor_id: h.professor_id
          });
        });
      }
    } else {
      console.log('⚠️  horariosService não está disponível globalmente');
    }
  } catch (error) {
    console.error('❌ Erro ao buscar horários:', error);
  }
  
  // 3. Análise de compatibilidade
  console.log('\n\n🔗 3. ANÁLISE DE COMPATIBILIDADE DE IDs');
  console.log('========================================');
  
  console.log(`
PROBLEMAS COMUNS:
1. ❌ horario_id do descritor não bate com id da aula
2. ❌ Descritor tem professor_id diferente da aula
3. ❌ Data do descritor não é a data selecionada
4. ❌ Turma do descritor não é a turma filtrada

SOLUÇÃO:
- Verificar se o descritor está sendo salvo com o horario_id correto
- Confirmar que o filtro de data está funcionando
- Verificar se não há problema de timezone na data
  `);
  
  // 4. Sugestão de teste manual
  console.log('\n\n🧪 4. TESTE MANUAL SUGERIDO');
  console.log('===========================');
  console.log(`
1. Abra a aba Network do DevTools
2. Recarregue a página
3. Procure pela requisição para /api/descritores-v2
4. Verifique:
   - Query parameters enviados
   - Response retornada
   - Se há descritores no array

5. No console, verifique os logs:
   - [DEBUG AULAS] Aulas carregadas
   - [DEBUG DESCRITORES] Estrutura completa
   - [DEBUG FINAL] Comparação IDs
  `);
}

// Executar automaticamente
debugDescritoresAdmin();

// Para executar novamente:
// debugDescritoresAdmin()