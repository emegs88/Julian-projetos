#!/bin/bash

echo "🛑 Parando processos do Next.js..."
pkill -f "next dev" 2>/dev/null
sleep 2

echo "🔓 Liberando porta 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 2

echo "🧹 Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "🚀 Iniciando servidor..."
npm run dev
