# 🚀 Deploy do Portal Captação

## 📋 Opções de Deploy

### 1. Vercel (Recomendado para Next.js)

A Vercel é a plataforma oficial do Next.js e oferece deploy automático.

#### Método 1: Via Interface Web

1. **Acesse:** https://vercel.com
2. **Faça login** com sua conta GitHub
3. **Clique em "Add New Project"**
4. **Importe o repositório:** `emegs88/Julian-projetos`
5. **Configure:**
   - Framework Preset: **Next.js** (detectado automaticamente)
   - Root Directory: `./` (raiz)
   - Build Command: `npm run build` (automático)
   - Output Directory: `.next` (automático)
6. **Clique em "Deploy"**

#### Método 2: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy (na pasta do projeto)
cd /Users/prospere/Desktop/Promissao-prospere
vercel

# Para produção
vercel --prod
```

### 2. Netlify

1. **Acesse:** https://app.netlify.com
2. **Conecte com GitHub**
3. **Selecione o repositório:** `emegs88/Julian-projetos`
4. **Configure:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Framework: Next.js

### 3. Railway

1. **Acesse:** https://railway.app
2. **Conecte com GitHub**
3. **New Project → Deploy from GitHub repo**
4. **Selecione:** `emegs88/Julian-projetos`
5. **Configure:**
   - Build Command: `npm run build`
   - Start Command: `npm start`

## ⚙️ Configurações Importantes

### Variáveis de Ambiente (se necessário)

Se precisar de variáveis de ambiente, configure na plataforma:

- **Vercel:** Settings → Environment Variables
- **Netlify:** Site settings → Environment variables
- **Railway:** Variables tab

### Domínio Personalizado

Após o deploy, você pode configurar um domínio personalizado:

- **Vercel:** Settings → Domains
- **Netlify:** Domain settings → Custom domains
- **Railway:** Settings → Domains

## 🔄 Deploy Automático

Todas as plataformas oferecem deploy automático:

- **Push para `main`** → Deploy automático
- **Pull Requests** → Preview deployments

## 📊 Verificar Deploy

Após o deploy, você receberá uma URL como:
- `https://julian-projetos.vercel.app`
- `https://julian-projetos.netlify.app`

## 🆘 Troubleshooting

### Erro de Build

Se houver erro de build, verifique:

```bash
# Testar build localmente
npm run build

# Se funcionar localmente, o problema pode ser:
# - Variáveis de ambiente faltando
# - Dependências não instaladas
# - Configuração incorreta
```

### Erro de Permissão

Se houver erro de permissão no GitHub:

1. Verifique se o repositório está público ou você tem acesso
2. Conecte a conta correta do GitHub na plataforma

## ✅ Checklist Pré-Deploy

- [x] Código no GitHub
- [x] `package.json` configurado
- [x] `next.config.js` configurado
- [x] `.gitignore` configurado
- [x] Build local funciona (`npm run build`)
- [ ] Variáveis de ambiente configuradas (se necessário)
- [ ] Domínio personalizado (opcional)

## 🎯 Próximos Passos

1. Escolha uma plataforma (recomendo Vercel)
2. Conecte o repositório GitHub
3. Configure e faça deploy
4. Acesse a URL fornecida
