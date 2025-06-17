/**
 * Script para sincronizar provas PSI do localStorage para Supabase
 * 
 * PROBLEMA: Provas PSI podem estar apenas no localStorage e não aparecem
 * em outros dispositivos por não estarem sincronizadas com o Supabase.
 * 
 * SOLUÇÃO: Verificar localStorage, encontrar provas PSI e sincronizar
 * com o banco de dados do Supabase.
 */

import { supabase } from '@/lib/supabase-singleton';

interface ProvaLocalStorage {
  nome?: string;
  titulo?: string;
  tipo_prova?: string;
  instituicao?: string;
  ano?: number;
  subcategoria?: string;
  area?: string;
  arquivo_url?: string;
  arquivo_nome?: string;
  url?: string;
  tipo?: string;
  [key: string]: any;
}

export async function investigarProvasLocalStorage(): Promise<void> {
  console.log('🔍 === INVESTIGANDO PROVAS NO LOCALSTORAGE ===');
  
  if (typeof window === 'undefined') {
    console.log('❌ Função deve ser executada no navegador');
    return;
  }

  try {
    // Buscar TODAS as chaves do localStorage
    const todasAsChaves = Object.keys(localStorage);
    console.log(`📊 Total de chaves no localStorage: ${todasAsChaves.length}`);
    
    // Filtrar chaves que podem conter provas
    const chavesRelevantes = todasAsChaves.filter(key => 
      key.toLowerCase().includes('prova') ||
      key.toLowerCase().includes('psi') ||
      key.toLowerCase().includes('upload') ||
      key.toLowerCase().includes('arquivo') ||
      key.toLowerCase().includes('massa')
    );
    
    console.log('🔑 Chaves relevantes encontradas:', chavesRelevantes);
    
    // Analisar cada chave
    const provasEncontradas: ProvaLocalStorage[] = [];
    
    for (const chave of chavesRelevantes) {
      const dados = localStorage.getItem(chave);
      if (dados) {
        try {
          const parsed = JSON.parse(dados);
          console.log(`\n📂 Conteúdo da chave '${chave}':`);
          console.log(parsed);
          
          // Se for array, verificar cada item
          if (Array.isArray(parsed)) {
            const provasPSI = parsed.filter((item: any) => 
              item.tipo_prova === 'PSI' || 
              (item.titulo && item.titulo.includes('PSI')) ||
              (item.nome && item.nome.includes('PSI')) ||
              (item.arquivo_nome && item.arquivo_nome.includes('PSI'))
            );
            
            if (provasPSI.length > 0) {
              console.log(`✅ Encontradas ${provasPSI.length} provas PSI na chave '${chave}':`);
              console.log(provasPSI);
              provasEncontradas.push(...provasPSI);
            }
          }
          // Se for objeto único
          else if (parsed && typeof parsed === 'object') {
            if (parsed.tipo_prova === 'PSI' || 
                (parsed.titulo && parsed.titulo.includes('PSI')) ||
                (parsed.nome && parsed.nome.includes('PSI'))) {
              console.log(`✅ Encontrada prova PSI na chave '${chave}':`);
              console.log(parsed);
              provasEncontradas.push(parsed);
            }
          }
        } catch (e) {
          console.log(`⚠️ Chave '${chave}' não contém JSON válido`);
        }
      }
    }
    
    console.log(`\n🎯 RESUMO: ${provasEncontradas.length} provas PSI encontradas no localStorage`);
    
    if (provasEncontradas.length > 0) {
      console.log('\n📋 Provas PSI encontradas:');
      provasEncontradas.forEach((prova, index) => {
        console.log(`${index + 1}. ${prova.titulo || prova.nome || 'Sem título'} - ${prova.ano || 'Ano não definido'}`);
      });
    }
    
    return;
    
  } catch (error) {
    console.error('❌ Erro na investigação:', error);
  }
}

