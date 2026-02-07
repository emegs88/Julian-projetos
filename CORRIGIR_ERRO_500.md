# 🔧 Corrigir Erro 500 - Operation not permitted

## ⚠️ Problema

O servidor está rodando mas retorna erro 500 devido a permissões no `node_modules`.

## ✅ Solução

Execute estes comandos no terminal:

```bash
# 1. Parar o servidor
pkill -9 -f "next dev"

# 2. Ir para o diretório
cd /Users/prospere/Desktop/Promissao-prospere

# 3. Limpar tudo
rm -rf .next
rm -rf node_modules/.cache

# 4. Reinstalar dependências (se necessário)
npm install

# 5. Corrigir permissões
chmod -R u+rw node_modules

# 6. Iniciar servidor
npm run dev
```

## 🔄 Alternativa: Reinstalar node_modules

Se o problema persistir, reinstale as dependências:

```bash
cd /Users/prospere/Desktop/Promissao-prospere
rm -rf node_modules
rm -rf package-lock.json
npm install
npm run dev
```

## 📋 Verificar se Funcionou

Após executar, você deve ver:

```
✓ Ready in Xs
- Local:        http://localhost:3000
```

E ao acessar http://localhost:3000, deve carregar a página sem erro 500.

## 🆘 Se Ainda Não Funcionar

1. Verifique se há erros no terminal
2. Tente usar outra porta: `PORT=3001 npm run dev`
3. Me envie a mensagem de erro completa
