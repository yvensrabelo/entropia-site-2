#!/bin/bash

# Script para iniciar o servidor Next.js em background

# Verifica se o servidor já está rodando
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ Servidor já está rodando em localhost:3000"
    exit 0
fi

# Inicia o servidor em background
echo "🚀 Iniciando servidor em localhost:3000..."
nohup npm run dev > server.log 2>&1 &

# Salva o PID
echo $! > server.pid

echo "✅ Servidor iniciado em background (PID: $!)"
echo "📝 Logs disponíveis em: server.log"
echo ""
echo "Para parar o servidor, execute: npm run stop"