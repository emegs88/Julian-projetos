# ⚡ Comandos Rápidos para Resolver o Problema

## 🚨 Problema: Porta 3000 em Uso

A porta 3000 está sendo usada por outros processos. Siga estes passos:

## 📝 Solução Manual (Copie e Cole no Terminal)

```bash
# 1. Parar todos os processos do Next.js
pkill -f "next dev"

# 2. Matar processos na porta 3000
lsof -ti:3000 | xargs kill -9

# 3. Limpar cache
rm -rf .next
rm -rf node_modules/.cache

# 4. Iniciar servidor
npm run dev
```

## 🎯 Solução Automática

Execute o script que criei:

```bash
./iniciar.sh
```

Ou se não tiver permissão:

```bash
bash iniciar.sh
```

## 🔄 Alternativa: Usar Outra Porta

Se a porta 3000 continuar bloqueada:

```bash
PORT=3001 npm run dev
```

Depois acesse: **http://localhost:3001**

## ✅ Verificação

Após executar, você deve ver:
```
✓ Ready in Xs
- Local: http://localhost:3000
```

## 🆘 Se Ainda Não Funcionar

1. **Feche todos os terminais e abra um novo**
2. **Execute os comandos acima novamente**
3. **Tente usar a porta 3001:**
   ```bash
   PORT=3001 npm run dev
   ```
