# 🔍 Diagnóstico do Servidor

## ⚠️ Erro: Connection Failed / ERR_CONNECTION_REFUSED

Este erro aparece quando o servidor ainda está compilando ou não iniciou corretamente.

## ✅ Verificações

### 1. Verifique o Terminal onde `npm run dev` está rodando

Você deve ver algo como:

```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- Ready in Xs
```

**Se você ver erros de compilação:**
- Copie e me envie o erro completo
- Erros comuns:
  - `Module not found` → Falta importação
  - `Type error` → Erro de TypeScript
  - `Syntax error` → Erro de sintaxe

### 2. Aguarde a Compilação

A primeira compilação pode levar 30-60 segundos. Aguarde até ver:
```
✓ Ready in Xs
```

### 3. Se o Servidor Não Iniciar

Execute estes comandos no terminal:

```bash
# Parar tudo
pkill -f "next dev"
lsof -ti:3000 | xargs kill -9

# Limpar cache
rm -rf .next
rm -rf node_modules/.cache

# Iniciar novamente
npm run dev
```

### 4. Verificar se a Porta Está Livre

```bash
lsof -i:3000
```

Se mostrar processos, mate-os:
```bash
lsof -ti:3000 | xargs kill -9
```

### 5. Usar Outra Porta (Alternativa)

Se a porta 3000 estiver bloqueada:

```bash
PORT=3001 npm run dev
```

Depois acesse: http://localhost:3001

## 🆘 Próximos Passos

1. **Verifique o terminal** onde `npm run dev` está rodando
2. **Aguarde a compilação** terminar (pode levar até 1 minuto)
3. **Se houver erros**, me envie:
   - Screenshot do terminal
   - Mensagem de erro completa
4. **Se não houver erros**, aguarde até ver "✓ Ready"

## ✅ Quando Estiver Pronto

Você verá no terminal:
```
✓ Ready in Xs
- Local:        http://localhost:3000
```

Então acesse: **http://localhost:3000**
