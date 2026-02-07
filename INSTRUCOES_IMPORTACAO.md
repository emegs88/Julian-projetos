# Instruções para Importação de Excel

## Formato do Arquivo

O arquivo Excel (.xlsx) deve conter uma planilha com as seguintes colunas:

### Colunas Obrigatórias

1. **ID** (ou `id`, `Id`)
   - Identificador único do lote
   - Exemplo: `LOTE-001`, `001`, `1`

2. **Matrícula** (ou `matricula`, `Matricula`)
   - Número da matrícula do lote
   - Exemplo: `12345`, `13.410`

3. **Área** (ou `area`, `Area`)
   - Área do lote em metros quadrados (m²)
   - Exemplo: `300.50`, `250`

4. **Valor Mercado** (ou `valor_mercado`, `ValorMercado`, `Valor Mercado`)
   - Valor de mercado do lote em reais
   - Exemplo: `150000`, `200000.50`

### Colunas Opcionais

5. **Valor Venda Forçada** (ou `valor_venda_forcada`, `ValorVendaForcada`, `Valor Venda Forçada`)
   - Valor de venda forçada do lote
   - Se não informado, será calculado como 70% do valor de mercado
   - Exemplo: `105000`, `140000`

6. **Observações** (ou `observacoes`, `Observacoes`)
   - Observações adicionais sobre o lote
   - Exemplo: `Lote com vista para o lago`, `Corner lot`

## Exemplo de Planilha

| ID | Matrícula | Área | Valor Mercado | Valor Venda Forçada | Observações |
|----|-----------|------|---------------|---------------------|-------------|
| LOTE-001 | 13.410-1 | 300.50 | 150000 | 105000 | Lote residencial |
| LOTE-002 | 13.410-2 | 250.00 | 200000 | 140000 | Corner lot |
| LOTE-003 | 13.410-3 | 350.75 | 180000 | 126000 | Vista para lago |

## Dicas

1. A primeira linha deve conter os cabeçalhos das colunas
2. Os nomes das colunas são case-insensitive (não diferencia maiúsculas/minúsculas)
3. Valores numéricos podem usar ponto ou vírgula como separador decimal
4. O arquivo deve estar no formato .xlsx (Excel 2007 ou superior)

## Processo de Importação

1. Acesse a aba "Empreendimento" no simulador
2. Clique em "Selecionar Arquivo" na seção "Importar Excel de Avaliação"
3. Selecione seu arquivo .xlsx
4. Aguarde o processamento (os dados serão carregados automaticamente)
5. Verifique a tabela de lotes e as estatísticas calculadas

## Solução de Problemas

### Erro: "Erro ao processar arquivo"
- Verifique se o arquivo está no formato .xlsx
- Certifique-se de que a primeira linha contém os cabeçalhos
- Verifique se pelo menos as colunas obrigatórias estão presentes

### Dados não aparecem corretamente
- Verifique se os nomes das colunas estão corretos (consulte a lista acima)
- Certifique-se de que os valores numéricos estão formatados corretamente
- Verifique se não há células vazias nas colunas obrigatórias

### Valores aparecem como zero
- Verifique se os valores estão formatados como números, não como texto
- No Excel, selecione as colunas numéricas e formate como "Número"
