# 🚀 Como Iniciar o Servidor

## ⚠️ Erro: ERR_CONNECTION_REFUSED

O servidor não está rodando. Siga estes passos:

## 📋 Método 1: Script Automático (Recomendado)

No terminal, execute:

```bash
cd /Users/prospere/Desktop/Promissao-prospere
./iniciar-servidor.sh
```

## 📋 Método 2: Manual

Execute estes comandos no terminal:

```bash
# 1. Ir para o diretório do projeto
cd /Users/prospere/Desktop/Promissao-prospere

# 2. Parar processos anteriores
pkill -9 -f "next dev"
lsof -ti:3000 | xargs kill -9

# 3. Limpar cache
rm -rf .next
rm -rf node_modules/.cache

# 4. Iniciar servidor
npm run dev
```

## ✅ O que você deve ver

Após executar, você verá no terminal:

```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- Ready in Xs
```

**Aguarde até aparecer "✓ Ready"** antes de acessar o navegador.

## 🌐 Acessar a Aplicação

Quando estiver pronto:

1. **Landing Page:** http://localhost:3000
2. **Simulador:** http://localhost:3000/simulador

## 🆘 Se Ainda Não Funcionar

### Verificar Erros de Compilação

Se aparecerem erros no terminal, copie e me envie:
- Mensagem de erro completa
- Stack trace (se houver)

### Erros Comuns

1. **Module not found**
   - Execute: `npm install`

2. **Porta 3000 em uso**
   - Execute: `lsof -ti:3000 | xargs kill -9`
   - Ou use outra porta: `PORT=3001 npm run dev`

3. **Erro de TypeScript**
   - Verifique se há erros de tipo nos arquivos

## 📞 Próximos Passos

1. Execute o script `./iniciar-servidor.sh` ou os comandos manuais
2. Aguarde a compilação terminar
3. Acesse http://localhost:3000
4. Se houver erros, me envie a mensagem completa
