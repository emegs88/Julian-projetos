# Processamento de Planilhas de Precificação

## 📊 Formato de Planilhas de Avaliação/Precificação

O sistema agora suporta planilhas de precificação no formato de laudo de avaliação (como "PRECIFICAÇÃO - MÉTODO COMPARATIVO DIRETO DE MERCADO").

### Estrutura Reconhecida

O sistema detecta automaticamente os seguintes campos em planilhas de precificação:

#### 1. Área do Terreno
**Colunas aceitas:**
- `Área`, `area`, `Area`
- `Área (m²)`, `Area (m2)`, `Área m²`
- `A. Terreno (m²)`, `A Terreno`, `Área Terreno`
- `Metragem`, `metragem`
- `Área Terreno (m2)`, `Area Terreno (m2)`

#### 2. Valor de Mercado
**Colunas aceitas:**
- `Valor Mercado`, `valor_mercado`, `ValorMercado`
- `Valor de Mercado`, `valor de mercado`
- `Total Mercado`, `total mercado`, `TotalMercado`
- `Valor`, `valor`, `Valor R$`
- `Avaliação`, `avaliacao`, `Avaliacao`
- `Valor/m²`, `Valor/m2` (será multiplicado pela área se fornecido)
- `R$/m2`, `R$/m²` (será multiplicado pela área se fornecido)

#### 3. Valor de Venda Forçada
**Colunas aceitas:**
- `Valor Venda Forçada`, `valor_venda_forcada`, `ValorVendaForcada`
- `Venda Forçada`, `venda_forcada`, `VendaForcada`
- `Total Venda Forçada`, `total venda forçada`, `TotalVendaForcada`
- `Preço de Venda Forçada`, `preço de venda forçada`
- `Valor VF`, `valor_vf`
- `Valor/m² VF`, `Valor/m2 VF` (será multiplicado pela área se fornecido)

**Se não informado:** Será calculado automaticamente como 70% do valor de mercado.

## 🔄 Processamento Automático

### Detecção de Formato

O sistema tenta automaticamente:

1. **Formato Lista de Lotes** (padrão)
   - Planilha com múltiplas linhas, cada uma representando um lote
   - Primeira linha contém cabeçalhos
   - Exemplo: "Avaliação Lote Promissão - Lotes.xlsx"

2. **Formato Laudo de Precificação**
   - Planilha com dados de avaliação individual
   - Pode conter múltiplas seções (Dados Ativo, Anúncios, etc.)
   - O sistema extrai automaticamente os valores relevantes

3. **Múltiplas Abas**
   - Se a primeira aba não contiver dados, o sistema tenta outras abas automaticamente

### Conversão de Valores

O sistema processa valores formatados automaticamente:
- Remove formatação BRL (R$, pontos, vírgulas)
- Converte vírgula para ponto decimal
- Aceita valores como número ou texto formatado
- Multiplica `R$/m²` pela área quando necessário

## 📋 Exemplo: Planilha de Precificação

Baseado na estrutura da planilha "PRECIFICAÇÃO - MÉTODO COMPARATIVO DIRETO DE MERCADO":

### Dados Extraídos

Se a planilha contiver:
- **Área:** 160,00 m²
- **Valor Mercado:** R$ 423,32/m² (Total: R$ 67.731,22)
- **Valor Venda Forçada:** R$ 296,32/m² (Total: R$ 47.411,86)

O sistema processará como:
```javascript
{
  id: "LOTE-1",
  matricula: "",
  area: 160.00,
  valorMercado: 67731.22,
  valorVendaForcada: 47411.86,
  observacoes: ""
}
```

## ✅ Validações

O sistema valida automaticamente:
- ✅ Área deve ser um número positivo (50-10000 m²)
- ✅ Valor de mercado deve ser > R$ 10.000
- ✅ Valor de venda forçada não pode ser maior que valor de mercado
- ✅ Se valor/m² for fornecido, multiplica pela área automaticamente

## 🎯 Casos de Uso

### 1. Importar Lista de Lotes
- Planilha com múltiplos lotes
- Cada linha = um lote
- Colunas padronizadas

### 2. Importar Laudo de Avaliação
- Planilha de precificação individual
- Sistema extrai área e valores automaticamente
- Pode processar múltiplos laudos se estiverem em formato tabular

### 3. Importar de Múltiplas Abas
- Planilha com dados em diferentes abas
- Sistema tenta todas as abas até encontrar dados

## 🔧 Melhorias Implementadas

1. ✅ Parser mais robusto para diferentes formatos
2. ✅ Detecção automática de formato (lista vs. laudo)
3. ✅ Suporte para valores formatados (R$, vírgulas, pontos)
4. ✅ Cálculo automático de valor total quando fornecido valor/m²
5. ✅ Processamento de múltiplas abas
6. ✅ Validação automática de dados

## 📝 Notas Importantes

- O sistema é **case-insensitive** (não diferencia maiúsculas/minúsculas)
- Aceita valores com ou sem formatação
- Converte automaticamente vírgula para ponto decimal
- Se valor/m² for fornecido, multiplica pela área para obter valor total
- Valor de venda forçada padrão: 70% do valor de mercado (se não informado)
