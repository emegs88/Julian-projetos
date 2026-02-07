# 🔴 Seletor de Lotes com Junção - Pool de Garantia

## 📋 Visão Geral

Sistema completo de seleção múltipla de lotes que permite juntar vários lotes como uma **única garantia consolidada (pool)**. Nível banco.

## ✨ Funcionalidades Implementadas

### 1. **Tabela de Seleção Múltipla**

- ✅ Checkboxes para seleção individual
- ✅ Colunas: Lote, Matrícula, Área, Valor
- ✅ Destaque visual para lotes selecionados
- ✅ Clique na linha inteira para selecionar

### 2. **Botões de Ação**

- ✅ **Selecionar Todos**: Marca todos os lotes
- ✅ **Limpar Seleção**: Desmarca todos
- ✅ **Selecionar Mínimo Necessário**: Algoritmo inteligente que:
  - Ordena lotes por valor (maior → menor)
  - Soma até cobrir o saldo devedor pico
  - Seleciona automaticamente

### 3. **Painel Lateral - Pool de Garantia**

Mostra em tempo real:

- ✅ **Quantidade de lotes selecionados**
- ✅ **Valor total da garantia** (soma consolidada)
- ✅ **Valor médio** por lote
- ✅ **Área total** (soma de todas as áreas)
- ✅ **Número de matrículas** (únicas)
- ✅ **Maior lote** (valor mais alto)
- ✅ **Menor lote** (valor mais baixo)

### 4. **Junção Automática**

Quando o usuário seleciona vários lotes:

```javascript
poolGarantia = {
  quantidade: número de lotes,
  valorTotal: soma(valores selecionados),
  areaTotal: soma(áreas),
  numeroMatriculas: matrículas únicas,
  // ... outros cálculos
}
```

### 5. **Integração com LTV**

Cálculos automáticos:

- ✅ `limitePermitido = poolGarantia.valorTotal * LTV`
- ✅ Comparação com `saldoDevedorPico`
- ✅ Verificação: **Pool cobre?** ou **Falta garantia?**
- ✅ Cálculo de quanto falta em garantia adicional

### 6. **Visualização Visual**

- ✅ **Barra de cobertura** (progresso visual)
- ✅ **Gráfico de barras**: Saldo vs Limite
- ✅ **Cores dinâmicas**: Verde (cobre) / Vermelho (falta)
- ✅ **Percentual de cobertura** em tempo real

### 7. **Modo Junção**

Toggle para escolher:

- **Consolidado**: Todos os lotes como uma única garantia (pool)
- **Individual**: Cada lote tratado separadamente

### 8. **Salvar Cenários**

- ✅ Botão **"Salvar Cenário de Garantia"**
- ✅ Permite salvar múltiplos cenários:
  - Cenário 1
  - Cenário 2
  - Cenário 3
  - etc.
- ✅ Cada cenário salva:
  - Lotes selecionados
  - Valor total
  - Área total
  - Quantidade
  - Data de criação
- ✅ Botão **"Aplicar Cenário"** para restaurar
- ✅ Botão **"Remover"** para deletar

### 9. **Comparação de Cenários**

Visualização lado a lado dos cenários salvos com:
- Quantidade de lotes
- Valor total
- Área total
- Data de criação

## 🎯 Como Usar

### Passo 1: Ativar Modo Consolidado

1. Na aba **"Garantias"**
2. Ative o toggle **"Modo Junção Consolidada"**

### Passo 2: Selecionar Lotes

**Opção A - Manual:**
- Clique nos checkboxes ou nas linhas da tabela
- Selecione os lotes desejados

**Opção B - Automático:**
- Clique em **"Selecionar Mínimo Necessário"**
- O sistema seleciona automaticamente os lotes necessários

**Opção C - Todos:**
- Clique em **"Selecionar Todos"**

### Passo 3: Visualizar Pool

- O painel lateral mostra automaticamente:
  - Quantidade de lotes
  - Valor total consolidado
  - Estatísticas (média, maior, menor)

### Passo 4: Verificar Cobertura

- O sistema calcula automaticamente:
  - Limite permitido (LTV)
  - Se cobre o saldo
  - Quanto falta (se faltar)

### Passo 5: Salvar Cenário (Opcional)

1. Digite um nome para o cenário
2. Clique em **"Salvar Cenário"**
3. Compare diferentes cenários
4. Aplique o melhor cenário quando necessário

## 📊 Exemplo Prático

### Cenário: Precisa cobrir R$ 500.000 de saldo pico

**LTV: 70%**

1. **Selecionar Mínimo Necessário**
   - Sistema calcula: precisa de R$ 714.286 em garantia (500k / 0.7)
   - Ordena lotes por valor (maior primeiro)
   - Seleciona automaticamente os lotes até somar R$ 714.286+

2. **Resultado:**
   - 5 lotes selecionados
   - Valor total: R$ 750.000
   - Limite permitido: R$ 525.000 (70% de 750k)
   - ✅ **Cobre o saldo!**

3. **Salvar como "Cenário Base"**
   - Pode testar outros lotes
   - Comparar cenários
   - Aplicar o melhor

## 🔍 Algoritmo: Selecionar Mínimo Necessário

```javascript
1. Calcular valor necessário = saldoPico / (LTV / 100)
2. Ordenar lotes por valor (maior → menor)
3. Somar valores até >= valor necessário
4. Selecionar esses lotes automaticamente
```

## 💡 Casos de Uso

### Caso 1: Testar Diferentes Combinações
- Selecionar lotes manualmente
- Ver se cobre
- Salvar como "Cenário A"
- Testar outra combinação
- Salvar como "Cenário B"
- Comparar e escolher o melhor

### Caso 2: Encontrar Mínimo Rápido
- Clicar em "Selecionar Mínimo Necessário"
- Sistema encontra automaticamente
- Ajustar se necessário

### Caso 3: Usar Todos os Lotes
- Clicar em "Selecionar Todos"
- Ver valor total consolidado
- Verificar se cobre com folga

## 🎨 Interface Visual

### Cores e Status

- 🟢 **Verde**: Pool cobre o saldo (dentro do limite)
- 🔴 **Vermelho**: Falta garantia (excede limite)
- 🔵 **Azul**: Lote selecionado na tabela

### Gráficos

- **Barra de Cobertura**: Progresso visual do percentual
- **Gráfico de Barras**: Comparação Saldo vs Limite

## ⚠️ Validações

- ✅ Não permite salvar cenário sem lotes selecionados
- ✅ Alerta visual quando falta garantia
- ✅ Cálculo automático em tempo real
- ✅ Atualização instantânea ao selecionar/desselecionar

## 🚀 Próximas Melhorias (Opcional)

- [ ] Botão "Usar Todos os Lotes"
- [ ] Simulação de venda parcial
- [ ] Trava: não deixar saldo > garantia
- [ ] Exportar PDF com mapa de garantia
- [ ] Comparação visual entre cenários (gráfico)
- [ ] Importar/Exportar cenários

## 📝 Resposta à Pergunta

**Esses lotes serão usados como:**

**A) Garantia total do crédito** ✅ (Implementado)

O sistema trata os lotes selecionados como uma **garantia consolidada total** do crédito. Todos os lotes são somados e o LTV é aplicado sobre o valor total consolidado.

Para casos B (parcial por etapa) ou C (liberação por fases), seria necessário:
- Adicionar campos de "Etapa" ou "Fase" por lote
- Criar grupos de garantia por etapa
- Calcular LTV por etapa

**Quer que eu implemente também os casos B ou C?**
