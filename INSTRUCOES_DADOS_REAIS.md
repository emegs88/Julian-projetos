# 📊 Instruções para Usar Dados Reais

## Situação Atual

O sistema está usando **dados de exemplo** (22 lotes) porque ainda não recebi os dados reais dos PDFs/Excel que você mencionou.

## O Que Preciso

Para usar os **dados reais** dos 226 lotes, preciso de:

### Opção 1: Arquivo Excel/CSV (Recomendado)

Envie um arquivo Excel ou CSV com os dados dos lotes no seguinte formato:

| ID | Matrícula | Área (m²) | Valor Mercado (R$) | Valor Venda Forçada (R$) | Observações |
|----|-----------|-----------|-------------------|------------------------|-------------|
| LOTE-001 | 13.410-1 | 300.50 | 150000 | 105000 | Quadra A - Residencial |
| LOTE-002 | 13.410-2 | 280.00 | 140000 | 98000 | Quadra A - Residencial |
| ... | ... | ... | ... | ... | ... |

**Total esperado: 226 lotes** (219 residenciais + 7 residencial/comercial)

### Opção 2: Dados dos PDFs

Se os dados estão em PDFs, você pode:
1. Exportar para Excel/CSV
2. Ou me enviar os PDFs e eu extraio os dados

## Como Processar

### Passo 1: Colocar o Arquivo
Coloque o arquivo Excel/CSV na pasta `/public/` com o nome `lotes-promissao.xlsx` ou `lotes-promissao.csv`

### Passo 2: Executar Script
```bash
npx ts-node scripts/importar-lotes-excel.ts
```

Ou se o arquivo estiver em outro lugar:
```bash
npx ts-node scripts/importar-lotes-excel.ts caminho/para/arquivo.xlsx
```

### Passo 3: Verificar
O script irá:
- ✅ Ler o arquivo Excel/CSV
- ✅ Processar todos os lotes
- ✅ Gerar o arquivo `data/promissao-lotes.ts` atualizado
- ✅ Calcular estatísticas automaticamente

## Dados de Veículos

Para veículos do "Catálogo Veículos 02.26.pdf":

**Opção A:** Cadastrar manualmente na aba "Veículos" do simulador

**Opção B:** Enviar Excel/CSV com:
- Marca
- Modelo
- Ano
- FIPE
- Placa (opcional)
- Chassi (opcional)

E eu crio um script similar para importar veículos.

## Formato Alternativo

Se o Excel tiver colunas diferentes, me avise quais são os nomes das colunas e eu ajusto o script.

## Próximos Passos

**Envie:**
1. ✅ Arquivo Excel/CSV com os 226 lotes, OU
2. ✅ Os PDFs/Excel originais para eu processar

Assim que receber, atualizo o sistema com os dados reais! 🚀
