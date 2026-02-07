# 📤 Como Subir para o GitHub

## ✅ Commit Realizado

O código foi commitado localmente. Agora você precisa:

## 🔗 Opção 1: Criar Repositório Novo no GitHub

1. **Acesse:** https://github.com/new
2. **Crie um novo repositório:**
   - Nome: `portal-captacao-consorcio` (ou outro nome)
   - Descrição: "Portal Captação – Consórcio Contemplado (LTV & Garantias)"
   - Público ou Privado (sua escolha)
   - **NÃO** marque "Initialize with README" (já temos arquivos)

3. **Depois de criar, execute no terminal:**

```bash
cd /Users/prospere/Desktop/Promissao-prospere

# Adicionar remote (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/portal-captacao-consorcio.git

# Fazer push
git branch -M main
git push -u origin main
```

## 🔗 Opção 2: Usar Repositório Existente

Se você já tem um repositório no GitHub:

```bash
cd /Users/prospere/Desktop/Promissao-prospere

# Adicionar remote (substitua pela URL do seu repositório)
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# Ou se já existe, atualizar:
git remote set-url origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# Fazer push
git branch -M main
git push -u origin main
```

## 🔐 Autenticação

Se pedir autenticação:
- **Token pessoal do GitHub** (recomendado)
- Ou use SSH: `git remote set-url origin git@github.com:SEU_USUARIO/REPOSITORIO.git`

## 📋 Verificar Status

```bash
# Ver remotes configurados
git remote -v

# Ver status
git status

# Ver commits
git log --oneline
```

## 🆘 Problemas Comuns

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/REPOSITORIO.git
```

### Erro: "failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## ✅ Após o Push

Seu código estará disponível em:
- `https://github.com/SEU_USUARIO/portal-captacao-consorcio`
