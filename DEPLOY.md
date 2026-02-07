# 🚀 Guia de Deploy - Portal Captação

## Opção 1: Deploy via Vercel Dashboard (Recomendado)

### Passo 1: Preparar o Repositório
```bash
# Fazer commit de todas as alterações
git add .
git commit -m "Preparação para deploy - Integração BidCon completa"
git push origin main
```

### Passo 2: Conectar ao Vercel
1. Acesse [https://vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub/GitLab/Bitbucket
3. Clique em "Add New Project"
4. Importe o repositório `Promissao-prospere`

### Passo 3: Configurar o Projeto
- **Framework Preset:** Next.js (detectado automaticamente)
- **Root Directory:** `./` (raiz do projeto)
- **Build Command:** `npm run build` (já configurado)
- **Output Directory:** `.next` (padrão Next.js)

### Passo 4: Configurar Variáveis de Ambiente
No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```
BIDCON_API_URL=https://bidcon.vercel.app
BIDCON_API_KEY=sua_chave_aqui
```

**Importante:** Configure para todos os ambientes (Production, Preview, Development)

### Passo 5: Deploy
1. Clique em "Deploy"
2. Aguarde o build completar
3. Acesse a URL fornecida pelo Vercel

---

## Opção 2: Deploy via Vercel CLI

### Instalação
```bash
npm install -g vercel
```

### Login
```bash
vercel login
```

### Deploy
```bash
# Deploy de preview
vercel

# Deploy de produção
vercel --prod
```

### Configurar Variáveis de Ambiente
```bash
vercel env add BIDCON_API_URL
vercel env add BIDCON_API_KEY
```

---

## ⚙️ Configurações do Projeto

### Arquivos de Configuração
- ✅ `vercel.json` - Configuração do Vercel
- ✅ `.env.example` - Exemplo de variáveis de ambiente
- ✅ `package.json` - Scripts de build otimizados

### Build Otimizado
- Build script atualizado para não depender do Prisma
- Região configurada: `gru1` (São Paulo)
- Framework: Next.js 14 (detectado automaticamente)

---

## 🔍 Verificação Pós-Deploy

Após o deploy, verifique:

1. ✅ Aplicação carrega corretamente
2. ✅ Todas as rotas funcionam (`/simulador`)
3. ✅ API routes respondem (`/api/bidcon/marketplace`)
4. ✅ Variáveis de ambiente configuradas
5. ✅ Build sem erros

---

## 📝 Notas Importantes

- **Prisma:** O projeto não depende do Prisma para funcionar. Se necessário, configure o `DATABASE_URL` no Vercel.
- **Cache:** O cache do BidCon é em memória e será resetado a cada restart do servidor.
- **Região:** Configurada para `gru1` (São Paulo) para melhor latência no Brasil.

---

## 🆘 Troubleshooting

### Build falha
- Verifique se todas as dependências estão no `package.json`
- Confirme que o Node.js versão 18+ está sendo usado
- Verifique os logs de build no Vercel

### Variáveis de ambiente não funcionam
- Certifique-se de que foram configuradas para o ambiente correto
- Faça um novo deploy após adicionar variáveis
- Verifique se os nomes estão corretos (case-sensitive)

### Erro 404 nas rotas
- Verifique se o `next.config.js` está correto
- Confirme que todas as rotas estão em `app/` (App Router)

---

## ✅ Checklist Final

- [ ] Repositório Git atualizado
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Build bem-sucedido
- [ ] Aplicação acessível
- [ ] Rotas API funcionando
- [ ] Integração BidCon testada
