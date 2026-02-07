# Início Rápido

## 🚀 Passos para Iniciar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Rodar em desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acessar o app:**
   Abra [http://localhost:3000](http://localhost:3000) no navegador

## 📋 Checklist de Funcionalidades

### ✅ Implementado

- [x] Landing page inspirada no Prospere
- [x] Página do simulador com abas
- [x] Aba Empreendimento (dados pré-preenchidos + importação Excel)
- [x] Aba Estrutura da Operação (cálculos de fluxo de caixa)
- [x] Aba Garantias (LTV, seleção de lotes, mínimo necessário)
- [x] Aba Custo Efetivo (solver Newton-Raphson + Bisseção)
- [x] Aba Gráficos (Recharts + exportação PDF/CSV)
- [x] Solver robusto de IRR/NPV
- [x] Cálculo de saldo devedor e pico
- [x] Validações e alertas LTV
- [x] Design system completo (botões, inputs, cards, alertas)

## 🎯 Funcionalidades Principais

### 1. Empreendimento
- Dados "Cidade Jardim - Promissão/SP" pré-preenchidos
- Importação de Excel com mapeamento automático de colunas
- Estatísticas automáticas (média, P10, P50, P90)

### 2. Estrutura da Operação
- Configuração completa de crédito, entrada, taxas, prazos
- Cálculo automático de valor líquido
- Suporte para pagamento condicional (após aprovação)
- Cronograma mês a mês

### 3. Garantias (LTV)
- Seleção múltipla de lotes
- Cálculo de LTV em tempo real
- Alerta visual quando excede limite
- Cálculo de quantidade mínima de matrículas

### 4. Custo Efetivo
- Solver Newton-Raphson com fallback Bisseção
- CET mensal e anual
- Visualização do fluxo de caixa

### 5. Gráficos & Relatórios
- Fluxo de caixa (barras)
- Saldo devedor vs Limite (linhas)
- Comparação com CDI (simulação)
- Exportação PDF e CSV

## 📊 Importação Excel

Consulte `INSTRUCOES_IMPORTACAO.md` para detalhes sobre o formato esperado.

## 🔧 Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Zustand
- xlsx
- jsPDF + html2canvas

## 📝 Próximos Passos (Opcional)

- Adicionar mais validações
- Implementar cenários comparáveis (Conservador/Base/Agressivo)
- Melhorar exportação PDF
- Adicionar testes unitários

## ⚠️ Notas Importantes

- O solver de IRR é robusto e trata casos extremos
- Os cálculos são feitos em tempo real conforme você preenche os dados
- Os alertas aparecem automaticamente quando há problemas (ex: LTV excedido)
- O formato de números segue o padrão brasileiro (R$ e %)
