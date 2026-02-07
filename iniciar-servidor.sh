#!/bin/bash

echo "🛑 Parando processos anteriores..."
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "node.*next" 2>/dev/null
sleep 2

echo "🔓 Liberando porta 3000..."
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null
sleep 2

echo "🧹 Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "🚀 Iniciando servidor Next.js..."
echo ""
echo "Aguarde a mensagem: ✓ Ready in Xs"
echo "Depois acesse: http://localhost:3000"
echo ""

npm run dev
