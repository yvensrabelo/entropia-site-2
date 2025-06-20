#!/bin/bash

# Script para executar comandos git
echo "Executando comandos git..."

# Remover arquivo de teste
if [ -f "test-cpf-validation.js" ]; then
    rm test-cpf-validation.js
    echo "Arquivo test-cpf-validation.js removido"
fi

# Adicionar arquivo modificado
git add src/app/matricula/novo-formulario/page.tsx
echo "Arquivo adicionado ao staging"

# Commit com mensagem
git commit -m "fix: corrige validação de formulário de matrícula

- Ajusta validação de campos obrigatórios
- Melhora tratamento de erros no formulário
- Remove arquivo de teste temporário

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "Commit realizado"

# Push para o repositório
git push origin main
echo "Push realizado para o repositório remoto"

echo "Operações git concluídas com sucesso!"