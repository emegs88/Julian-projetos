# 💼 Modelo de Negócio - Captação com Consórcio Contemplado

## 🎯 Proposta de Valor Principal

### **"Você não precisa pagar antes. Você paga só quando levantar o crédito."**

## 📋 Como Funciona

### 1. **Sem Entrada Antecipada**
- Cliente **NÃO precisa pagar entrada** antes da aprovação
- Zero comprometimento de fluxo de caixa inicial
- Aprovação baseada apenas na garantia (lotes/veículos)

### 2. **Pagamento Condicional**
- Cliente **só começa a pagar** após:
  - Aprovação do crédito
  - Liberação do recurso
  - Recebimento do valor líquido

### 3. **Garantia Consolidada**
- Lotes do empreendimento (valor de mercado ou venda forçada)
- Veículos (130% da FIPE)
- Pool consolidado para cálculo de LTV

### 4. **Controle de Risco**
- LTV máximo configurável (ex: 70%)
- Sistema calcula automaticamente se a garantia cobre
- Alertas quando excede limites

## 💰 Fluxo Financeiro

### Antes (Modelo Tradicional)
```
1. Cliente paga entrada → R$ X
2. Cliente começa a pagar parcelas → R$ Y/mês
3. (Risco: pode pagar sem receber crédito)
4. Depois recebe crédito → R$ Z
```

### Agora (Nossa Proposta)
```
1. Cliente NÃO paga nada
2. Crédito é aprovado com base na garantia
3. Cliente recebe crédito líquido → R$ Z
4. Só então começa a pagar parcelas → R$ Y/mês
```

## 🏗️ Estrutura da Operação

### Entradas
- **Crédito Contemplado:** Valor total do consórcio
- **Valor Líquido:** Crédito - Entrada - Custos - Deságio - Intermediação

### Custos Detalhados
- **Documentação:** Cartório
- **Registro:** Cartório de Registro
- **ITBI:** Prefeitura/Receita Federal
- **Comissões:** Corretor/Intermediário
- **Outros:** Custos adicionais por item

### Saídas (Parcelas)
- **Parcela Mensal:** Valor fixo ou variável
- **Início:** Mês X (após aprovação)
- **Prazo:** N meses

## 🛡️ Garantias

### Lotes
- Valor de mercado ou venda forçada
- Seleção múltipla (pool consolidado)
- Cálculo de LTV automático

### Veículos
- **130% da FIPE** como garantia
- Cadastro completo (marca, modelo, ano, FIPE)
- Integração com pool de garantia

### LTV (Loan-to-Value)
- Limite máximo configurável (ex: 70%)
- Cálculo: `Limite = Valor Garantia × LTV`
- Validação: `Saldo Devedor ≤ Limite`

## 📊 Cálculos Automáticos

### Custo Efetivo Total (CET)
- Método: Newton-Raphson + Bisseção
- Encontra taxa onde NPV = 0
- Mostra CET mensal e anual

### Cronograma
- Saldo devedor mês a mês
- Juros e amortização
- Pico de saldo devedor

### Fluxo de Caixa
- Entradas e saídas por mês
- Saldo acumulado
- Visualização gráfica

## 🎨 Apresentação para Cliente

### Página `/apresentacao`
- Proposta de valor destacada
- Resumo executivo
- Diferencial: pagamento condicional
- Estrutura completa
- Garantias detalhadas
- Cronograma de pagamento
- CET calculado
- Exportação PDF

## 🔑 Diferenciais Competitivos

1. **Zero Risco para Cliente**
   - Não paga sem receber
   - Aprovação baseada em garantia real

2. **Flexibilidade**
   - Múltiplas cotas
   - Lotes + Veículos
   - Custos detalhados

3. **Transparência**
   - CET calculado por NPV=0
   - Todos os custos detalhados
   - Cronograma completo

4. **Controle**
   - LTV em tempo real
   - Alertas automáticos
   - Mínimo de garantia calculado

## 📝 Para Apresentar ao Cliente

1. Acesse `/apresentacao`
2. Configure a operação no simulador
3. Ative "Pagamento só após aprovado"
4. Configure garantias (lotes/veículos)
5. Calcule a operação
6. Exporte PDF da apresentação
7. Mostre ao cliente destacando:
   - **Sem entrada**
   - **Paga só após receber crédito**
   - **Garantia consolidada**
   - **CET real calculado**

## 🎯 Mensagem Principal

> **"Combinamos que você não paga consórcio antes. O pagamento só acontece após a aprovação e liberação do crédito. Você recebe primeiro, paga depois."**
