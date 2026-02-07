#!/bin/bash

# Script de Deploy - Portal Captação Prospere
# Execute: bash deploy.sh

echo "🚀 Iniciando deploy do Portal Captação Prospere..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

# 1. Instalar dependências
echo -e "${YELLOW}📦 Passo 1/5: Instalando dependências...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# 2. Gerar Prisma Client
echo -e "${YELLOW}🔧 Passo 2/5: Gerando Prisma Client...${NC}"
npx prisma generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao gerar Prisma Client${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Prisma Client gerado${NC}"
echo ""

# 3. Verificar build local
echo -e "${YELLOW}🏗️  Passo 3/5: Testando build local...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build. Corrija os erros antes de fazer deploy${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build local bem-sucedido${NC}"
echo ""

# 4. Verificar se Vercel CLI está instalado
echo -e "${YELLOW}🔍 Passo 4/5: Verificando Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI não encontrado. Instalando...${NC}"
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro ao instalar Vercel CLI${NC}"
        echo -e "${YELLOW}💡 Tente: npm install -g vercel${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Vercel CLI encontrado${NC}"
echo ""

# 5. Deploy
echo -e "${YELLOW}🚀 Passo 5/5: Fazendo deploy para produção...${NC}"
echo -e "${YELLOW}💡 Você precisará fazer login no Vercel se ainda não estiver logado${NC}"
echo ""
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Configure as variáveis de ambiente no Vercel Dashboard"
    echo "2. Configure o banco de dados (Postgres recomendado)"
    echo "3. Execute: npx prisma migrate deploy"
    echo ""
else
    echo -e "${RED}❌ Erro no deploy${NC}"
    exit 1
fi
