#!/bin/bash

# Navigate to the project directory
cd "/Users/yvensrabelo/SITE ENTROPIA/VERSAO 0/entropia-site-2"

echo "=== Git Status ==="
git status

echo -e "\n=== Staging all changes ==="
git add -A

echo -e "\n=== Creating commit ==="
git commit -m "$(cat <<'EOF'
fix: correção completa da API de minutos do professor

- Removida pasta conflitante /api/professor/minutos
- Atualizado endpoint para usar função RPC minutos_do_mes
- Criada documentação da função SQL otimizada
- Corrigido problema de roteamento da API

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

echo -e "\n=== Pushing to remote ==="
git push

echo -e "\n=== Final status ==="
git status