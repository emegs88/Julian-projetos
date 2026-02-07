# 🔧 Solução Definitiva para Erro 500

## ⚠️ Problema

O servidor está rodando mas retorna erro 500 devido a permissões no `node_modules`.

**Erro:** `Operation not permitted (os error 1)`

## ✅ Solução Passo a Passo

Execute estes comandos **no terminal** (não no Cursor):

```bash
# 1. Parar o servidor
pkill -9 -f "next dev"

# 2. Ir para o diretório
cd /Users/prospere/Desktop/Promissao-prospere

# 3. Limpar cache
rm -rf .next
rm -rf node_modules/.cache

# 4. Corrigir permissões de TODO o node_modules
chmod -R u+rw node_modules

# 5. Se ainda não funcionar, reinstalar dependências
rm -rf node_modules
npm install

# 6. Iniciar servidor
npm run dev
```

## 🔄 Alternativa: Reinstalar Tudo

Se o problema persistir:

```bash
cd /Users/prospere/Desktop/Promissao-prospere

# Remover tudo
rm -rf node_modules
rm -rf package-lock.json
rm -rf .next
rm -rf node_modules/.cache

# Reinstalar
npm install

# Corrigir permissões
chmod -R u+rw node_modules

# Iniciar
npm run dev
```

## 📋 Verificar se Funcionou

Após executar, você deve ver no terminal:

```
✓ Ready in Xs
- Local:        http://localhost:3000
```

E ao acessar http://localhost:3000, a página deve carregar **sem erro 500**.

## 🆘 Se Ainda Não Funcionar

1. **Verifique o terminal** - há mensagens de erro?
2. **Tente outra porta:**
   ```bash
   PORT=3001 npm run dev
   ```
   Depois acesse: http://localhost:3001

3. **Verifique permissões do diretório:**
   ```bash
   ls -la /Users/prospere/Desktop/Promissao-prospere
   ```

4. **Me envie:**
   - Screenshot do terminal com o erro
   - Resultado de: `ls -la node_modules/next/dist/client/components/router-reducer/`

## 💡 Dica

O problema é de permissões do sistema de arquivos. O comando `chmod -R u+rw node_modules` deve resolver, mas pode ser necessário executar com `sudo` se você não for o dono dos arquivos:

```bash
sudo chmod -R u+rw node_modules
```
