#!/bin/bash
cd "/Users/yvensrabelo/SITE ENTROPIA/VERSAO 0/entropia-site-2"

echo "📋 Adicionando arquivos modificados..."
git add src/services/descritoresService.ts
git add src/app/api/professores/minutos/route.ts
git add teste-descritores.js
git add funcao-minutos-do-mes-otimizada.sql

echo "💾 Fazendo commit..."
git commit -m "fix: corrige salvamento de descritores para usar tabela correta

- Modifica descritoresService para salvar na tabela 'descritores' 
- Implementa upsert lógico com verificação de duplicatas
- Calcula campo minutos_aula (50min por tempo)
- Melhora API /professores/minutos com logs e mais dados
- Adiciona arquivo de teste para CPF '98660608291'
- Cria função SQL otimizada minutos_do_mes
- Resolve problema: função lia tabela errada (minutos_professores vs descritores)

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "🚀 Fazendo push..."
git push

echo "✅ Commit finalizado!"