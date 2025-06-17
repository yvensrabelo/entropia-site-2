// Script para executar no console do navegador onde as provas PSI aparecem
// Cole este código completo no console e execute

(async function sincronizarProvasPSI() {
  console.log('🔍 === INVESTIGANDO E SINCRONIZANDO PROVAS PSI ===');
  
  // Configuração do Supabase (usando as mesmas credenciais do site)
  const SUPABASE_URL = 'https://vckmcaqcbjduxozpufyb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZja21jYXFjYmpkdXhvenB1ZnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzM0NzEsImV4cCI6MjA1MTA0OTQ3MX0.w6F3aPBNbNOVt3aJyj6tWJ42TYzfbPt4jWvIRKMZYhc';
  
  try {
    // Carregar Supabase dinamicamente se não estiver disponível
    if (typeof window.supabase === 'undefined') {
      // Tentar usar o supabase global se existir
      if (typeof createClient !== 'undefined') {
        window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } else {
        console.log('⚠️ Supabase não disponível globalmente, continuando apenas com investigação...');
      }
    }
    
    // PASSO 1: INVESTIGAR LOCALSTORAGE
    console.log('\n📋 PASSO 1: Investigando localStorage...');
    
    const todasAsChaves = Object.keys(localStorage);
    console.log(`📊 Total de chaves: ${todasAsChaves.length}`);
    
    const chavesRelevantes = todasAsChaves.filter(key => 
      key.toLowerCase().includes('prova') ||
      key.toLowerCase().includes('psi') ||
      key.toLowerCase().includes('upload') ||
      key.toLowerCase().includes('arquivo')
    );
    
    console.log('🔑 Chaves relevantes:', chavesRelevantes);
    
    let provasPSIEncontradas = [];
    
    // Analisar cada chave
    for (const chave of chavesRelevantes) {
      const dados = localStorage.getItem(chave);
      if (dados) {
        try {
          const parsed = JSON.parse(dados);
          console.log(`\n📂 Chave '${chave}':`);
          console.log(parsed);
          
          // Se for array
          if (Array.isArray(parsed)) {
            const provasPSI = parsed.filter(item => 
              (item.tipo_prova && item.tipo_prova === 'PSI') ||
              (item.titulo && item.titulo.includes('PSI')) ||
              (item.nome && item.nome.includes('PSI'))
            );
            
            if (provasPSI.length > 0) {
              console.log(`✅ ${provasPSI.length} provas PSI encontradas:`, provasPSI);
              provasPSIEncontradas.push(...provasPSI);
            }
          }
          // Se for objeto
          else if (parsed && typeof parsed === 'object') {
            if ((parsed.tipo_prova === 'PSI') ||
                (parsed.titulo && parsed.titulo.includes('PSI')) ||
                (parsed.nome && parsed.nome.includes('PSI'))) {
              console.log('✅ Prova PSI encontrada:', parsed);
              provasPSIEncontradas.push(parsed);
            }
          }
        } catch (e) {
          console.log(`⚠️ Chave '${chave}' não é JSON válido`);
        }
      }
    }
    
    console.log(`\n🎯 TOTAL PSI NO LOCALSTORAGE: ${provasPSIEncontradas.length}`);
    
    if (provasPSIEncontradas.length === 0) {
      console.log('ℹ️ Nenhuma prova PSI encontrada no localStorage');
      console.log('💡 Isso pode significar que as provas já foram sincronizadas ou não existem');
      return;
    }
    
    // Mostrar detalhes das provas encontradas
    console.log('\n📚 PROVAS PSI ENCONTRADAS:');
    provasPSIEncontradas.forEach((prova, index) => {
      console.log(`${index + 1}. ${prova.titulo || prova.nome || 'Sem título'}`);
      console.log(`   Ano: ${prova.ano || 'Não definido'}`);
      console.log(`   Instituição: ${prova.instituicao || 'Vazio (correto para PSI)'}`);
      console.log(`   Subcategoria: ${prova.subcategoria || 'Não definida'}`);
      console.log(`   URL: ${prova.arquivo_url || prova.url || 'Não definida'}`);
      console.log('');
    });
    
    // PASSO 2: VERIFICAR O QUE JÁ EXISTE NO SUPABASE
    if (window.supabase) {
      console.log('\n📋 PASSO 2: Verificando provas PSI no Supabase...');
      
      const { data: existentes, error } = await window.supabase
        .from('provas')
        .select('titulo, ano, subtitulo')
        .eq('tipo_prova', 'PSI');
      
      if (error) {
        console.error('❌ Erro ao consultar Supabase:', error);
        return;
      }
      
      console.log(`📊 Provas PSI no Supabase: ${existentes?.length || 0}`);
      
      if (existentes && existentes.length > 0) {
        console.log('🗃️ PSI já no Supabase:');
        existentes.forEach((prova, index) => {
          console.log(`${index + 1}. ${prova.titulo} (${prova.ano})`);
        });
      }
      
      // PASSO 3: SINCRONIZAR NOVAS PROVAS
      console.log('\n📋 PASSO 3: Sincronizando provas novas...');
      
      // Filtrar apenas provas que não existem
      const existentesIds = new Set(
        existentes?.map(p => `${p.titulo}-${p.ano}`.toLowerCase()) || []
      );
      
      const provasNovas = provasPSIEncontradas.filter(prova => {
        const id = `${prova.titulo || prova.nome || ''}-${prova.ano || ''}`.toLowerCase();
        return !existentesIds.has(id);
      });
      
      console.log(`🆕 Provas novas para sincronizar: ${provasNovas.length}`);
      
      if (provasNovas.length === 0) {
        console.log('✅ Todas as provas PSI já estão sincronizadas!');
        return;
      }
      
      // Preparar dados para inserção
      const dadosParaInserir = provasNovas.map(prova => ({
        grupo_id: `psi-${prova.ano || new Date().getFullYear()}`,
        instituicao: prova.instituicao || '', // PSI deixa vazio para seleção manual
        tipo_prova: 'PSI',
        ano: prova.ano || new Date().getFullYear(),
        titulo: prova.titulo || prova.nome || `PSI ${prova.ano || new Date().getFullYear()}`,
        subtitulo: prova.subcategoria || prova.subtitulo || '',
        ordem: 1,
        url_prova: prova.arquivo_url || prova.url || '',
        url_gabarito: '', // Vazio por enquanto
        ativo: true,
        visualizacoes: 0
      }));
      
      console.log('📤 Dados preparados:', dadosParaInserir);
      
      // Inserir no Supabase
      const { data: inseridas, error: errorInsercao } = await window.supabase
        .from('provas')
        .insert(dadosParaInserir)
        .select();
      
      if (errorInsercao) {
        console.error('❌ Erro ao inserir no Supabase:', errorInsercao);
        
        // Tentar inserir uma por uma
        console.log('🔄 Tentando inserir individualmente...');
        let sucessos = 0;
        
        for (const dados of dadosParaInserir) {
          try {
            const { error } = await window.supabase
              .from('provas')
              .insert(dados);
            
            if (error) {
              console.error(`❌ Erro "${dados.titulo}":`, error.message);
            } else {
              console.log(`✅ "${dados.titulo}" inserida`);
              sucessos++;
            }
          } catch (e) {
            console.error(`❌ Erro inesperado "${dados.titulo}":`, e);
          }
        }
        
        console.log(`📊 ${sucessos}/${dadosParaInserir.length} provas sincronizadas`);
        
      } else {
        console.log('✅ SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log(`📊 ${inseridas?.length || 0} provas PSI adicionadas ao Supabase`);
        
        // Opcional: limpar localStorage
        const limparLocalStorage = confirm('Deseja limpar as provas do localStorage agora que foram sincronizadas?');
        if (limparLocalStorage) {
          chavesRelevantes.forEach(chave => {
            localStorage.removeItem(chave);
            console.log(`🗑️ Removida: ${chave}`);
          });
          console.log('🧹 localStorage limpo');
        }
      }
      
    } else {
      console.log('⚠️ Supabase não disponível - apenas investigação realizada');
      console.log('💡 Para sincronizar, execute este script na página do admin onde o Supabase está carregado');
    }
    
    console.log('\n✅ === PROCESSO CONCLUÍDO ===');
    console.log('💡 Verifique agora em outro dispositivo se as provas PSI aparecem');
    
  } catch (error) {
    console.error('❌ Erro durante execução:', error);
  }
})();

console.log('📝 Script carregado! A sincronização iniciará automaticamente...');