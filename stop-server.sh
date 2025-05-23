#!/bin/bash

# Script para parar o servidor Next.js

if [ -f server.pid ]; then
    PID=$(cat server.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ Servidor parado (PID: $PID)"
        rm server.pid
    else
        echo "⚠️  Servidor não está rodando"
        rm server.pid
    fi
else
    # Tenta encontrar o processo pelo porto
    PID=$(lsof -ti :3000)
    if [ ! -z "$PID" ]; then
        kill $PID
        echo "✅ Servidor parado (PID: $PID)"
    else
        echo "⚠️  Nenhum servidor encontrado em localhost:3000"
    fi
fi