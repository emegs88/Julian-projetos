# 🚀 Instruções para Iniciar o Servidor

## ⚠️ Erro de Permissão na Porta 3000

Se você está vendo o erro `EPERM: operation not permitted`, siga estes passos:

## 📋 Solução Passo a Passo

### 1. Parar todos os processos do Next.js
```bash
pkill -f "next dev"
```

### 2. Liberar a porta 3000
```bash
lsof -ti:3000 | xargs kill -9
```

### 3. Limpar cache
```bash
rm -rf .next
rm -rf node_modules/.cache
```

### 4. Iniciar o servidor
```bash
npm run dev
```

## 🔄 Alternativa: Usar outra porta

Se a porta 3000 estiver bloqueada, você pode usar outra porta:

```bash
PORT=3001 npm run dev
```

Depois acesse: http://localhost:3001

## ✅ Verificação

Após iniciar, você deve ver no terminal:
```
✓ Ready in Xs
- Local: http://localhost:3000
```

## 🆘 Se ainda não funcionar

1. **Verifique se há outro servidor rodando:**
   ```bash
   lsof -i:3000
   ```

2. **Reinicie o terminal completamente**

3. **Tente usar uma porta diferente:**
   ```bash
   PORT=3001 npm run dev
   ```

4. **Verifique permissões:**
   ```bash
   chmod -R 755 .
   ```

## 📞 Próximos Passos

Após o servidor iniciar com sucesso:
1. Acesse: http://localhost:3000
2. Navegue para: http://localhost:3000/simulador
3. Teste todas as abas
