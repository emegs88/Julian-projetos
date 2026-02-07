# Funcionalidade: Múltiplas Cotas de Consórcio

## 📋 Visão Geral

A funcionalidade de **Múltiplas Cotas** permite gerenciar e agrupar várias cotas de consórcio contempladas, calculando automaticamente os totais de crédito, parcelas mensais e saldo devedor.

## 🎯 Funcionalidades

### 1. Gerenciamento de Cotas

Na aba **"Cotas"**, você pode:

- ✅ **Ativar/Desativar** o modo de múltiplas cotas
- ✅ **Adicionar** novas cotas de consórcio
- ✅ **Editar** informações de cada cota
- ✅ **Remover** cotas cadastradas
- ✅ **Visualizar resumo** dos totais

### 2. Campos por Cota

Cada cota possui os seguintes campos:

- **Grupo**: Número do grupo de consórcio (ex: 12345)
- **Cota**: Número da cota (ex: 001)
- **Crédito**: Valor do crédito contemplado
- **Parcela Mensal**: Valor da parcela mensal
- **Saldo Devedor**: Saldo devedor atual da cota
- **Prazo**: Prazo em meses
- **Observações**: Notas adicionais sobre a cota

### 3. Cálculos Automáticos

O sistema calcula automaticamente:

- **Crédito Total**: Soma de todos os créditos das cotas
- **Parcela Mensal Total**: Soma de todas as parcelas mensais
- **Saldo Devedor Total**: Soma de todos os saldos devedores
- **Quantidade de Cotas**: Número total de cotas cadastradas

### 4. Integração com Estrutura

- Os totais calculados podem ser **aplicados automaticamente** à estrutura da operação
- A aba "Estrutura" mostra um resumo quando múltiplas cotas estão ativas
- Os cálculos de fluxo de caixa e CET consideram os totais das cotas

## 📊 Como Usar

### Passo 1: Ativar Múltiplas Cotas

1. Acesse a aba **"Cotas"** no simulador
2. Ative o toggle **"Usar múltiplas cotas (junção de várias cotas)"**

### Passo 2: Adicionar Cotas

1. Clique em **"Adicionar Cota"**
2. Preencha os campos:
   - Grupo e número da cota
   - Crédito contemplado
   - Parcela mensal
   - Saldo devedor
   - Prazo (opcional)
   - Observações (opcional)

### Passo 3: Visualizar Totais

- O resumo dos totais aparece automaticamente acima da lista de cotas
- Os valores são atualizados em tempo real conforme você edita as cotas

### Passo 4: Aplicar à Estrutura

1. Clique em **"Aplicar Totais à Estrutura"**
2. Os valores totais serão copiados para a aba "Estrutura"
3. Você pode ajustar manualmente se necessário

### Passo 5: Calcular Operação

1. Vá para a aba **"Estrutura"**
2. Complete os demais campos (taxas, prazos, etc.)
3. O sistema calculará automaticamente:
   - Valor líquido disponível
   - Cronograma de saldo devedor
   - Fluxo de caixa
   - CET (Custo Efetivo Total)

## 💡 Exemplo de Uso

### Cenário: 3 Cotas de Consórcio

**Cota 1:**
- Grupo: 12345
- Cota: 001
- Crédito: R$ 200.000
- Parcela: R$ 2.500
- Saldo Devedor: R$ 180.000

**Cota 2:**
- Grupo: 12345
- Cota: 002
- Crédito: R$ 150.000
- Parcela: R$ 1.800
- Saldo Devedor: R$ 135.000

**Cota 3:**
- Grupo: 67890
- Cota: 001
- Crédito: R$ 100.000
- Parcela: R$ 1.200
- Saldo Devedor: R$ 90.000

**Totais Calculados:**
- Crédito Total: R$ 450.000
- Parcela Mensal Total: R$ 5.500
- Saldo Devedor Total: R$ 405.000

## 🔄 Fluxo de Trabalho

```
1. Cadastrar Cotas (Aba "Cotas")
   ↓
2. Visualizar Totais
   ↓
3. Aplicar à Estrutura (opcional)
   ↓
4. Configurar Operação (Aba "Estrutura")
   ↓
5. Calcular Garantias (Aba "Garantias")
   ↓
6. Ver CET e Gráficos (Abas "CET" e "Gráficos")
```

## ⚠️ Observações Importantes

1. **Modo Único vs. Múltiplas Cotas:**
   - Quando múltiplas cotas estão **desativadas**: Use a aba "Estrutura" normalmente
   - Quando múltiplas cotas estão **ativadas**: Gerencie as cotas na aba "Cotas"

2. **Valores Manuais:**
   - Você pode editar manualmente os valores na aba "Estrutura" mesmo com múltiplas cotas ativas
   - Os totais das cotas servem como referência

3. **Cálculos:**
   - Todos os cálculos (fluxo de caixa, CET, LTV) consideram os valores da estrutura
   - Se você aplicar os totais das cotas, os cálculos usarão esses valores

4. **Exportação:**
   - Os relatórios PDF e CSV incluem informações sobre as cotas quando aplicável

## 🎨 Interface

- **Cards individuais** para cada cota
- **Resumo visual** dos totais
- **Botões de ação** (Adicionar, Remover, Aplicar)
- **Alertas informativos** sobre o modo ativo
- **Integração visual** entre as abas

## 📝 Próximas Melhorias (Opcional)

- Importação de cotas via Excel
- Exportação da lista de cotas
- Histórico de alterações
- Comparação entre cenários com diferentes combinações de cotas
- Gráficos específicos por cota
