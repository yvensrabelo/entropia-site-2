const XLSX = require('xlsx');
const fs = require('fs');

// Função para analisar o arquivo Excel
function analyzeExcelFile(filePath) {
    try {
        // Ler o arquivo Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Primeira planilha
        const worksheet = workbook.Sheets[sheetName];
        
        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log('=== ANÁLISE DO ARQUIVO EXCEL ===\n');
        
        // Mostrar informações básicas
        console.log(`📊 Total de linhas: ${jsonData.length}`);
        console.log(`📑 Nome da planilha: ${sheetName}\n`);
        
        // Mostrar cabeçalhos (primeira linha)
        console.log('📋 COLUNAS ENCONTRADAS:');
        const headers = jsonData[0] || [];
        headers.forEach((header, index) => {
            console.log(`  ${index + 1}. "${header}"`);
        });
        console.log('');
        
        // Mostrar primeiras 5 linhas de dados
        console.log('📄 PRIMEIRAS 5 LINHAS DE DADOS:');
        for (let i = 1; i <= Math.min(6, jsonData.length - 1); i++) {
            const row = jsonData[i] || [];
            console.log(`\n--- LINHA ${i} ---`);
            headers.forEach((header, colIndex) => {
                const value = row[colIndex];
                const type = typeof value;
                const isEmpty = value === undefined || value === null || value === '';
                console.log(`  ${header}: "${value}" (${type}${isEmpty ? ' - VAZIO' : ''})`);
            });
        }
        
        // Análise de qualidade dos dados
        console.log('\n🔍 ANÁLISE DE QUALIDADE DOS DADOS:');
        
        const dataRows = jsonData.slice(1); // Remove cabeçalho
        const stats = {};
        
        headers.forEach((header, colIndex) => {
            const values = dataRows.map(row => row[colIndex]);
            const nonEmptyValues = values.filter(v => v !== undefined && v !== null && v !== '');
            
            stats[header] = {
                total: values.length,
                filled: nonEmptyValues.length,
                empty: values.length - nonEmptyValues.length,
                fillRate: ((nonEmptyValues.length / values.length) * 100).toFixed(1),
                sampleValues: nonEmptyValues.slice(0, 3)
            };
        });
        
        Object.entries(stats).forEach(([header, stat]) => {
            console.log(`\n  📊 ${header}:`);
            console.log(`    - Preenchidos: ${stat.filled}/${stat.total} (${stat.fillRate}%)`);
            console.log(`    - Vazios: ${stat.empty}`);
            console.log(`    - Exemplos: ${stat.sampleValues.map(v => `"${v}"`).join(', ')}`);
        });
        
        // Detectar problemas comuns
        console.log('\n⚠️  PROBLEMAS IDENTIFICADOS:');
        
        dataRows.forEach((row, rowIndex) => {
            const lineNumber = rowIndex + 2; // +2 porque começamos do índice 1 e linha 1 é cabeçalho
            const problems = [];
            
            headers.forEach((header, colIndex) => {
                const value = row[colIndex];
                const lowerHeader = header.toLowerCase();
                
                // Verificar nome
                if (lowerHeader.includes('nome') && !lowerHeader.includes('responsavel')) {
                    if (!value || value.toString().trim().length < 3) {
                        problems.push(`Nome inválido: "${value}"`);
                    }
                }
                
                // Verificar CPF
                if (lowerHeader.includes('cpf')) {
                    if (!value) {
                        problems.push('CPF vazio');
                    } else {
                        const cpfClean = value.toString().replace(/\D/g, '');
                        if (cpfClean.length !== 11) {
                            problems.push(`CPF inválido: "${value}" (${cpfClean.length} dígitos)`);
                        }
                    }
                }
                
                // Verificar data
                if (lowerHeader.includes('nascimento') || lowerHeader.includes('data')) {
                    if (!value) {
                        problems.push('Data de nascimento vazia');
                    } else {
                        const dateStr = value.toString();
                        const isValidDate = !isNaN(Date.parse(dateStr)) || 
                                          /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr) ||
                                          /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
                        if (!isValidDate) {
                            problems.push(`Data inválida: "${value}"`);
                        }
                    }
                }
                
                // Verificar telefone
                if (lowerHeader.includes('telefone') || lowerHeader.includes('celular')) {
                    if (!value) {
                        problems.push('Telefone vazio');
                    } else {
                        const phoneClean = value.toString().replace(/\D/g, '');
                        if (phoneClean.length < 10) {
                            problems.push(`Telefone inválido: "${value}"`);
                        }
                    }
                }
                
                // Verificar email
                if (lowerHeader.includes('email') || lowerHeader.includes('e-mail')) {
                    if (!value) {
                        problems.push('Email vazio');
                    } else if (!value.toString().includes('@')) {
                        problems.push(`Email inválido: "${value}"`);
                    }
                }
            });
            
            if (problems.length > 0) {
                console.log(`\n  ❌ Linha ${lineNumber}:`);
                problems.forEach(problem => {
                    console.log(`    - ${problem}`);
                });
            }
        });
        
        // Sugestões de mapeamento
        console.log('\n🎯 SUGESTÕES DE MAPEAMENTO:');
        const fieldMappings = {
            nome: headers.find(h => h.toLowerCase().includes('nome') && !h.toLowerCase().includes('responsavel')),
            cpf: headers.find(h => h.toLowerCase().includes('cpf')),
            data_nascimento: headers.find(h => h.toLowerCase().includes('nascimento') || h.toLowerCase().includes('data')),
            telefone: headers.find(h => h.toLowerCase().includes('telefone') || h.toLowerCase().includes('celular')),
            email: headers.find(h => h.toLowerCase().includes('email') || h.toLowerCase().includes('e-mail')),
            endereco: headers.find(h => h.toLowerCase().includes('endereco') || h.toLowerCase().includes('endereço')),
            bairro: headers.find(h => h.toLowerCase().includes('bairro')),
            cidade: headers.find(h => h.toLowerCase().includes('cidade')),
            cep: headers.find(h => h.toLowerCase().includes('cep')),
            nome_responsavel: headers.find(h => h.toLowerCase().includes('responsavel') || h.toLowerCase().includes('responsável')),
            telefone_responsavel: headers.find(h => h.toLowerCase().includes('telefone') && h.toLowerCase().includes('responsavel')),
            observacoes: headers.find(h => h.toLowerCase().includes('observa') || h.toLowerCase().includes('obs'))
        };
        
        Object.entries(fieldMappings).forEach(([field, column]) => {
            if (column) {
                console.log(`  ✅ ${field}: "${column}"`);
            } else {
                console.log(`  ❌ ${field}: NÃO ENCONTRADO`);
            }
        });
        
        // Converter para CSV para análise manual
        console.log('\n💾 Gerando CSV para análise...');
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        fs.writeFileSync('agorapapai_analysis.csv', csv);
        console.log('   ✅ Arquivo CSV salvo como: agorapapai_analysis.csv');
        
    } catch (error) {
        console.error('❌ Erro ao analisar arquivo:', error.message);
    }
}

// Executar análise
analyzeExcelFile('./agorapapai.xlsx');