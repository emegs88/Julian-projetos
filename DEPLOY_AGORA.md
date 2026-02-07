# 🚀 Deploy Agora - Passo a Passo

## ⚡ Opção 1: Script Automático (Recomendado)

Execute no terminal:

```bash
bash deploy.sh
```

O script irá:
1. ✅ Instalar dependências
2. ✅ Gerar Prisma Client
3. ✅ Testar build local
4. ✅ Instalar Vercel CLI (se necessário)
5. ✅ Fazer deploy para produção

## 📋 Opção 2: Manual

### Passo 1: Instalar Dependências
```bash
npm install
```

### Passo 2: Gerar Prisma Client
```bash
npx prisma generate
```

### Passo 3: Testar Build
```bash
npm run build
```

### Passo 4: Instalar Vercel CLI (se necessário)
```bash
npm install -g vercel
```

### Passo 5: Fazer Login no Vercel
```bash
vercel login
```

### Passo 6: Deploy
```bash
vercel --prod
```

## 🌐 Opção 3: Via GitHub (Mais Fácil)

1. **Fazer commit:**
```bash
git add .
git commit -m "Deploy: Sistema completo"
git push origin main
```

2. **No Vercel:**
   - Acesse: https://vercel.com/new
   - Conecte seu repositório GitHub
   - Configure:
     - **Build Command:** `prisma generate && next build`
     - **Install Command:** `npm install`
   - Clique em **Deploy**

## ⚙️ Configurações Pós-Deploy

### 1. Variáveis de Ambiente (Opcional)
No Vercel Dashboard > Settings > Environment Variables:
- `CRON_SECRET`: Secret para proteger CRON job

### 2. Banco de Dados
**⚠️ SQLite não funciona em produção no Vercel!**

Use Postgres:
1. Vercel Dashboard > Storage > Create Postgres
2. Copie `DATABASE_URL`
3. Atualize `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
4. Execute: `npx prisma migrate deploy`

## ✅ Verificação

Após o deploy, teste:
- [ ] Página inicial carrega
- [ ] Aba Empreendimento (valores R$ 67.731,22)
- [ ] Aba Veículos (busca FIPE)
- [ ] Cálculos funcionam
- [ ] PDF gera corretamente

## 🆘 Problemas?

**Erro: "Prisma Client not generated"**
```bash
npx prisma generate
```

**Erro: "Build failed"**
- Verifique os logs no Vercel
- Teste build local: `npm run build`

**Erro: "Database not found"**
- Configure `DATABASE_URL` no Vercel
- Use Postgres, não SQLite

## 📞 Ajuda

Veja `README_DEPLOY.md` para mais detalhes.
