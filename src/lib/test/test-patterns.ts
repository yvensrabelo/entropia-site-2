/**
 * Testes para validar os padrões de detecção de arquivos
 */

import { extractMetadataFromFilename } from '@/lib/utils/prova-utils';

// Casos de teste baseados nos padrões solicitados
const testCases = [
  {
    filename: "PSC-2013-Etapa-I-Prova.pdf",
    expected: {
      tipo_prova: "PSC",
      subcategoria: "PSC 1",
      ano: 2013,
      etapa: "1ª Etapa"
    }
  },
  {
    filename: "PSC-2014-Etapa-II-Gabarito.pdf",
    expected: {
      tipo_prova: "PSC",
      subcategoria: "PSC 2",
      ano: 2014,
      etapa: "2ª Etapa"
    }
  },
  {
    filename: "PSC-2015-Etapa-III-Prova.pdf",
    expected: {
      tipo_prova: "PSC",
      subcategoria: "PSC 3",
      ano: 2015,
      etapa: "3ª Etapa"
    }
  },
  {
    filename: "SIS-2020-Etapa-1-Prova.pdf",
    expected: {
      tipo_prova: "SIS",
      subcategoria: "SIS 1",
      ano: 2020,
      etapa: "1ª Etapa"
    }
  },
  {
    filename: "SIS-2021-Etapa-2-Gabarito.pdf",
    expected: {
      tipo_prova: "SIS",
      subcategoria: "SIS 2",
      ano: 2021,
      etapa: "2ª Etapa"
    }
  },
  {
    filename: "MACRO-2023-DIA-1-Prova.pdf",
    expected: {
      tipo_prova: "MACRO",
      subcategoria: "DIA 1",
      ano: 2023
    }
  },
  {
    filename: "MACRO-2023-DIA-2-HUMANAS.pdf",
    expected: {
      tipo_prova: "MACRO",
      subcategoria: "DIA 2",
      area: "HUMANAS",
      ano: 2023
    }
  },
  {
    filename: "MACRO-2024-DIA-2-BIOLOGICAS-Prova.pdf",
    expected: {
      tipo_prova: "MACRO",
      subcategoria: "DIA 2",
      area: "BIOLÓGICAS",
      ano: 2024
    }
  },
  {
    filename: "MACRO-2024-DIA-2-EXATAS-Gabarito.pdf",
    expected: {
      tipo_prova: "MACRO",
      subcategoria: "DIA 2",
      area: "EXATAS",
      ano: 2024
    }
  }
];

export function testPatternDetection(): void {
  console.log('🧪 Testando padrões de detecção de arquivos...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    console.log(`📄 Teste ${index + 1}: ${testCase.filename}`);
    
    const result = extractMetadataFromFilename(testCase.filename);
    let testPassed = true;
    const issues = [];
    
    // Verificar cada campo esperado
    for (const [key, expectedValue] of Object.entries(testCase.expected)) {
      const actualValue = result[key as keyof typeof result];
      if (actualValue !== expectedValue) {
        testPassed = false;
        issues.push(`  ❌ ${key}: esperado "${expectedValue}", obtido "${actualValue}"`);
      } else {
        console.log(`  ✅ ${key}: ${actualValue}`);
      }
    }
    
    if (testPassed) {
      console.log(`  🎉 PASSOU\n`);
      passedTests++;
    } else {
      console.log(`  💥 FALHOU:`);
      issues.forEach(issue => console.log(issue));
      console.log('');
    }
  });
  
  console.log(`📊 Resumo: ${passedTests}/${totalTests} testes passaram`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Todos os testes de padrão passaram!');
  } else {
    console.log('⚠️ Alguns testes falharam. Verificar os padrões regex.');
  }
}

// Função para testar um arquivo específico
export function testSingleFile(filename: string): void {
  console.log(`🔍 Testando arquivo: ${filename}`);
  const result = extractMetadataFromFilename(filename);
  console.log('Resultado:', JSON.stringify(result, null, 2));
}

// Executar testes se chamado diretamente
if (typeof window === 'undefined') {
  testPatternDetection();
}