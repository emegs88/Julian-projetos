# 📊 Processamento de Dados Reais

## Status Atual

Atualmente o sistema está usando **dados de exemplo** (22 lotes) no arquivo `data/promissao-lotes.ts`.

O empreendimento real tem:
- **226 lotes totais**
- **219 lotes residenciais**
- **7 lotes residencial/comercial**

## Como Adicionar Dados Reais

### Opção 1: Arquivo Excel/CSV

Se você tiver um arquivo Excel ou CSV com os dados reais dos lotes, siga este formato:

**Colunas necessárias:**
- ID do Lote (ex: LOTE-001)
- Matrícula (ex: 13.410-1)
- Área (m²)
- Valor de Mercado (R$)
- Valor de Venda Forçada (R$)
- Observações (opcional)

**Exemplo:**
```
ID,Matrícula,Área,Valor Mercado,Valor Venda Forçada,Observações
LOTE-001,13.410-1,300.50,150000,105000,Quadra A - Residencial
LOTE-002,13.410-2,280.00,140000,98000,Quadra A - Residencial
...
```

### Opção 2: Atualizar Manualmente

Você pode editar diretamente o arquivo `data/promissao-lotes.ts` e adicionar todos os 226 lotes.

### Opção 3: Script de Importação

Posso criar um script que processa um arquivo Excel/CSV e gera o arquivo TypeScript automaticamente.

## Dados de Veículos

Para veículos, você pode:
1. Cadastrar manualmente na aba "Veículos" do simulador
2. Usar a API `/api/veiculos` para importar em lote
3. Criar um arquivo de dados similar ao de lotes

## Próximos Passos

**Me envie:**
1. Arquivo Excel/CSV com os dados reais dos 226 lotes, OU
2. Confirme se quer que eu crie um script para processar automaticamente

Assim que tiver os dados reais, atualizo o sistema para usar todos os 226 lotes!
