# 🏘️ Personalização Específica - Promissão/SP

## 📍 Dados do Empreendimento

### Cidade Jardim - Promissão/SP

**Informações do Empreendimento:**
- **Nome:** Cidade Jardim
- **Localização:** Promissão/SP
- **Registro/Matrícula:** 13.410 – CRI Promissão
- **Status:** Aprovado
- **Tipo:** Loteamento Residencial e Residencial/Comercial
- **Área Total:** 84.579,51 m²
- **Total de Lotes:** 226
  - Residenciais: 219
  - Residencial/Comercial: 7

## 📊 Lotes Pré-Carregados

O sistema já vem com **22 lotes de exemplo** pré-carregados, representando:

### Distribuição dos Lotes

**Quadra A - Residencial (5 lotes):**
- LOTE-001 a LOTE-005
- Área: 280-320 m²
- Valor Mercado: R$ 140.000 - R$ 160.000
- Valor Venda Forçada: 70% do mercado

**Quadra B - Residencial (5 lotes):**
- LOTE-006 a LOTE-010
- Área: 325-360 m²
- Valor Mercado: R$ 162.875 - R$ 180.000
- Valor Venda Forçada: 70% do mercado

**Quadra C - Residencial (5 lotes):**
- LOTE-011 a LOTE-015
- Área: 375-400 m²
- Valor Mercado: R$ 187.625 - R$ 200.000
- Valor Venda Forçada: 70% do mercado

**Residencial/Comercial (7 lotes):**
- LOTE-RC-001 a LOTE-RC-007
- Área: 420-500 m²
- Valor Mercado: R$ 252.000 - R$ 300.000
- Valor Venda Forçada: 70% do mercado

### Estatísticas dos Lotes Carregados

- **Valor Total Mercado:** R$ 4.200.000+ (aproximado)
- **Valor Total Venda Forçada:** R$ 2.940.000+ (aproximado)
- **Valor Médio por Lote:** ~R$ 190.000
- **Área Média:** ~384 m²

## 💰 Valores de Referência - Promissão/SP

### Estrutura de Operação Típica

**Taxas e Custos:**
- **Taxa de Administração:** 1,2% a.a. (típico para região)
- **Fundo de Reserva:** 2,5% (padrão)
- **Seguro:** 0,5% (opcional)
- **Deságio:** 3,0% (deságio típico na venda do crédito)
- **Taxa de Intermediação:** 2,0%
- **Custos Iniciais:** R$ 5.000 (cartório, ITBI, comissões)

### Cenários para Promissão

**Conservador:**
- LTV: 60%
- Deságio: 5%
- Taxa: 1,5%
- Custos: 3,5%

**Base (Recomendado):**
- LTV: 70%
- Deságio: 3%
- Taxa: 1,2%
- Custos: 2,5%

**Agressivo:**
- LTV: 80%
- Deságio: 1,5%
- Taxa: 1,0%
- Custos: 2,0%

## 🏙️ Características do Mercado Promissão/SP

- **Região:** Interior de São Paulo
- **Mercado:** Imobiliário em crescimento
- **Localização:** Estratégica próxima a rodovias
- **Demanda:** Alta por lotes residenciais
- **Valorização:** Constante
- **Valor Médio m²:** ~R$ 500/m² (referência)
- **Tendência:** Alta

## 🎯 Funcionalidades Personalizadas

### 1. Card de Informações Promissão

Na aba **"Empreendimento"**, aparece automaticamente um card com:
- Localização: Promissão/SP
- Matrícula/Registro: 13.410
- Status: Aprovado
- Tipo: Loteamento Residencial e Residencial/Comercial
- Estatísticas do empreendimento
- Valores de referência dos lotes carregados

### 2. Lotes Pré-Carregados

Ao abrir o sistema, os lotes de Promissão já estão carregados:
- Não precisa importar Excel inicialmente
- Pode adicionar mais lotes via importação
- Pode editar os lotes existentes

### 3. Valores de Referência na Estrutura

Na aba **"Estrutura"**, há um botão:
- **"Usar Valores de Referência (Promissão)"**
- Preenche automaticamente com valores típicos da região
- Facilita o preenchimento inicial

### 4. Informações Contextuais

Em todas as abas relevantes:
- Títulos mostram "Promissão/SP"
- Cards informativos sobre o empreendimento
- Valores de referência baseados no mercado local

## 📝 Como Usar os Dados de Promissão

### Opção 1: Usar Lotes Pré-Carregados

1. Abra o simulador
2. Vá para aba **"Garantias"**
3. Os lotes já estão disponíveis
4. Selecione os lotes desejados
5. Veja o pool de garantia consolidada

### Opção 2: Importar Mais Lotes

1. Vá para aba **"Empreendimento"**
2. Clique em **"Importar Excel"**
3. Os novos lotes serão adicionados aos existentes
4. Todos os lotes ficam disponíveis para seleção

### Opção 3: Usar Valores de Referência

1. Vá para aba **"Estrutura"**
2. Clique em **"Usar Valores de Referência (Promissão)"**
3. Os campos serão preenchidos com valores típicos
4. Ajuste conforme necessário

## 🔄 Atualização dos Dados

Para atualizar os dados de Promissão:

1. Edite o arquivo: `data/promissao-lotes.ts`
2. Adicione ou modifique lotes
3. Ajuste valores de mercado
4. Os dados serão carregados automaticamente

## 📊 Exemplo de Operação Típica

### Cenário: Captação de R$ 500.000

**Usando lotes de Promissão:**

1. **Selecionar Lotes:**
   - Usar "Selecionar Mínimo Necessário"
   - Sistema seleciona automaticamente ~3-4 lotes
   - Valor total: ~R$ 750.000

2. **Configurar Estrutura:**
   - Crédito: R$ 500.000
   - Usar valores de referência (Promissão)
   - LTV: 70%

3. **Verificar Garantia:**
   - Pool consolidado: R$ 750.000
   - Limite permitido: R$ 525.000 (70%)
   - ✅ Cobre o saldo de R$ 500.000

4. **Calcular CET:**
   - Sistema calcula automaticamente
   - Considera taxas de Promissão
   - Mostra custo efetivo real

## 🎨 Personalizações Visuais

- Cards com informações específicas de Promissão
- Títulos contextualizados
- Valores de referência destacados
- Informações do mercado local

## 📌 Notas Importantes

1. **Lotes Pré-Carregados:**
   - São exemplos baseados em dados típicos
   - Podem ser substituídos por importação Excel
   - Valores podem ser ajustados manualmente

2. **Valores de Referência:**
   - Baseados em operações típicas da região
   - Podem ser ajustados conforme necessário
   - Servem como ponto de partida

3. **Mercado Promissão:**
   - Valores podem variar
   - Consulte avaliações atualizadas
   - Ajuste conforme mercado real

## 🚀 Próximos Passos

Para usar com dados reais:

1. **Substituir Lotes:**
   - Importe Excel com lotes reais
   - Ou edite `promissao-lotes.ts` com dados reais

2. **Ajustar Valores:**
   - Atualize valores de mercado
   - Ajuste taxas conforme negociação
   - Configure LTV conforme política

3. **Salvar Cenários:**
   - Teste diferentes combinações
   - Salve cenários de garantia
   - Compare e escolha o melhor