export async function sincronizarProvasPSI(): Promise<void> {
  console.log('🔄 === SINCRONIZANDO PROVAS PSI COM SUPABASE ===');
  
  if (typeof window === 'undefined') {
    console.log('❌ Função deve ser executada no navegador');
    return;
  }

  try {
    // Primeiro, investigar quais provas PSI temos no localStorage
    const todasAsChaves = Object.keys(localStorage);
    const chavesRelevantes = todasAsChaves.filter(key => 
      key.toLowerCase().includes('prova') ||
      key.toLowerCase().includes('psi') ||
      key.toLowerCase().includes('upload')
    );
    
    const provasEncontradas: ProvaLocalStorage[] = [];
    
    for (const chave of chavesRelevantes) {
      const dados = localStorage.getItem(chave);
      if (dados) {
        try {
          const parsed = JSON.parse(dados);
          
          if (Array.isArray(parsed)) {
            const provasPSI = parsed.filter((item: any) => 
              item.tipo_prova === 'PSI' || 
              (item.titulo && item.titulo.includes('PSI')) ||
              (item.nome && item.nome.includes('PSI'))
            );
            provasEncontradas.push(...provasPSI);
          } else if (parsed && typeof parsed === 'object' && 
                    (parsed.tipo_prova === 'PSI' || 
                     (parsed.titulo && parsed.titulo.includes('PSI')))) {
            provasEncontradas.push(parsed);
          }
        } catch (e) {
          // Ignorar chaves que não são JSON válido
        }
      }
    }
    
    if (provasEncontradas.length === 0) {
      console.log('ℹ️ Nenhuma prova PSI encontrada no localStorage');
      return;
    }
    
    console.log(`📊 ${provasEncontradas.length} provas PSI encontradas no localStorage`);
    
    // Verificar quais PSI já existem no Supabase
    const { data: existentes, error: errorExistentes } = await supabase
      .from('provas')
      .select('titulo, ano, subtitulo')
      .eq('tipo_prova', 'PSI');
    
    if (errorExistentes) {
      console.error('❌ Erro ao buscar provas existentes:', errorExistentes);
      return;
    }
    
    console.log(`📊 ${existentes?.length || 0} provas PSI já existem no Supabase`);
    
    // Criar um Set com identificadores únicos das provas existentes
    const identificadoresExistentes = new Set(
      existentes?.map(p => `${p.titulo}-${p.ano}-${p.subtitulo || ''}`.toLowerCase()) || []
    );
    
    // Filtrar apenas provas novas
    const provasNovas = provasEncontradas.filter(prova => {
      const identificador = `${prova.titulo || prova.nome || ''}-${prova.ano || ''}-${prova.subcategoria || ''}`.toLowerCase();
      return !identificadoresExistentes.has(identificador);
    });
    
    console.log(`🆕 ${provasNovas.length} provas PSI novas para sincronizar`);
    
    if (provasNovas.length === 0) {
      console.log('✅ Todas as provas PSI já estão sincronizadas com o Supabase');
      return;
    }
    
    // Preparar dados para inserção
    const dadosParaInserir = provasNovas.map(prova => ({
      grupo_id: `psi-${prova.ano || new Date().getFullYear()}`,
      instituicao: prova.instituicao || '', // PSI não tem instituição específica
      tipo_prova: 'PSI',
      ano: prova.ano || new Date().getFullYear(),
      titulo: prova.titulo || prova.nome || `PSI ${prova.ano || new Date().getFullYear()}`,
      subtitulo: prova.subcategoria || '',
      ordem: 1,
      url_prova: prova.arquivo_url || prova.url || '',
      url_gabarito: '', // Por enquanto vazio
      ativo: true,
      visualizacoes: 0
    }));
    
    console.log('📤 Dados preparados para inserção:');
    console.log(dadosParaInserir);
    
    // Inserir no Supabase
    const { data: inseridas, error: errorInsercao } = await supabase
      .from('provas')
      .insert(dadosParaInserir)
      .select();
    
    if (errorInsercao) {
      console.error('❌ Erro ao inserir provas:', errorInsercao);
      
      // Tentar salvar individualmente em caso de erro em lote
      console.log('🔄 Tentando inserir provas individualmente...');
      let sucessos = 0;
      let erros = 0;
      
      for (const dados of dadosParaInserir) {
        try {
          const { error: errorIndividual } = await supabase
            .from('provas')
            .insert(dados);
            
          if (errorIndividual) {
            console.error(`❌ Erro ao inserir "${dados.titulo}":`, errorIndividual);
            erros++;
          } else {
            console.log(`✅ "${dados.titulo}" inserida com sucesso`);
            sucessos++;
          }
        } catch (e) {
          console.error(`❌ Erro inesperado ao inserir "${dados.titulo}":`, e);
          erros++;
        }
      }
      
      console.log(`\n📊 RESULTADO INDIVIDUAL: ${sucessos} sucessos, ${erros} erros`);
      
    } else {
      console.log('✅ Todas as provas PSI foram sincronizadas com sucesso!');
      console.log(`📊 ${inseridas?.length || 0} provas inseridas no Supabase`);
      
      // Opcional: limpar localStorage após sincronização bem-sucedida
      // (descomente se quiser limpar automaticamente)
      /*
      console.log('🧹 Limpando localStorage...');
      chavesRelevantes.forEach(chave => {
        localStorage.removeItem(chave);
        console.log(`🗑️ Removida chave: ${chave}`);
      });
      */
    }
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}

// Função para executar no console do navegador
export function executarSincronizacaoPSI() {
  console.log('🚀 === INICIANDO SINCRONIZAÇÃO DE PROVAS PSI ===');
  console.log('📝 Passo 1: Investigando localStorage...');
  
  investigarProvasLocalStorage().then(() => {
    console.log('\n📝 Passo 2: Iniciando sincronização...');
    return sincronizarProvasPSI();
  }).then(() => {
    console.log('\n✅ === SINCRONIZAÇÃO CONCLUÍDA ===');
    console.log('💡 Verifique agora se as provas PSI aparecem em outros dispositivos');
  }).catch(error => {
    console.error('❌ Erro durante a execução:', error);
  });
}

// Para usar no console: executarSincronizacaoPSI()