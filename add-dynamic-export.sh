#!/bin/bash

# Lista de arquivos que precisam da adição
files=(
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/alunos/[id]/editar/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/alunos/[id]/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/alunos/importar-avancado/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/alunos/importar-flexivel/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/alunos/importar/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/alunos/novo/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/alunos/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/matriculas/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/pre-matriculas/[id]/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/pre-matriculas/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/presencas/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/presencas/registrar/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/provas/[id]/editar/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/provas/nova/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/provas/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/provas/upload-massa/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/provas/upload-multiplo/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/relatorios/aluno/[id]/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/relatorios/aluno/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/relatorios/frequencia/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/relatorios/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/relatorios/risco/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/relatorios/turmas/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/turmas-config/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/turmas/[id]/editar/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/turmas/[id]/preview/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/turmas/nova/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/turmas/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/whatsapp/automacoes/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/whatsapp/configuracao/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/whatsapp/enviar/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/whatsapp/historico/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/whatsapp/page.tsx"
  "/Users/yvensrabelo/TENTAR O QUE JA TEMOS/entropia-site-2/src/app/admin/dashboard/whatsapp/templates/page.tsx"
)

# Para cada arquivo, adicionar a linha após 'use client';
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Criar backup temporário
    cp "$file" "$file.bak"
    
    # Adicionar export const dynamic após 'use client';
    sed -i '' "/'use client';/a\\
\\
export const dynamic = 'force-dynamic'
" "$file"
    
    echo "✅ Modificado: $file"
    
    # Remover backup
    rm "$file.bak"
  else
    echo "❌ Arquivo não encontrado: $file"
  fi
done

echo "✨ Processo concluído!"