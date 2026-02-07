# 🚀 Deploy Rápido - Portal Captação Prospere

## ⚡ Deploy Imediato (Vercel)

### Opção 1: Via Vercel CLI (Mais Rápido)

```bash
# 1. Instalar dependências
npm install

# 2. Gerar Prisma Client
npx prisma generate

# 3. Instalar Vercel CLI (se não tiver)
npm i -g vercel

# 4. Fazer login
vercel login

# 5. Deploy
vercel --prod
```

### Opção 2: Via GitHub (Recomendado para Produção)

1. **Fazer commit e push:**
```bash
git add .
git commit -m "Deploy: Sistema completo com FIPE API"
git push origin main
```

2. **No Vercel Dashboard:**
   - Acesse https://vercel.com/new
   - Conecte seu repositório GitHub
   - Configure:
     - **Framework:** Next.js
     - **Build Command:** `prisma generate && next build`
     - **Install Command:** `npm install`
   - Adicione variáveis de ambiente (se necessário):
     - `CRON_SECRET` (opcional, para CRON job)
   - Clique em **Deploy**

## 📋 Checklist Pré-Deploy

- [x] Valores dos lotes corrigidos (R$ 67.731,22)
- [x] Schema Prisma configurado
- [x] API routes criadas
- [x] CRON job configurado
- [x] vercel.json configurado
- [x] .gitignore atualizado

## ⚠️ Importante: Banco de Dados

**SQLite não funciona bem em produção no Vercel!**

### Para Produção, use Postgres:

1. **No Vercel Dashboard:**
   - Vá em **Storage** > **Create Database** > **Postgres**
   - Copie a `DATABASE_URL`

2. **Atualize `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. **Execute migrações:**
```bash
npx prisma migrate deploy
```

## 🔧 Variáveis de Ambiente (Opcional)

No Vercel Dashboard > Settings > Environment Variables:

- `CRON_SECRET`: Secret para proteger o CRON job (opcional)

## ✅ Testes Pós-Deploy

1. Acesse a URL do deploy
2. Verifique se a página carrega
3. Teste a aba "Empreendimento" (valores dos lotes)
4. Teste a aba "Veículos" (busca FIPE)
5. Teste cálculos e geração de PDF

## 🐛 Troubleshooting

**Erro: "Prisma Client not generated"**
```bash
npx prisma generate
```

**Erro: "Database not found"**
- Configure `DATABASE_URL` no Vercel
- Execute `npx prisma migrate deploy`

**Erro no build:**
```bash
npm run build
# Verifique os erros e corrija
```

## 📞 Suporte

Para mais detalhes, veja `DEPLOY_VERCEL.md`
