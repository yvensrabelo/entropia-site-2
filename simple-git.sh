#!/usr/bin/env bash
set -e

echo "=== Executing Git Operations ==="

# Remove test file if it exists
if [ -f "test-cpf-validation.js" ]; then
    rm -f test-cpf-validation.js
    echo "✓ Removed test-cpf-validation.js"
else
    echo "• test-cpf-validation.js not found (already removed)"
fi

# Check if the target file exists
if [ -f "src/app/matricula/novo-formulario/page.tsx" ]; then
    echo "✓ Target file exists: src/app/matricula/novo-formulario/page.tsx"
else
    echo "✗ Target file not found: src/app/matricula/novo-formulario/page.tsx"
    exit 1
fi

# Add the specific file
echo "Adding file to git staging..."
git add src/app/matricula/novo-formulario/page.tsx

# Check git status
echo "Current git status:"
git status --porcelain

# Create commit
echo "Creating commit..."
git commit -m "fix: corrige validação de formulário de matrícula

- Ajusta validação de campos obrigatórios
- Melhora tratamento de erros no formulário
- Remove arquivo de teste temporário

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
echo "Pushing to remote repository..."
git push origin main

echo "=== Git operations completed successfully ==="