# Formato Excel - Avaliação Lote Promissão

## 📋 Estrutura Esperada do Arquivo

O arquivo **"Avaliação Lote Promissão - Lotes.xlsx"** deve conter uma planilha com as seguintes colunas:

### Colunas Aceitas (Variações)

O sistema aceita múltiplas variações de nomes para cada coluna. Você pode usar qualquer uma das opções abaixo:

#### 1. Identificação do Lote
- `ID`, `id`, `Id`
- `Lote`, `lote`, `LOTE`
- `Código`, `codigo`, `Codigo`

#### 2. Matrícula
- `Matrícula`, `matricula`, `Matricula`
- `Matrícula do Lote`, `Matricula do Lote`
- `Número`, `numero`, `Numero`

#### 3. Área (m²)
- `Área`, `area`, `Area`
- `Área (m²)`, `Area (m2)`, `Área m²`
- `Metragem`, `metragem`

#### 4. Valor de Mercado
- `Valor Mercado`, `valor_mercado`, `ValorMercado`
- `Valor de Mercado`, `valor de mercado`
- `Valor`, `valor`, `Valor R$`
- `Avaliação`, `avaliacao`, `Avaliacao`

#### 5. Valor Venda Forçada (Opcional)
- `Valor Venda Forçada`, `valor_venda_forcada`, `ValorVendaForcada`
- `Venda Forçada`, `venda_forcada`, `VendaForcada`
- `Valor VF`, `valor_vf`
- **Se não informado**: será calculado como 70% do valor de mercado

#### 6. Observações (Opcional)
- `Observações`, `observacoes`, `Observacoes`
- `Obs`, `obs`
- `Observação`

## 📊 Exemplo de Estrutura

| ID | Matrícula | Área | Valor Mercado | Valor Venda Forçada | Observações |
|----|-----------|------|---------------|---------------------|-------------|
| LOTE-001 | 13.410-1 | 300.50 | 150000 | 105000 | Lote residencial |
| LOTE-002 | 13.410-2 | 250.00 | 200000 | 140000 | Corner lot |
| LOTE-003 | 13.410-3 | 350.75 | 180000 | 126000 | Vista para lago |

## ✅ Como Importar

1. Acesse a aba **"Empreendimento"** no simulador
2. Role até a seção **"Importar Excel de Avaliação"**
3. Clique em **"Selecionar Arquivo"**
4. Selecione o arquivo **"Avaliação Lote Promissão - Lotes.xlsx"**
5. Aguarde o processamento (os dados serão carregados automaticamente)
6. Verifique a tabela de lotes e as estatísticas calculadas

## 🔍 Validações Automáticas

Após a importação, o sistema calcula automaticamente:
- ✅ Valor médio por lote
- ✅ Percentis (P10, P50/P90)
- ✅ Somatório total de avaliação
- ✅ Estatísticas descritivas

## ⚠️ Dicas Importantes

1. **Primeira linha**: Deve conter os cabeçalhos das colunas
2. **Formato numérico**: Valores devem estar como números, não texto
3. **Separador decimal**: Aceita ponto (.) ou vírgula (,)
4. **Case-insensitive**: Não diferencia maiúsculas/minúsculas
5. **Acentos**: Aceita com ou sem acentos

## 🐛 Solução de Problemas

### Erro: "Erro ao processar arquivo"
- Verifique se o arquivo está no formato .xlsx
- Certifique-se de que a primeira linha contém os cabeçalhos
- Verifique se pelo menos as colunas obrigatórias estão presentes

### Dados não aparecem corretamente
- Verifique se os nomes das colunas estão corretos (consulte a lista acima)
- Certifique-se de que os valores numéricos estão formatados como números
- No Excel, selecione as colunas numéricas e formate como "Número"

### Valores aparecem como zero
- Verifique se os valores estão formatados como números, não como texto
- No Excel, selecione as colunas numéricas e formate como "Número"
- Remova qualquer formatação de texto (ex: "R$" antes do número)

## 📝 Notas

- O sistema é flexível e aceita várias variações de nomes de colunas
- Valores de venda forçada são opcionais (serão calculados automaticamente se ausentes)
- Observações são opcionais
- O sistema filtra automaticamente linhas vazias
