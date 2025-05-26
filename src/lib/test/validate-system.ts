/**
 * Script de validação do sistema de provas hierárquico
 */

import { supabase } from '@/lib/supabase-client';
import { SUBCATEGORIAS, AREAS_MACRO, isValidSubcategoria, isValidArea } from '@/lib/types/prova';

export interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

export class ProvaSystemValidator {
  
  async validateDatabase(): Promise<TestResult> {
    try {
      // Verificar se as colunas existem
      const { data, error } = await supabase
        .from('provas')
        .select('subcategoria, area')
        .limit(1);

      if (error) {
        return {
          success: false,
          message: 'Erro ao verificar estrutura do banco',
          details: error
        };
      }

      return {
        success: true,
        message: 'Estrutura do banco verificada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro na validação do banco de dados',
        details: error
      };
    }
  }

  async testCreateProva(): Promise<TestResult> {
    try {
      // Dados de teste para cada tipo
      const testCases = [
        {
          instituicao: 'UFAM',
          tipo_prova: 'PSC',
          subcategoria: 'PSC 1',
          ano: 2024,
          titulo: 'PSC 1 2024 - Teste',
          url_pdf: 'https://example.com/test.pdf',
          visualizacoes: 0
        },
        {
          instituicao: 'UEA',
          tipo_prova: 'SIS',
          subcategoria: 'SIS 2',
          ano: 2024,
          titulo: 'SIS 2 2024 - Teste',
          url_pdf: 'https://example.com/test2.pdf',
          visualizacoes: 0
        },
        {
          instituicao: 'UEA',
          tipo_prova: 'MACRO',
          subcategoria: 'DIA 2',
          area: 'HUMANAS',
          ano: 2024,
          titulo: 'MACRO DIA 2 HUMANAS 2024 - Teste',
          url_pdf: 'https://example.com/test3.pdf',
          visualizacoes: 0
        }
      ];

      const results = [];

      for (const testData of testCases) {
        const { data, error } = await supabase
          .from('provas')
          .insert(testData)
          .select();

        if (error) {
          results.push({
            testCase: testData.titulo,
            success: false,
            error: error.message
          });
        } else {
          results.push({
            testCase: testData.titulo,
            success: true,
            id: data[0]?.id
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount === testCases.length,
        message: `${successCount}/${testCases.length} testes de criação passaram`,
        details: results
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro nos testes de criação',
        details: error
      };
    }
  }

  async testFilters(): Promise<TestResult> {
    try {
      // Testar filtros hierárquicos
      const filterTests = [
        { tipo_prova: 'PSC' },
        { tipo_prova: 'PSC', subcategoria: 'PSC 1' },
        { tipo_prova: 'MACRO', subcategoria: 'DIA 2' },
        { tipo_prova: 'MACRO', subcategoria: 'DIA 2', area: 'HUMANAS' }
      ];

      const results = [];

      for (const filter of filterTests) {
        let query = supabase.from('provas').select('*');
        
        if (filter.tipo_prova) {
          query = query.eq('tipo_prova', filter.tipo_prova);
        }
        if (filter.subcategoria) {
          query = query.eq('subcategoria', filter.subcategoria);
        }
        if (filter.area) {
          query = query.eq('area', filter.area);
        }

        const { data, error } = await query;

        results.push({
          filter,
          success: !error,
          count: data?.length || 0,
          error: error?.message
        });
      }

      return {
        success: results.every(r => r.success),
        message: 'Testes de filtros concluídos',
        details: results
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro nos testes de filtros',
        details: error
      };
    }
  }

  validateConstants(): TestResult {
    try {
      // Verificar se as constantes estão corretas
      const expectedSubcategorias = {
        PSC: ['PSC 1', 'PSC 2', 'PSC 3'],
        SIS: ['SIS 1', 'SIS 2', 'SIS 3'],
        MACRO: ['DIA 1', 'DIA 2']
      };

      const expectedAreas = ['BIOLÓGICAS', 'HUMANAS', 'EXATAS'];

      // Verificar SUBCATEGORIAS
      for (const [tipo, subs] of Object.entries(expectedSubcategorias)) {
        if (!SUBCATEGORIAS[tipo] || 
            SUBCATEGORIAS[tipo].length !== subs.length ||
            !subs.every(sub => SUBCATEGORIAS[tipo].includes(sub))) {
          return {
            success: false,
            message: `Subcategorias para ${tipo} estão incorretas`,
            details: { expected: subs, actual: SUBCATEGORIAS[tipo] }
          };
        }
      }

      // Verificar AREAS_MACRO
      if (AREAS_MACRO.length !== expectedAreas.length ||
          !expectedAreas.every(area => AREAS_MACRO.includes(area))) {
        return {
          success: false,
          message: 'Áreas MACRO estão incorretas',
          details: { expected: expectedAreas, actual: AREAS_MACRO }
        };
      }

      // Testar funções de validação
      const validationTests = [
        { fn: () => isValidSubcategoria('PSC', 'PSC 1'), expected: true },
        { fn: () => isValidSubcategoria('PSC', 'PSC 4'), expected: false },
        { fn: () => isValidArea('MACRO', 'DIA 2', 'HUMANAS'), expected: true },
        { fn: () => isValidArea('MACRO', 'DIA 1', 'HUMANAS'), expected: false },
        { fn: () => isValidArea('PSC', 'PSC 1', 'HUMANAS'), expected: false }
      ];

      for (const test of validationTests) {
        if (test.fn() !== test.expected) {
          return {
            success: false,
            message: 'Função de validação falhou',
            details: test
          };
        }
      }

      return {
        success: true,
        message: 'Todas as constantes e validações estão corretas'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro na validação das constantes',
        details: error
      };
    }
  }

  async cleanup(): Promise<TestResult> {
    try {
      // Limpar dados de teste
      const { error } = await supabase
        .from('provas')
        .delete()
        .like('titulo', '% - Teste');

      return {
        success: !error,
        message: error ? 'Erro na limpeza' : 'Limpeza concluída',
        details: error
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro na limpeza dos dados de teste',
        details: error
      };
    }
  }

  async runFullValidation(): Promise<TestResult[]> {
    console.log('🚀 Iniciando validação completa do sistema...');

    const results = [];

    // 1. Validar constantes
    console.log('📋 Validando constantes...');
    results.push(await this.validateConstants());

    // 2. Validar banco de dados
    console.log('🗄️ Validando banco de dados...');
    results.push(await this.validateDatabase());

    // 3. Testar criação de provas
    console.log('✏️ Testando criação de provas...');
    results.push(await this.testCreateProva());

    // 4. Testar filtros
    console.log('🔍 Testando filtros...');
    results.push(await this.testFilters());

    // 5. Limpeza
    console.log('🧹 Limpando dados de teste...');
    results.push(await this.cleanup());

    console.log('✅ Validação completa finalizada!');
    return results;
  }
}

// Função utilitária para rodar validação
export async function validateProvaSystem(): Promise<void> {
  const validator = new ProvaSystemValidator();
  const results = await validator.runFullValidation();
  
  console.log('\n📊 Resumo da Validação:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.message}`);
    if (!result.success && result.details) {
      console.log('   Detalhes:', result.details);
    }
  });
  
  const allPassed = results.every(r => r.success);
  console.log(`\n${allPassed ? '🎉' : '⚠️'} ${allPassed ? 'Todos os testes passaram!' : 'Alguns testes falharam.'}`);
}