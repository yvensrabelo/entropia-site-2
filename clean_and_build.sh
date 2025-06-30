#!/bin/bash
cd "/Users/yvensrabelo/SITE ENTROPIA/VERSAO 0/entropia-site-2"

echo "🧹 Limpando cache do Next.js..."
rm -rf .next
rm -rf node_modules/.cache

echo "🔨 Executando build..."
npm run build