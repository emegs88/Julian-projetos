# 🚀 Guia de Deploy - Vercel

## Pré-requisitos

1. Conta no Vercel (https://vercel.com)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Node.js 18+ instalado localmente

## Passos para Deploy

### 1. Instalar Dependências Localmente

```bash
npm install
```

### 2. Configurar Banco de Dados (Prisma)

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar migração inicial
npx prisma migrate dev --name init

# (Opcional) Popular dados iniciais
npx prisma db seed
```

### 3. Configurar Variáveis de Ambiente

No Vercel Dashboard, adicione as seguintes variáveis de ambiente:

```
# Para CRON Job (opcional)
CRON_SECRET=seu-secret-aqui

# Database URL (se usar Postgres no Vercel)
DATABASE_URL=postgresql://...
```

**Nota:** O SQLite funciona localmente, mas para produção no Vercel, recomenda-se usar Postgres (Vercel Postgres ou externo).

### 4. Deploy via Vercel CLI

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 5. Deploy via GitHub (Recomendado)

1. Faça push do código para o GitHub
2. Acesse https://vercel.com/new
3. Importe o repositório
4. Configure:
   - **Framework Preset:** Next.js
   - **Build Command:** `prisma generate && next build`
   - **Install Command:** `npm install`
   - **Output Directory:** `.next`
5. Adicione as variáveis de ambiente
6. Clique em "Deploy"

### 6. Configurar CRON Job (Opcional)

O CRON job está configurado no `vercel.json` para rodar mensalmente.

Para ativar:
1. Vá em Settings > Cron Jobs no Vercel
2. Adicione a variável `CRON_SECRET` nas Environment Variables
3. O job rodará automaticamente no dia 1 de cada mês às 00:00

## Configuração de Banco de Dados em Produção

### Opção 1: Vercel Postgres (Recomendado)

1. No Vercel Dashboard, vá em Storage
2. Crie um novo Postgres Database
3. Copie a `DATABASE_URL` fornecida
4. Atualize o `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

5. Execute migrações:

```bash
npx prisma migrate deploy
```

### Opção 2: SQLite (Apenas para testes)

SQLite não é recomendado para produção no Vercel, mas pode funcionar com adaptações.

## Verificações Pós-Deploy

1. ✅ Acesse a URL do deploy
2. ✅ Verifique se a página inicial carrega
3. ✅ Teste a aba "Empreendimento"
4. ✅ Teste a aba "Veículos" e busca FIPE
5. ✅ Verifique se os cálculos funcionam
6. ✅ Teste geração de PDF

## Troubleshooting

### Erro: "Prisma Client not generated"
```bash
# Execute localmente antes do deploy
npx prisma generate
```

### Erro: "Database not found"
- Verifique se `DATABASE_URL` está configurada
- Execute `npx prisma migrate deploy` no Vercel

### Erro: "Module not found"
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` novamente

## Comandos Úteis

```bash
# Ver logs do deploy
vercel logs

# Verificar build local
npm run build

# Testar localmente
npm run dev

# Verificar Prisma
npx prisma studio
```

## Notas Importantes

- ⚠️ SQLite não funciona bem em produção serverless (Vercel)
- ✅ Use Postgres para produção
- ✅ Configure `CRON_SECRET` para segurança do CRON job
- ✅ Faça backup do banco de dados regularmente
